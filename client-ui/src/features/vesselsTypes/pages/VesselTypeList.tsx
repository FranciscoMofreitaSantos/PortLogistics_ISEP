import { useEffect, useState } from "react";
import {
    getVesselTypes,
    getVesselTypesByID,
    getVesselTypesByName
} from "../services/vesselTypeService";
import type { VesselType } from "../types/vesselType";
import { notifyError, notifyLoading, notifySuccess } from "../../../utils/notify";
import "../style/vesselTypeList.css";
import { FaShip, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

export default function VesselTypeList() {
    const [items, setItems] = useState<VesselType[]>([]);
    const [filtered, setFiltered] = useState<VesselType[]>([]);
    const [selected, setSelected] = useState<VesselType | null>(null);
    const [loading, setLoading] = useState(true);

    const [searchMode, setSearchMode] = useState<"local" | "id" | "name">("local");
    const [searchValue, setSearchValue] = useState("");

    const navigate = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        async function load() {
            notifyLoading(t("vesselTypes.loading"));

            try {
                const data = await getVesselTypes();
                setItems(data);
                setFiltered(data);

                toast.dismiss("loading-global");
                notifySuccess(t("vesselTypes.loadSuccess", { count: data.length }));
            } catch {
                toast.dismiss("loading-global");
                notifyError(t("vesselTypes.loadError"));
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [t]);

    const executeSearch = async () => {
        if (!searchValue.trim()) {
            setFiltered(items);
            return;
        }

        if (searchMode === "local") {
            const q = searchValue.toLowerCase();
            setFiltered(
                items.filter(v =>
                    v.name.toLowerCase().includes(q) ||
                    v.description.toLowerCase().includes(q)
                )
            );
            return;
        }

        notifyLoading(t("vesselTypes.loading"));

        try {
            if (searchMode === "id") {
                const data = await getVesselTypesByID(searchValue);
                setFiltered([data]);
                toast.dismiss("loading-global");
                notifySuccess(t("vesselTypes.loadSuccess", { count: 1 }));
            }

            if (searchMode === "name") {
                const data = await getVesselTypesByName(searchValue);
                setFiltered(data);
                toast.dismiss("loading-global");
                notifySuccess(t("vesselTypes.loadSuccess", { count: data.length }));
            }
        } catch {
            toast.dismiss("loading-global");
            setFiltered([]);
            notifyError(t("vesselTypes.loadError"));
        }
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
                    onClick={() => navigate("/vessel-types/create")}
                >
                    + {t("vesselTypes.add")}
                </button>
            </div>

            <div className="vt-search-mode">
                <button className={searchMode === "local" ? "active" : ""} onClick={() => setSearchMode("local")}>
                    Local
                </button>
                <button className={searchMode === "id" ? "active" : ""} onClick={() => setSearchMode("id")}>
                    ID
                </button>
                <button className={searchMode === "name" ? "active" : ""} onClick={() => setSearchMode("name")}>
                    Name
                </button>
            </div>

            <div className="vt-search-box">
                <input
                    placeholder={t("vesselTypes.searchPlaceholder")}
                    className="vt-search"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                />
                <button className="vt-search-btn" onClick={executeSearch} title="Search">
                    🔎
                </button>
            </div>

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
                        {filtered.map(v => (
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
                        <button className="vt-btn-edit">{t("vesselTypes.edit")}</button>
                        <button className="vt-btn-delete">{t("vesselTypes.delete")}</button>
                    </div>
                </div>
            )}
        </div>
    );
}
