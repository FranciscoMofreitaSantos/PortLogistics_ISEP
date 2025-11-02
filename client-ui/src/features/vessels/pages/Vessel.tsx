import { useState, useEffect } from "react";
import { FaShip, FaSearch, FaPlus, FaTimes } from "react-icons/fa";
import toast from "react-hot-toast";

import {
    getVessels,
    getVesselByIMO,
    getVesselById,
    getVesselByOwner,
    createVessel,
    patchVesselByIMO
} from "../services/vesselService";

import { getVesselTypes } from "../../vesselsTypes/services/vesselTypeService";
import type { VesselType } from "../../vesselsTypes/types/vesselType";
import type { Vessel, CreateVesselRequest, UpdateVesselRequest } from "../types/vessel";

import "../style/vesselspage.css";
import {useTranslation} from "react-i18next";


export default function Vessel() {
    const [items, setItems] = useState<Vessel[]>([]);
    const [filtered, setFiltered] = useState<Vessel[]>([]);
    const [loading, setLoading] = useState(true);

    const [vesselTypes, setVesselTypes] = useState<VesselType[]>([]);
    const [selected, setSelected] = useState<Vessel | null>(null);

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const [editIMO, setEditIMO] = useState<string | null>(null);
    const [editData, setEditData] = useState<UpdateVesselRequest>({});

    const [searchMode, setSearchMode] = useState<"local" | "imo" | "id" | "owner">("local");
    const [searchValue, setSearchValue] = useState("");

    const [form, setForm] = useState<CreateVesselRequest>({
        imoNumber: "",
        name: "",
        owner: "",
        vesselTypeName: ""
    });
    const { t } = useTranslation();

    const imoRegex = /^\d{7}$/;
    const val = (x: any) => (typeof x === "string" ? x : x?.value);

    // ====== Loading helper (igual ao vesselType) ======
    const MIN_LOADING_TIME = 500;
    
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

    // ====== Load data ======
    useEffect(() => {
        load();
        loadTypes();
    }, []);

    async function load() {
        const data = await getVessels();
        setItems(data);
        setFiltered(data);
        setLoading(false);
    }

    async function loadTypes() {
        const data = await getVesselTypes();
        setVesselTypes(data);
    }

    function getVesselTypeNameById(vesselTypeId: any) {
        const id = vesselTypeId?.value ?? vesselTypeId;
        const type = vesselTypes.find(t => t.id === id);
        return type?.name ?? "Unknown";
    }

    // ====== Search ======
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
            toast.success(t("vesselTypes.loadSuccess", { count: results.length }));
            return;
        }

        // Validate GUID
        if (searchMode === "id") {
            const guidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
            if (!guidRegex.test(searchValue)) {
                toast.error("Invalid ID format. Please enter a valid GUID.");
                return;
            }
        }

        // Validate IMO
        if (searchMode === "imo") {
            if (!imoRegex.test(searchValue)) {
                toast.error("Invalid IMO (only 7 digits)");
                return;
            }
        }

        // Wrap single object APIs so they return arrays
        let apiPromise: Promise<Vessel[]>;

        if (searchMode === "imo") {
            apiPromise = getVesselByIMO(searchValue).then(v => [v]);
        } else if (searchMode === "id") {
            apiPromise = getVesselById(searchValue).then(v => [v]);
        } else {
            apiPromise = getVesselByOwner(searchValue); // Already returns Vessel[]
        }

        const result = await runWithLoading(apiPromise, t("vesselTypes.loading"))
            .catch(() => null);

        if (!result || result.length === 0) {
            setFiltered([]);
            return;
        }

        setFiltered(result);
        toast.success(t("vesselTypes.loadSuccess", { count: result.length }));
    }



    // ====== Create ======
    async function handleCreate() {
        if (!imoRegex.test(form.imoNumber))
            return toast.error("Invalid IMO number");

        if (!form.name.trim() || !form.owner.trim() || !form.vesselTypeName.trim())
            return toast.error("Fill all fields");

        await runWithLoading(createVessel(form), "Creating vessel...");
        toast.success("Vessel created!");
        setIsCreateOpen(false);
        load();
    }

    // ====== Edit ======
    async function handleSaveEdit() {
        if (!editIMO) return toast.error("Missing vessel reference");

        const payload: UpdateVesselRequest = {};
        if (editData.name?.trim()) payload.name = editData.name.trim();
        if (editData.owner?.trim()) payload.owner = editData.owner.trim();

        if (!payload.name && !payload.owner)
            return toast.error("Nothing to update");

        await runWithLoading(
            patchVesselByIMO(editIMO, payload),
            "Updating vessel..."
        );

        toast.success("Vessel updated!");
        setIsEditOpen(false);
        setEditIMO(null);
        load();
    }

    const closeSlide = () => setSelected(null);

    return (
        <div className="vt-page">
            {selected && <div className="vt-overlay" onClick={closeSlide} />}

            {/* HEADER */}
            <div className="vt-title-area">
                <div>
                    <h2 className="vt-title"><FaShip /> Vessel Management</h2>
                    <p className="vt-sub">Total vessels: {items.length}</p>
                </div>
                <button className="vt-create-btn-top" onClick={() => setIsCreateOpen(true)}>
                    <FaPlus /> Add Vessel
                </button>
            </div>

            {/* SEARCH MODE */}
            <div className="vt-search-mode">
                {["local", "imo", "id", "owner"].map(m => (
                    <button
                        key={m}
                        className={searchMode === m ? "active" : ""}
                        onClick={() => setSearchMode(m as any)}
                    >
                        {m.toUpperCase()}
                    </button>
                ))}
            </div>

            {/* SEARCH */}
            <div className="vt-search-box">
                <div className="vt-search-wrapper">
                    <input
                        placeholder="Search vessels..."
                        className="vt-search"
                        value={searchValue}
                        onChange={e => {
                            setSearchValue(e.target.value);
                            if (!e.target.value) setFiltered(items);
                        }}
                        onKeyDown={e => e.key === "Enter" && executeSearch()}
                    />
                    {searchValue !== "" && (
                        <button className="vt-clear-input" onClick={() => { setSearchValue(""); setFiltered(items); }}>
                            ✕
                        </button>
                    )}
                </div>
                <button className="vt-search-btn" onClick={executeSearch}>
                    <FaSearch />
                </button>
            </div>

            {/* CARDS */}
            <div className="vt-card-grid">
                {!loading && filtered.map(v => (
                    <div key={v.id} className="vt-card" onClick={() => setSelected(v)}>
                        <div className="vt-card-header">
                            <span className="vt-card-title">{v.name}</span>
                            <span className="vt-badge">{val(v.imoNumber)}</span>
                        </div>
                        <div className="vt-card-body">
                            <div className="vt-row-item">
                                <span className="vt-label">Owner</span>
                                <span className="vt-chip">{v.owner}</span>
                            </div>
                            <div className="vt-row-item">
                                <span className="vt-label">Type</span>
                                <span className="vt-chip vt-chip-type">
                                    {getVesselTypeNameById(v.vesselTypeId)}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* SLIDE PANEL */}
            {selected && (
                <div className="vt-slide">
                    <button className="vt-slide-close" onClick={closeSlide}>
                        <FaTimes />
                    </button>

                    <h3>{selected.name}</h3>

                    <p><strong>IMO:</strong> {val(selected.imoNumber)}</p>
                    <p><strong>Owner:</strong> {selected.owner}</p>
                    <p><strong>Type:</strong> {getVesselTypeNameById(selected.vesselTypeId)}</p>

                    <div className="vt-slide-actions">
                        <button
                            className="vt-btn-edit"
                            onClick={() => {
                                setEditData({ name: selected.name, owner: selected.owner });
                                setEditIMO(val(selected.imoNumber));
                                setIsEditOpen(true);
                                setSelected(null);
                            }}
                        >
                            Edit
                        </button>

                        <button
                            className="vt-btn-edit"
                            onClick={() => {
                                const id = typeof selected.vesselTypeId === "string"
                                    ? selected.vesselTypeId
                                    : selected.vesselTypeId.value;
                                window.location.href = `/vessel-types?id=${id}`;
                            }}
                        >
                            View Type
                        </button>
                    </div>
                </div>
            )}

            {/* CREATE MODAL */}
            {isCreateOpen && (
                <div className="vt-modal-overlay">
                    <div className="vt-modal">
                        <h3>Add Vessel</h3>

                        <label>IMO Number *</label>
                        <input
                            className="vt-input"
                            placeholder="IMO1234567"
                            value={form.imoNumber}
                            onChange={e => setForm({ ...form, imoNumber: e.target.value })}
                        />

                        <label>Vessel Name *</label>
                        <input
                            className="vt-input"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                        />

                        <label>Owner *</label>
                        <input
                            className="vt-input"
                            value={form.owner}
                            onChange={e => setForm({ ...form, owner: e.target.value })}
                        />

                        <label>Vessel Type *</label>
                        <select
                            className="vt-input vt-input--vesseltype"
                            value={form.vesselTypeName}
                            onChange={e => setForm({ ...form, vesselTypeName: e.target.value })}
                        >
                            <option value="">Select Vessel Type</option>
                            {vesselTypes.map(t => (
                                <option key={t.id} value={t.name}>{t.name}</option>
                            ))}
                        </select>

                        <div className="vt-modal-actions">
                            <button className="vt-btn-cancel" onClick={() => setIsCreateOpen(false)}>Cancel</button>
                            <button className="vt-btn-save" onClick={handleCreate}>Save</button>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT MODAL */}
            {isEditOpen && (
                <div className="vt-modal-overlay">
                    <div className="vt-modal">
                        <h3>Edit Vessel</h3>

                        <label>Vessel Name *</label>
                        <input
                            className="vt-input"
                            value={editData.name || ""}
                            onChange={e => setEditData({ ...editData, name: e.target.value })}
                        />

                        <label>Owner *</label>
                        <input
                            className="vt-input"
                            value={editData.owner || ""}
                            onChange={e => setEditData({ ...editData, owner: e.target.value })}
                        />

                        <div className="vt-modal-actions">
                            <button className="vt-btn-cancel" onClick={() => setIsEditOpen(false)}>Cancel</button>
                            <button className="vt-btn-save" onClick={handleSaveEdit}>Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
