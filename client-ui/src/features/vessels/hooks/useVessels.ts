import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import { apiGetVesselTypes } from "../../vesselsTypes/services/vesselTypeService";
import { mapVesselTypeDto } from "../../vesselsTypes/mappers/vesselTypeMapper";
import type { VesselType } from "../../vesselsTypes/domain/vesselType";

import {
    apiCreateVessel,
    apiGetVesselById,
    apiGetVesselByIMO,
    apiGetVesselByOwner,
    apiGetVessels,
    apiPatchVesselByIMO
} from "../services/vesselService";

import { mapVesselDto } from "../mappers/vesselMapper";
import type { Vessel, CreateVesselRequest, UpdateVesselRequest } from "../domain/vessel";

type SearchMode = "local" | "imo" | "id" | "owner";

const IMO_REGEX = /^\d{7}$/;
const GUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
const MIN_LOADING_TIME = 500;

export function useVessels() {
    const { t } = useTranslation();

    const [items, setItems] = useState<Vessel[]>([]);
    const [filtered, setFiltered] = useState<Vessel[]>([]);
    const [loading, setLoading] = useState(true);

    const [vesselTypes, setVesselTypes] = useState<VesselType[]>([]);
    const [selected, setSelected] = useState<Vessel | null>(null);

    const [searchMode, setSearchMode] = useState<SearchMode>("local");
    const [searchValue, setSearchValue] = useState("");

    const [form, setForm] = useState<CreateVesselRequest>({
        imoNumber: "",
        name: "",
        owner: "",
        vesselTypeName: "",
    });

    const [editIMO, setEditIMO] = useState<string | null>(null);
    const [editData, setEditData] = useState<UpdateVesselRequest>({});

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isStatsOpen, setIsStatsOpen] = useState(false);

    const val = (x: any) => (typeof x === "string" ? x : x?.value);

    async function runWithLoading<T>(promise: Promise<T>, text: string) {
        const id = toast.loading(text);
        const start = Date.now();
        try {
            return await promise;
        } finally {
            const elapsed = Date.now() - start;
            if (elapsed < MIN_LOADING_TIME)
                await new Promise(res => setTimeout(res, MIN_LOADING_TIME - elapsed));
            toast.dismiss(id);
        }
    }

    // load inicial
    useEffect(() => {
        async function load() {
            try {
                const dataDto = await runWithLoading(apiGetVessels(), t("Vessel.messages.loading"));
                const data = dataDto.map(mapVesselDto);

                setItems(data);
                setFiltered(data);
                toast.success(t("Vessel.messages.searchSuccess", { count: data.length }));

                const typesDto = await runWithLoading(
                    apiGetVesselTypes(),
                    t("Vessel.messages.loading")
                );
                const types = typesDto.map(mapVesselTypeDto);
                setVesselTypes(types);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [t]);

    function getVesselTypeNameById(vesselTypeId: any) {
        const id = vesselTypeId?.value ?? vesselTypeId;
        const type = vesselTypes.find(t => t.id === id);
        return type?.name ?? "Unknown";
    }

    // stats para o gráfico
    const vesselTypeCounts = useMemo(
        () =>
            vesselTypes.map(type => {
                const count = items.filter(v => {
                    const id = typeof v.vesselTypeId === "string"
                        ? v.vesselTypeId
                        : v.vesselTypeId.value;
                    return id === type.id;
                }).length;

                return { name: type.name, count };
            }),
        [items, vesselTypes]
    );

    // SEARCH
    async function executeSearch() {
        if (!searchValue.trim()) {
            setFiltered(items);
            return;
        }

        const q = searchValue.toLowerCase();

        if (searchMode === "local") {
            const results = items.filter(v =>
                v.name.toLowerCase().includes(q) ||
                v.owner.toLowerCase().includes(q) ||
                val(v.imoNumber)?.toLowerCase().includes(q)
            );

            setFiltered(results);
            toast.success(t("Vessel.messages.searchSuccess", { count: results.length }));
            return;
        }

        // GUID
        if (searchMode === "id" && !GUID_REGEX.test(searchValue)) {
            toast.error("Invalid ID format. Please enter a valid GUID.");
            return;
        }

        // IMO
        if (searchMode === "imo" && !IMO_REGEX.test(searchValue)) {
            toast.error(t("Vessel.messages.invalidIMO"));
            return;
        }

        let apiPromise: Promise<Vessel[]>;

        if (searchMode === "imo") {
            apiPromise = apiGetVesselByIMO(searchValue).then(v => [mapVesselDto(v)]);
        } else if (searchMode === "id") {
            apiPromise = apiGetVesselById(searchValue).then(v => [mapVesselDto(v)]);
        } else {
            apiPromise = apiGetVesselByOwner(searchValue).then(arr => arr.map(mapVesselDto));
        }

        const result = await runWithLoading(apiPromise, t("Vessel.messages.loading"))
            .catch(() => null);

        if (!result || result.length === 0) {
            setFiltered([]);
            toast.error(t("Vessel.messages.noResults"));
            return;
        }

        setFiltered(result);
        toast.success(t("Vessel.messages.searchSuccess", { count: result.length }));
    }

    // CREATE
    async function handleCreate() {
        if (!IMO_REGEX.test(form.imoNumber))
            return toast.error(t("Vessel.messages.invalidIMO"));

        if (!form.name.trim() || !form.owner.trim() || !form.vesselTypeName.trim())
            return toast.error(t("Vessel.messages.fillAll"));

        const created = await runWithLoading(
            apiCreateVessel(form),
            t("Vessel.modal.addTitle")
        ).catch(() => null);

        if (!created) return;

        const dataDto = await apiGetVessels();
        const data = dataDto.map(mapVesselDto);

        toast.success(t("Vessel.messages.created"));
        setItems(data);
        setFiltered(data);
        setIsCreateOpen(false);

        setForm({ imoNumber: "", name: "", owner: "", vesselTypeName: "" });
    }

    // EDIT
    async function handleSaveEdit() {
        if (!editIMO) return;

        const payload: UpdateVesselRequest = {};
        if (editData.name?.trim()) payload.name = editData.name.trim();
        if (editData.owner?.trim()) payload.owner = editData.owner.trim();

        if (!payload.name && !payload.owner)
            return toast.error(t("Vessel.messages.fillAll"));

        const updated = await runWithLoading(
            apiPatchVesselByIMO(editIMO, payload),
            t("Vessel.modal.editTitle")
        ).catch(() => null);

        if (!updated) return;

        toast.success(t("Vessel.messages.updated"));

        const dataDto = await apiGetVessels();
        const data = dataDto.map(mapVesselDto);

        setItems(data);
        setFiltered(data);
        setIsEditOpen(false);
        setEditIMO(null);
    }

    return {
        // data
        items,
        filtered,
        loading,
        vesselTypes,
        vesselTypeCounts,

        // seleção
        selected,
        setSelected,

        // search
        searchMode,
        setSearchMode,
        searchValue,
        setSearchValue,
        executeSearch,

        // create
        form,
        setForm,
        handleCreate,
        isCreateOpen,
        setIsCreateOpen,

        // edit
        editData,
        setEditData,
        handleSaveEdit,
        isEditOpen,
        setIsEditOpen,
        setEditIMO,

        // stats modal
        isStatsOpen,
        setIsStatsOpen,

        // helpers
        getVesselTypeNameById,
        val,
    };
}
