import { useEffect, useState } from "react";
import { getVesselTypes } from "../services/vesselTypeService";
import type { VesselType } from "../types/vesselType";
import { notifyError } from "../../../utils/notify";
import { Link } from "react-router-dom";
import { FaPlus, FaShip, FaSearch, FaFolderOpen } from "react-icons/fa";
import "../style/vesseltypelist.css"
export default function VesselTypeList() {
    const [items, setItems] = useState<VesselType[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");

    useEffect(() => {
        async function load() {
            try {
                const data = await getVesselTypes();
                setItems(data);
            } catch {
                notifyError("❌ Failed to load vessel types");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const filtered = items.filter(v =>
        v.name.toLowerCase().includes(query.toLowerCase()) ||
        v.description.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div className="vt-container">

            {/* Floating button */}
            <Link to="/vessel-types/create" className="vt-btn-add">
                <FaPlus />
                <span>Add Type</span>
            </Link>

            {/* KPI */}
            <div className="vt-header">
                <div className="vt-title-block">
                    <FaShip className="vt-icon" />
                    <div>
                        <h2>Vessel Types</h2>
                        <p>{items.length} registered vessel types</p>
                    </div>
                </div>

                <div className="vt-search-box">
                    <FaSearch className="vt-search-icon"/>
                    <input
                        type="text"
                        placeholder="Search vessel type..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* List */}
            {loading ? (
                <div className="vt-loading">Loading vessel types...</div>
            ) : filtered.length === 0 ? (
                <div className="vt-empty">
                    <FaFolderOpen className="vt-empty-icon" />
                    <p>No vessel types found</p>
                </div>
            ) : (
                <div className="vt-table-wrapper">
                    <table className="vt-table">
                        <thead>
                        <tr>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Bays</th>
                            <th>Rows</th>
                            <th>Tiers</th>
                            <th>Capacity (TEU)</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filtered.map(v => (
                            <tr key={v.id}>
                                <td>{v.name}</td>
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
        </div>
    );
}
