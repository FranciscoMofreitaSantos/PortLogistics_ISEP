import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import type { VesselType } from "../domain/vesselType";
import {
    apiGetVesselTypes,

} from "../services/vesselTypeService";
import {
    mapVesselTypeDto,
} from "../mappers/vesselTypeMapper";

const MIN_LOADING_TIME = 800;

async function runWithLoading<T>(promise: Promise<T>, loadingText: string) {
    const id = toast.loading(loadingText);
    const start = Date.now();

    try {
        const result = await promise;
        return result;
    } finally {
        const elapsed = Date.now() - start;
        if (elapsed < MIN_LOADING_TIME) {
            await new Promise((res) => setTimeout(res, MIN_LOADING_TIME - elapsed));
        }
        toast.dismiss(id);
    }
}

export function useVesselTypes() {
    const { t } = useTranslation();
    const [items, setItems] = useState<VesselType[]>([]);
    const [filtered, setFiltered] = useState<VesselType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        runWithLoading(apiGetVesselTypes(), t("vesselTypes.loading"))
            .then((dtos) => {
                const list = dtos.map(mapVesselTypeDto);
                setItems(list);
                setFiltered(list);
                toast.success(t("vesselTypes.loadSuccess", { count: list.length }));
            })
            .finally(() => setLoading(false));
    }, [t]);

    // aqui podem entrar search, create, update, delete, etc.
    async function reload() {
        const dtos = await apiGetVesselTypes();
        const list = dtos.map(mapVesselTypeDto);
        setItems(list);
        setFiltered(list);
    }

    return {
        items,
        filtered,
        setFiltered,
        loading,
        reload,
        runWithLoading,
    };
}
