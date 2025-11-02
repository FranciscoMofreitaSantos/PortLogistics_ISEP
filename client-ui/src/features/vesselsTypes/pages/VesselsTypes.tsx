import { useEffect, useState } from "react";
import {
    getVesselTypes,
    getVesselTypesByID,
    getVesselTypesByName,
    updateVesselType,
    deleteVesselType,
    createVesselType
} from "../services/vesselTypeService";

import type { VesselType } from "../types/vesselType";

import {notifySuccess } from "../../../utils/notify";
import "../style/vesselTypeList.css";

import { FaShip, FaTimes } from "react-icons/fa";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

export default function VesselTypeList() {
    const [items, setItems] = useState<VesselType[]>([]);
    const [filtered, setFiltered] = useState<VesselType[]>([]);
    const [selected, setSelected] = useState<VesselType | null>(null);
    const [loading, setLoading] = useState(true);
    const [editModel, setEditModel] = useState<VesselType | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    // === CREATE MODAL STATES ===
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [maxBays, setMaxBays] = useState<number>(10);
    const [maxRows, setMaxRows] = useState<number>(10);
    const [maxTiers, setMaxTiers] = useState<number>(10);
    const [searchMode, setSearchMode] = useState<"local" | "id" | "name">("local");
    const [searchValue, setSearchValue] = useState("");
    const { t } = useTranslation();


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
                await new Promise(res => setTimeout(res, MIN_LOADING_TIME - elapsed));
            }
            toast.dismiss(id);
        }
    }




    useEffect(() => {
        runWithLoading(getVesselTypes(), t("vesselTypes.loading"))
            .then(data => {
                setItems(data);
                setFiltered(data);
                notifySuccess(t("vesselTypes.loadSuccess", { count: data.length }));
            })
            .finally(() => setLoading(false));
    }, [t]);


    const executeSearch = async () => {
        if (!searchValue.trim()) {
            setFiltered(items);
            return;
        }

        // --- Validate GUID when searching by ID ---
        if (searchMode === "id") {
            const guidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

            if (!guidRegex.test(searchValue)) {
                toast.error("Invalid ID format. Please enter a valid GUID.");
                return;
            }
        }

        // Local search
        if (searchMode === "local") {
            const q = searchValue.toLowerCase();
            const results = items.filter(v =>
                v.name.toLowerCase().includes(q) ||
                v.description?.toLowerCase().includes(q)
            );

            setFiltered(results);
            toast.success(t("vesselTypes.loadSuccess", { count: results.length }));
            return;
        }

        // Remote search
        const result = await runWithLoading(
            searchMode === "id"
                ? getVesselTypesByID(searchValue)
                : getVesselTypesByName(searchValue),
            t("vesselTypes.loading")
        ).catch(() => null);

        if (!result) {
            setFiltered([]);
            return;
        }

        setFiltered([result]);
        toast.success(t("vesselTypes.loadSuccess", { count: 1 }));
    };




    const openEdit = () => {
        if (!selected) return;
        setEditModel({ ...selected });
        setSelected(null);
        setIsEditOpen(true);
        document.body.classList.add("no-scroll");
    };

    const closeEdit = () => {
        setIsEditOpen(false);
        document.body.classList.remove("no-scroll");
        setEditModel(null);
    };

    const saveEdit = async () => {
        if (!editModel) return;

        const updated = await runWithLoading(
            updateVesselType(editModel.id!, editModel),
            "Saving..."
        ).catch(() => null);

        if (!updated) return;

        toast.success(`Vessel updated: ${updated.name}`);

        const data = await getVesselTypes();
        setItems(data); setFiltered(data);
        closeEdit();
        setSelected(updated);
    };



    const openDelete = () => setIsDeleteOpen(true);
    const closeDelete = () => setIsDeleteOpen(false);

    const confirmDelete = async () => {
        if (!selected) return;

        const idToDelete = selected.id;
        const nameToDelete = selected.name;

        setIsDeleteOpen(false);
        setSelected(null);

        const success = await runWithLoading(
            deleteVesselType(idToDelete),
            t("vesselTypes.loading")
        ).catch(() => null);

        if (!success) return;

        toast.success(`${t("vesselTypes.deleted")} ${nameToDelete}`);

        const data = await getVesselTypes();
        setItems(data);
        setFiltered(data);
    };

    
    // === CREATE HANDLER ===
    const handleCreate = async () => {
        if (!name.trim())
            return toast.error(t("vesselTypes.errors.nameRequired"));

        if (maxBays <= 0 || maxRows <= 0 || maxTiers <= 0)
            return toast.error(t("vesselTypes.errors.invalidStructure"));

        const payload = {
            name,
            description: description.trim() === "" ? null : description,
            maxBays,
            maxRows,
            maxTiers
        };

        const created = await runWithLoading(
            createVesselType(payload),
            t("vesselTypes.loading")
        ).catch(() => null);

        if (!created) return; // erro já tratado no interceptor

        toast.success(t("vesselTypes.created"));

        const data = await getVesselTypes();
        setItems(data);
        setFiltered(data);

        setIsCreateOpen(false);

        // Reset form
        setName("");
        setDescription("");
        setMaxBays(0);
        setMaxRows(0);
        setMaxTiers(0);
    };




    return (
        <div className="vt-page">
            {selected && <div className="vt-overlay" />}

            <div className="vt-title-area">
                <div className="vt-title-box">
                    <h2 className="vt-title">
                        <FaShip className="vt-icon" /> {t("vesselTypes.title")}
                    </h2>
                    <p className="vt-sub">
                        {t("vesselTypes.count", { count: items.length })}
                    </p>
                </div>

                <button
                    className="vt-create-btn-top"
                    onClick={() => setIsCreateOpen(true)}
                >
                    + {t("vesselTypes.add")}
                </button>
            </div>

            {/* SEARCH SECTION */}
            <div className="vt-search-mode">
                <button
                    className={searchMode === "local" ? "active" : ""}
                    onClick={() => setSearchMode("local")}
                >
                    Local
                </button>
                <button
                    className={searchMode === "id" ? "active" : ""}
                    onClick={() => setSearchMode("id")}
                >
                    ID
                </button>
                <button
                    className={searchMode === "name" ? "active" : ""}
                    onClick={() => setSearchMode("name")}
                >
                    Name
                </button>
            </div>

            <div className="vt-search-box">
                <div className="vt-search-wrapper">
                    <input
                        placeholder={t("vesselTypes.searchPlaceholder")}
                        className="vt-search"
                        value={searchValue}
                        onChange={(e) => {
                            const value = e.target.value;
                            setSearchValue(value);
                            if (value === "") setFiltered(items);
                        }}
                        onKeyDown={(e) => e.key === "Enter" && executeSearch()}
                    />

                    {searchValue !== "" && (
                        <button
                            className="vt-clear-input"
                            onClick={() => {
                                setSearchValue("");
                                setFiltered(items);
                            }}
                        >
                            ✕
                        </button>
                    )}
                </div>

                <button className="vt-search-btn" onClick={executeSearch} title="Search">
                    ↵
                </button>
            </div>

            {/* TABLE */}
            {loading ? null : filtered.length === 0 ? (
                <p>{t("vesselTypes.empty")}</p>
            ) : (
                <div className="vt-table-wrapper">
                    <table className="vt-table">
                        <thead>
                        <tr>
                            <th>{t("vesselTypes.details.name")}</th>
                            <th>{t("vesselTypes.details.description")}</th>
                            <th>{t("vesselTypes.details.bays")}</th>
                            <th>{t("vesselTypes.details.rows")}</th>
                            <th>{t("vesselTypes.details.tiers")}</th>
                            <th>{t("vesselTypes.details.capacity")}</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filtered.map((v) => (
                            <tr key={v.id} className="vt-row" onClick={() => setSelected(v)}>
                                <td><span className="vt-badge">{v.name}</span></td>
                                <td>{v.description}</td>
                                <td>{v.maxBays}</td>
                                <td>{v.maxRows}</td>
                                <td>{v.maxTiers}</td>
                                <td>{v.capacity}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* SLIDE PANEL */}
            {selected && (
                <div className="vt-slide">
                    <button className="vt-slide-close" onClick={() => setSelected(null)}>
                        <FaTimes />
                    </button>

                    <h3>{selected.name}</h3>

                    <p><strong>{t("vesselTypes.details.description")}:</strong> {selected.description}</p>
                    <p><strong>{t("vesselTypes.details.bays")}:</strong> {selected.maxBays}</p>
                    <p><strong>{t("vesselTypes.details.rows")}:</strong> {selected.maxRows}</p>
                    <p><strong>{t("vesselTypes.details.tiers")}:</strong> {selected.maxTiers}</p>
                    <p><strong>{t("vesselTypes.details.capacity")}:</strong> {selected.capacity}</p>

                    <div className="vt-slide-actions">
                        <button className="vt-btn-edit" onClick={openEdit}>{t("vesselTypes.edit")}</button>
                        <button className="vt-btn-delete" onClick={openDelete}>{t("vesselTypes.delete")}</button>
                    </div>
                </div>
            )}

            {/* EDIT MODAL */}
            {isEditOpen && editModel && (
                <div className="vt-modal-overlay">
                    <div className="vt-modal">
                        <h3>{t("vesselTypes.edit")}</h3>

                        <label>{t("vesselTypes.details.name")}</label>
                        <input
                            className="vt-input"
                            value={editModel.name}
                            onChange={(e) => setEditModel({ ...editModel, name: e.target.value })}
                        />

                        <label>{t("vesselTypes.details.description")}</label>
                        <input
                            className="vt-input"
                            value={editModel.description}
                            onChange={(e) => setEditModel({ ...editModel, description: e.target.value })}
                        />

                        <label>{t("vesselTypes.details.bays")}</label>
                        <input
                            type="number"
                            min={1}
                            className="vt-input"
                            value={editModel.maxBays}
                            onChange={(e) => setEditModel({ ...editModel, maxBays: Math.max(1,Number(e.target.value)) })}
                        />

                        <label>{t("vesselTypes.details.rows")}</label>
                        <input
                            type="number"
                            min={1}
                            className="vt-input"
                            value={editModel.maxRows}
                            onChange={(e) => setEditModel({ ...editModel, maxRows: Math.max(1,Number(e.target.value)) })}
                        />

                        <label>{t("vesselTypes.details.tiers")}</label>
                        <input
                            type="number"
                            min={1}
                            className="vt-input"
                            value={editModel.maxTiers}
                            onChange={(e) => setEditModel({ ...editModel, maxTiers: Math.max(1,Number(e.target.value)) })}
                        />
                        

                        <div className="vt-modal-actions">
                            <button className="vt-btn-cancel" onClick={closeEdit}>{t("vesselTypes.cancel")}</button>
                            <button className="vt-btn-save" onClick={saveEdit}>{t("vesselTypes.save")}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* DELETE MODAL */}
            {isDeleteOpen && selected && (
                <div className="vt-modal-overlay">
                    <div className="vt-modal vt-modal-delete">
                        <h3>{t("vesselTypes.delete")}</h3>
                        <p>
                            {t("vesselTypes.details.name")}: <strong>{selected.name}</strong><br />
                            {t("vesselTypes.details.capacity")}: <strong>{selected.capacity} TEU</strong>
                        </p>

                        <div className="vt-modal-actions">
                            <button className="vt-btn-cancel" onClick={closeDelete}>{t("vesselTypes.cancel")}</button>
                            <button className="vt-btn-delete" onClick={() => confirmDelete()}>{t("vesselTypes.delete")}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* CREATE MODAL */}
            {isCreateOpen && (
                <div className="vt-modal-overlay">
                    <div className="vt-modal">
                        <h3>{t("vesselTypes.add")}</h3>

                        <label>{t("vesselTypes.details.name")} *</label>
                        <input className="vt-input" value={name} onChange={(e) => setName(e.target.value)} />

                        <label>{t("vesselTypes.details.description")}</label>
                        <input className="vt-input" value={description} onChange={(e) => setDescription(e.target.value)} />

                        <label>{t("vesselTypes.details.bays")} *</label>
                        <input type="number" min={1} className="vt-input" value={maxBays} onChange={(e) => setMaxBays(Math.max(1,Number(e.target.value)))} />

                        <label>{t("vesselTypes.details.rows")} *</label>
                        <input type="number" min={1} className="vt-input" value={maxRows} onChange={(e) => setMaxRows(Math.max(1,Number(e.target.value)))} />

                        <label>{t("vesselTypes.details.tiers")} *</label>
                        <input type="number" min={1} className="vt-input" value={maxTiers} onChange={(e) => setMaxTiers(Math.max(1,Number(e.target.value)))} />

                        <div className="vt-modal-actions">
                            <button className="vt-btn-cancel" onClick={() => setIsCreateOpen(false)}>
                                {t("vesselTypes.cancel")}
                            </button>
                            <button className="vt-btn-save" onClick={handleCreate}>
                                {t("vesselTypes.save")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
