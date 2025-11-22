import { useState, useEffect } from "react";


import {
    getSAOs,
    getByCode,
    getByLegalName,
    getByTaxNumber,
    createSAO,
    deleteSAO
} from "../services/saoService";

import type { SAO } from "../types/sao";
import type {CreateSAORequest } from "../types/sao";
import {notifySuccess } from "../../../utils/notify";
import "../style/saopage.css";

import {useTranslation} from "react-i18next";
import { Bar } from "react-chartjs-2";
import { FaShip, FaSearch, FaPlus, FaTimes,FaBuilding } from "react-icons/fa";
import toast from "react-hot-toast";

import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend
} from "chart.js";

// === Chart.js imports ===

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function SAO() {
    const [items, setItems] = useState<SAO[]>([]);
    const [filtered, setFiltered] = useState<SAO[]>([]);
    const [selected, setSelected] = useState<SAO | null>(null);
    const [loading, setLoading] = useState(true);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deleteModel, setDeleteModel] = useState<SAO | null>(null);

    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const { t } = useTranslation();

    const [shippingOrganizationCode, setShippingOrganizationCode] = useState("");
    const [legalName, setLegalName] = useState("");
    const [altName, setAltName] = useState("");
    const [address, setAddress] = useState("");
    const [taxnumber, setTaxnumber] = useState("");

    const [searchMode, setSearchMode] = useState<
        "legalName" | "taxnumber"
    >("legalName");


   const [searchValue, setSearchValue] = useState("");

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
        runWithLoading(getSAOs(), t("sao.loading"))
            .then(data => {
                setItems(data);
                setFiltered(data);
                notifySuccess(t("sao.loadSuccess", { count: data.length }));
            })
            .finally(() => setLoading(false));
    }, [t]);


   const executeSearch = async () => {
        if (!searchValue.trim()) {
            setFiltered(items);
            return;
        }

        let result: SAO | null = null;

        const p =
                searchMode === "legalName"
                ? getByLegalName(searchValue)
                : searchMode === "taxnumber"
                ? getByTaxNumber(searchValue)
                : getByLegalName(searchValue);

        result = await runWithLoading(p, t("sao.loading")).catch(() => null);

        if (!result) {
            setFiltered([]);
            return;
        }

        setFiltered([result]);
        toast.success(t("sao.loadSuccess", { count: 1 }));
    };

    const handleCreate = async () => {

        if (!legalName.trim())
            return toast.error(t("sao.errors.legalNameRequired"));

        if (!taxnumber.trim())
            return toast.error(t("sao.errors.taxRequired"));

        const payload = {
            shippingOrganizationCode,
            legalName,
            altName,
            address,
            taxnumber
        };

        const created = await runWithLoading(
            createSAO(payload),
            t("sao.loading")
        ).catch(() => null);

        if (!created) return;

        toast.success(t("sao.created"));

        const data = await getSAOs();
        setItems(data);
        setFiltered(data);

        setIsCreateOpen(false);

        // reset form
        setShippingOrganizationCode("");
        setLegalName("");
        setAltName("");
        setAddress("");
        setTaxnumber("");
    };

    
    const openDelete = () => {
        if (!selected) return;
        setDeleteModel({ ...selected });
        setSelected(null);
        setIsDeleteOpen(true);
        document.body.classList.add("no-scroll");
    };

    const closeDelete = () => {
        setIsDeleteOpen(false);
        setDeleteModel(null);
        document.body.classList.remove("no-scroll");
    };


    const closeSlide = () => setSelected(null);

    function DeleteSAOModal({
        deleteModel,
        closeDelete,
        refresh,
        t
    }: {
        deleteModel: SAO | null;
        closeDelete: () => void;
        refresh: () => Promise<void>;
        t: any;
    }) {
        if (!deleteModel) return null;

        const model = deleteModel;

        async function handleDelete() {
            await deleteSAO(model.legalName);
            toast.success(t("sao.deleted"));
            await refresh();
            closeDelete();
        }

        return (
            <div className="sao-modal-overlay">
                <div className="sao-modal sao-modal-delete">
                    <h3>{t("sao.delete")}</h3>
                    <p>
                        {t("sao.details.legalName")}: <strong>{model.legalName}</strong><br />
                        {t("sao.details.altName")}: <strong>{model.altName}</strong><br />
                        {t("sao.details.address")}: <strong>{model.address}</strong><br />
                        {t("sao.details.taxnumber")}: <strong>{model.taxnumber.value}</strong>
                    </p>

                    <div className="sao-modal-actions">
                        <button className="vt-btn-cancel" onClick={closeDelete}>
                            {t("sao.cancel")}
                        </button>
                        <button className="vt-btn-delete" onClick={handleDelete}>
                            {t("sao.delete")}
                        </button>
                    </div>
                </div>
            </div>
        );
    }


    return (
        <div className="sao-page">
            {selected && <div className="sao-overlay" />}

            <div className="sao-title-area">
                <div className="sao-title-box">
                    <h2 className="sao-title">
                        <FaBuilding className="sao-icon" /> {t("sao.title")}
                    </h2>
                    <p className="sao-sub">
                        {t("sao.count", { count: items.length })}
                    </p>
                </div>

                <button
                    className="sao-create-btn-top"
                    onClick={() => setIsCreateOpen(true)}
                >
                    + {t("sao.add")}
                </button>
            </div>

            {/* SEARCH MODE BUTTONS */}
            <div className="sao-search-mode">
                {t("sao.searchMode") }
                <button
                    className={searchMode === "legalName" ? "active" : ""}
                    onClick={() => setSearchMode("legalName")}
                >
                    {t("sao.details.legalName")}
                </button>
                <button
                    className={searchMode === "taxnumber" ? "active" : ""}
                    onClick={() => setSearchMode("taxnumber")}
                >
                    {t("sao.details.taxnumber")}
                </button>
            </div>

            {/* SEARCH INPUT */}
            <div className="sao-search-box">
                <div className="sao-search-wrapper">
                    <input
                        placeholder={t("sao.searchPlaceholder")}
                        className="sao-search"
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
                            className="sao-clear-input"
                            onClick={() => {
                                setSearchValue("");
                                setFiltered(items);
                            }}
                        >
                            ✕
                        </button>
                    )}
                </div>

                <button className="sao-search-btn" onClick={executeSearch}>
                    🔍
                </button>
            </div>

            {/* TABLE */}
            {loading ? null : filtered.length === 0 ? (
                <p>{t("sao.empty")}</p>
            ) : (
                <div className="sao-table-wrapper">
                    <table className="sao-table">
                        <thead>
                            <tr>
                                <th>{t("sao.details.legalName")}</th>
                                <th>{t("sao.details.altName")}</th>
                                <th>{t("sao.details.address")}</th>
                                <th>{t("sao.details.taxnumber")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((s) => (
                                <tr
                                    key={s.legalName}
                                    className="sao-row"
                                    onClick={() => setSelected(s)}
                                >
                                    <td>{s.legalName}</td>
                                    <td>{s.altName}</td>
                                    <td>{s.address}</td>
                                    <td>{s.taxnumber.value}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* SLIDE PANEL */}
            {selected && (
                <div className="sao-slide">
                    <button
                        className="sao-slide-close"
                        onClick={() => setSelected(null)}
                    >
                        <FaTimes />
                    </button>

                    <h3>{selected.legalName}</h3>

                    <p><strong>{t("sao.details.altName")}:</strong> {selected.altName}</p>
                    <p><strong>{t("sao.details.address")}:</strong> {selected.address}</p>
                    <p><strong>{t("sao.details.taxnumber")}:</strong> {selected.taxnumber.value}</p>
                    <div className="vt-slide-actions">

                        <button className="vt-btn-delete" onClick={openDelete}>{t("sao.delete")}</button>
                    </div>
                </div>
                
            )}

            {/* CREATE MODAL */}
            {isCreateOpen && (
                <div className="sao-modal-overlay">
                    <div className="sao-modal">
                        <h3>{t("sao.add")}</h3>

                        <label>{t("sao.details.legalName")} *</label>
                        <input
                            className="sao-input"
                            value={legalName}
                            onChange={(e) => setLegalName(e.target.value)}
                        />

                        <label>{t("sao.details.altName")}</label>
                        <input
                            className="sao-input"
                            value={altName}
                            onChange={(e) => setAltName(e.target.value)}
                        />

                        <label>{t("sao.details.address")}</label>
                        <input
                            className="sao-input"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                        />

                        <label>{t("sao.details.taxnumber")} *</label>
                        <input
                            className="sao-input"
                            value={taxnumber}
                            onChange={(e) => setTaxnumber(e.target.value)}
                        />

                        <div className="sao-modal-actions">
                            <button
                                className="sao-btn-cancel"
                                onClick={() => setIsCreateOpen(false)}
                            >
                                {t("sao.cancel")}
                            </button>
                            <button
                                className="sao-btn-save"
                                onClick={handleCreate}
                            >
                                {t("sao.save")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        {isDeleteOpen && (
            <DeleteSAOModal
                deleteModel={deleteModel}
                closeDelete={closeDelete}
                refresh={async () => {
                    const data = await getSAOs();
                    setItems(data);
                    setFiltered(data);
                }}
                t={t}
            />
        )}

            
        </div>
    );
}
