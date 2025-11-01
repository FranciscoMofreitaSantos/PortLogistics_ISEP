import { useEffect, useState } from "react";
import { getVesselTypes } from "../services/vesselTypeService";
import type { VesselType } from "../types/vesselType";
import { notifyError, notifyLoading, notifySuccess } from "../../../utils/notify";
import "../style/vesselTypeList.css";
import { FaShip, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const debounce = (fn: Function, delay = 450) => {
    let timer: number;
    return (...args: any[]) => {
        clearTimeout(timer);
        timer = window.setTimeout(() => fn(...args), delay);
    };
};

export default function VesselTypeList() {
    const [items, setItems] = useState<VesselType[]>([]);
    const [filtered, setFiltered] = useState<VesselType[]>([]);
    const [selected, setSelected] = useState<VesselType | null>(null);
    const [loading, setLoading] = useState(true);
    const [, setQuery] = useState("");

    const navigate = useNavigate();

useEffect(() => {
    async function load() {
        notifyLoading("Loading vessel types...");

        try {
            const data = await getVesselTypes();
            setItems(data);
            setFiltered(data);

            toast.dismiss("loading-global");
            notifySuccess(`Loaded ${data.length} vessel types`);
        } catch {
            toast.dismiss("loading-global");
            notifyError("Failed to load vessel types");
        } finally {
            setLoading(false);
        }
    }

    load();
}, []);


    const handleSearch = debounce((val: string) => {
        setQuery(val);
        const q = val.toLowerCase();
        setFiltered(
            items.filter(v =>
                v.name.toLowerCase().includes(q) ||
                v.description.toLowerCase().includes(q)
            )
        );
    });

    return (
        <div className="vt-page">

            {selected && <div className="vt-overlay"></div>}

            <div className="vt-title-area">
                <div className="vt-title-box">
                    <h2 className="vt-title">
                        <FaShip className="vt-icon" /> Vessel Types
                    </h2>
                    <p className="vt-sub">{items.length} registered types</p>
                </div>

                <button
                    className="vt-create-btn-top"
                    onClick={() => navigate("/vessel-types/create")}
                >
                    + Add
                </button>
            </div>

            <div className="vt-search-box">
                <input
                    placeholder="Search vessel type..."
                    className="vt-search"
                    onChange={(e) => handleSearch(e.target.value)}
                />
            </div>

            {loading ? (
                null
            ) : filtered.length === 0 ? (
                <p>No vessel types found...</p>
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
                            <th>Capacity</th>
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
                                <td>{v.capacity} TEU</td>
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
                    <p><strong>Description:</strong> {selected.description}</p>
                    <p><strong>Bays:</strong> {selected.maxBays}</p>
                    <p><strong>Rows:</strong> {selected.maxRows}</p>
                    <p><strong>Tiers:</strong> {selected.maxTiers}</p>
                    <p><strong>Capacity:</strong> {selected.capacity} TEU</p>

                    <div className="vt-slide-actions">
                        <button className="vt-btn-edit">Edit</button>
                        <button className="vt-btn-delete">Delete</button>
                    </div>
                </div>
            )}
        </div>
    );
}
