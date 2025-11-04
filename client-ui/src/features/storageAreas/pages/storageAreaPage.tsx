import { useEffect, useMemo, useState } from "react";
import { FaShip, FaSearch, FaPlus, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "../style/storageAreaStyle.css";
import * as storageAreaService from "../service/storageAreaService";
import type { StorageAreaDto, StorageAreaGridDto, ContainerDto } from "../type/storageAreaType";
import { useTranslation } from "react-i18next";

/* Helpers */
function formatPct(num: number, den: number) {
    if (!den) return "0%";
    return `${Math.round((num / den) * 100)}%`;
}
function classNames(...xs: (string | false | null | undefined)[]) {
    return xs.filter(Boolean).join(" ");
}
const GUID_RE =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

export default function StorageAreaPage() {
    const { t } = useTranslation();
    const nav = useNavigate();

    const [items, setItems] = useState<StorageAreaDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");

    const [, setGrid] = useState<StorageAreaGridDto | null>(null);
    const [slices, setSlices] = useState<boolean[][][]>([]);
    const [selected, setSelected] = useState<StorageAreaDto | null>(null);
    const [isDistancesOpen, setIsDistancesOpen] = useState(false);

    /* MODAL CONTAINER */
    const [isCellOpen, setIsCellOpen] = useState(false);
    const [cellLoading, setCellLoading] = useState(false);
    const [cellError, setCellError] = useState<string | null>(null);
    const [cellInfo, setCellInfo] = useState<ContainerDto | null>(null);
    const [cellPos, setCellPos] = useState<{ bay: number; row: number; tier: number } | null>(null);

    async function openCellModal(bay: number, row: number, tier: number) {
        if (!selected) return;
        setIsCellOpen(true);
        setCellLoading(true);
        setCellError(null);
        setCellInfo(null);
        setCellPos({ bay, row, tier });

        try {
            const data = await storageAreaService.getContainerAtPosition(
                selected.id,
                bay,
                row,
                tier
            );
            setCellInfo(data);
        } catch (e: any) {
            setCellError(e?.response?.data ?? t("storageAreas.modal.container.error"));
        } finally {
            setCellLoading(false);
        }
    }

    /* LOAD storage areas */
    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const data = await storageAreaService.getAllStorageAreas();
                setItems(data);
                if (data.length) setSelected(data[0]);
                toast.success(t("storageAreas.list.loaded", { count: data.length }));
            } catch (e: any) {
                toast.error(e?.response?.data ?? t("storageAreas.toast.listLoadingError"));
            } finally {
                setLoading(false);
            }
        })();
    }, [t]);

    /* BUILD grid from backend */
    async function loadGrid(area: StorageAreaDto) {
        try {
            const g = await storageAreaService.getStorageAreaGrid(area.id);
            setGrid(g);

            const generatedSlices: boolean[][][] = [];

            for (let tIdx = 0; tIdx < g.maxTiers; tIdx++) {
                const tier: boolean[][] = [];
                for (let r = 0; r < g.maxRows; r++) {
                    const row: boolean[] = [];
                    for (let b = 0; b < g.maxBays; b++) {
                        const occ = g.slots.some(
                            (s) => s.tier === tIdx && s.row === r && s.bay === b && s.iso !== null
                        );
                        row.push(occ);
                    }
                    tier.push(row);
                }
                generatedSlices.push(tier);
            }
            setSlices(generatedSlices);
        } catch {
            toast.error(t("storageAreas.errors.loadGrid"));
        }
    }

    useEffect(() => {
        if (selected) loadGrid(selected);
    }, [selected]);

    /* SEARCH */
    const filtered = useMemo(() => {
        if (!query.trim()) return items;
        const q = query.toLowerCase().trim();
        return items.filter((x) => {
            const matchesText =
                x.name.toLowerCase().includes(q) ||
                x.type.toLowerCase().includes(q) ||
                x.physicalResources.some((p) => p.toLowerCase().includes(q));
            const matchesId = GUID_RE.test(q) && x.id.toLowerCase() === q;
            return matchesText || matchesId;
        });
    }, [items, query]);

    /* KPIs */
    const capacityPct = useMemo(() => {
        if (!selected) return 0;
        const den = selected.maxCapacityTeu || 1;
        return Math.min(100, Math.round((selected.currentCapacityTeu / den) * 100));
    }, [selected]);

    function goToCreate() {
        nav("/storage-areas/new");
    }

    /* RENDER */
    return (
        <div className="sa-wrapper">
            {/* HEADER */}
            <div className="vt-title-area" style={{ marginBottom: "20px" }}>
                <div>
                    <h2 className="vt-title">
                        <FaShip /> {t("storageAreas.list.title")}
                    </h2>
                    <p className="vt-sub">
                        {t("storageAreas.list.registered", { count: filtered.length })}
                    </p>
                </div>

                <div style={{ display: "flex", gap: "12px" }}>
                    <div className="sa-search" style={{ background: "var(--card-bg)", padding: "6px 10px" }}>
                        <FaSearch style={{ opacity: 0.7 }} />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={t("storageAreas.list.searchPlaceholder") ?? ""}
                        />
                    </div>

                    <button className="vt-create-btn-top" onClick={goToCreate}>
                        <FaPlus /> {t("storageAreas.create.btnAdd") || t("storageAreas.buttons.new")}
                    </button>
                </div>
            </div>

            {/* LIST + MAIN */}
            <div className="sa-content-vertical">
                {/* LIST */}
                <div className="sa-strip">
                    <div className="sa-strip-inner">
                        {loading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <div className="sa-strip-skeleton" key={i} />
                            ))
                        ) : filtered.length === 0 ? (
                            <div className="sa-empty" style={{ padding: 10 }}>
                                {t("storageAreas.list.noResults")}
                            </div>
                        ) : (
                            filtered.map((x) => {
                                const active = selected?.id === x.id;
                                return (
                                    <button
                                        key={x.id}
                                        className={classNames("sa-card-mini", active && "active")}
                                        onClick={() => setSelected(x)}
                                    >
                                        <div className="sa-card-mini-top">
                                            <span className="sa-card-mini-name">{x.name}</span>
                                            <span className={`sa-badge-modern ${x.type.toLowerCase()}`}>{x.type}</span>
                                        </div>
                                        <div className="sa-card-mini-bottom">
                                            {x.currentCapacityTeu}/{x.maxCapacityTeu} TEU
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* MAIN PANEL */}
                <main className="sa-main">
                    {!selected ? (
                        <div className="sa-empty">{t("storageAreas.list.selectOne")}</div>
                    ) : (
                        <>
                            {/* Info cards */}
                            <section className="sa-kpis sa-kpis--extended">
                                <div className="sa-card">
                                    <div className="sa-card-title">{t("storageAreas.list.type")}</div>
                                    <div className="sa-card-value">{xlateType(selected.type, t)}</div>
                                </div>

                                <div className="sa-card">
                                    <div className="sa-card-title">{t("storageAreas.list.capacity")}</div>
                                    <div className="sa-card-value">
                                        {t("storageAreas.format.teu", {
                                            current: selected.currentCapacityTeu,
                                            max: selected.maxCapacityTeu
                                        })}
                                    </div>
                                    <div className="sa-progress">
                                        <div className="sa-progress-fill" style={{ width: `${capacityPct}%` }} />
                                    </div>
                                    <div className="sa-progress-label">
                                        {formatPct(selected.currentCapacityTeu, selected.maxCapacityTeu)}
                                    </div>
                                </div>

                                <div className="sa-card">
                                    <div className="sa-card-title">{t("storageAreas.list.dimensions")}</div>
                                    <div className="sa-card-value">
                                        {selected.maxBays} Bays · {selected.maxRows} Rows · {selected.maxTiers} Tiers
                                    </div>
                                </div>

                                <div className="sa-card sa-card--desc">
                                    <div className="sa-card-title">{t("storageAreas.list.description")}</div>
                                    <p className="sa-desc">{selected.description || "-"}</p>
                                </div>

                                <div className="sa-card sa-card--resources">
                                    <div className="sa-card-title">{t("storageAreas.list.physical")}</div>
                                    <div className="sa-chips">
                                        {selected.physicalResources.length === 0 ? (
                                            <span className="sa-empty">–</span>
                                        ) : (
                                            selected.physicalResources.map((r) => (
                                                <span className="sa-chip" key={r}>
                          {r}
                        </span>
                                            ))
                                        )}
                                    </div>
                                </div>

                                <div className="sa-card sa-card--button">
                                    <div className="sa-card-title">{t("storageAreas.list.docks")}</div>
                                    <button
                                        className="sa-btn sa-btn-primary sa-btn-full"
                                        onClick={() => setIsDistancesOpen(true)}
                                    >
                                        {t("storageAreas.list.viewDistances")}
                                    </button>
                                </div>
                            </section>

                            {/* OCCUPANCY GRID */}
                            <section className="sa-visual">
                                <div className="sa-visual-header">
                                    <h2>{t("storageAreas.list.tiersMap")}</h2>
                                    <span className="sa-note">{t("storageAreas.list.tiersNote")}</span>
                                </div>

                                <div className="sa-slices-grid">
                                    {slices.map((grid, tIdx) => (
                                        <div className="sa-slice" key={`tier-${tIdx}`}>
                                            <div className="sa-slice-head">
                        <span className="sa-tag">
                          {t("storageAreas.format.tier", { value: tIdx })}
                        </span>
                                            </div>
                                            <div className="sa-grid-wrap">
                                                <div
                                                    className="sa-grid fit"
                                                    style={
                                                        {
                                                            ["--cols" as any]: String(selected.maxBays),
                                                            ["--gap" as any]: "4px"
                                                        } as React.CSSProperties
                                                    }
                                                >
                                                    {grid.map((row, r) =>
                                                        row.map((cell, b) => (
                                                            <div
                                                                key={`c-${tIdx}-${r}-${b}`}
                                                                className={classNames("sa-cell", cell && "filled")}
                                                                onClick={() => {
                                                                    if (cell) openCellModal(b, r, tIdx);
                                                                }}
                                                                title={
                                                                    cell
                                                                        ? `${t("storageAreas.format.bay", { value: b })} • ${t(
                                                                            "storageAreas.format.row",
                                                                            { value: r }
                                                                        )} • ${t("storageAreas.format.tier", { value: tIdx })}`
                                                                        : undefined
                                                                }
                                                                role="button"
                                                            />
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </>
                    )}
                </main>
            </div>

            {/* MODAL: DOCKS */}
            {isDistancesOpen && selected && (
                <div className="sa-modal-backdrop" onClick={() => setIsDistancesOpen(false)}>
                    <div className="sa-dock-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="sa-dock-head">
                            <div className="sa-dock-spacer" />
                            <h3 className="sa-dock-title">
                                {t("storageAreas.list.distancesTitle", { name: selected.name })}
                            </h3>
                            <button
                                className="sa-icon-btn sa-dock-close"
                                onClick={() => setIsDistancesOpen(false)}
                                aria-label={t("storageAreas.modal.close") || "Close"}
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div className="sa-dock-body">
                            {selected.distancesToDocks.length === 0 ? (
                                <div className="sa-empty">{t("storageAreas.list.noDistances")}</div>
                            ) : (
                                selected.distancesToDocks.map((d, i) => {
                                    const max = Math.max(
                                        ...selected.distancesToDocks.map((x) => x.distance || 0),
                                        1
                                    );
                                    const pct = Math.max(8, Math.round(((d.distance || 0) / max) * 100));

                                    return (
                                        <div
                                            className="sa-dock-row"
                                            key={d.dockCode}
                                            style={{ ["--delay" as any]: `${i * 60}ms` }}
                                        >
                                            <div className="sa-dock-label">{d.dockCode}</div>
                                            <div className="sa-dock-bar">
                                                <div className="sa-dock-fill" style={{ width: `${pct}%` }}>
                                                    <span className="sa-dock-value">{d.distance}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: CONTAINER INFO */}
            {isCellOpen && selected && (
                <div className="sa-modal-backdrop" onClick={() => setIsCellOpen(false)}>
                    <div className="sa-container-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="sa-dock-head">
                            <div className="sa-dock-spacer" />
                            <h3 className="sa-dock-title">
                                {cellPos
                                    ? t("storageAreas.modal.container.title", {
                                        bay: cellPos.bay,
                                        row: cellPos.row,
                                        tier: cellPos.tier
                                    })
                                    : t("storageAreas.modal.container.titleFallback")}
                            </h3>
                            <button
                                className="sa-icon-btn sa-dock-close"
                                onClick={() => setIsCellOpen(false)}
                                aria-label={t("storageAreas.modal.close") || "Close"}
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div className="sa-modal-body-modern">
                            {cellLoading && (
                                <div
                                    className="sa-spinner-lg"
                                    aria-label={t("storageAreas.modal.container.loading") || "Loading"}
                                />
                            )}

                            {cellError && (
                                <div className="sa-modal-error">⚠️ {cellError}</div>
                            )}

                            {!cellLoading && !cellError && cellInfo && (
                                <div className="sa-info-grid">
                                    <div className="sa-info-card">
                                        <span>{t("storageAreas.modal.container.isoNumber")}</span>
                                        <strong>{cellInfo.isoNumber}</strong>
                                    </div>
                                    <div className="sa-info-card">
                                        <span>{t("storageAreas.modal.container.description")}</span>
                                        <strong>{cellInfo.description}</strong>
                                    </div>
                                    <div className="sa-info-card">
                                        <span>{t("storageAreas.modal.container.type")}</span>
                                        <strong className="sa-tag-chip sa-chip-general">
                                            {cellInfo.containerType}
                                        </strong>
                                    </div>
                                    <div className="sa-info-card">
                                        <span>{t("storageAreas.modal.container.status")}</span>
                                        <strong
                                            className={`sa-tag-chip sa-chip-${(cellInfo.containerStatus || "unknown")
                                                .toLowerCase()
                                                .replace(/\s+/g, "-")}`}
                                        >
                                            {cellInfo.containerStatus}
                                        </strong>
                                    </div>
                                    <div className="sa-info-card">
                                        <span>{t("storageAreas.modal.container.weight")}</span>
                                        <strong>
                                            {t("storageAreas.modal.container.weight_unit", {
                                                value: cellInfo.weight
                                            })}
                                        </strong>
                                    </div>
                                </div>
                            )}

                            {!cellLoading && !cellError && !cellInfo && (
                                <div className="sa-modal-error">
                                    {t("storageAreas.modal.container.noData")}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/** Translate backend type if needed (keeps original if no mapping) */
function xlateType(type: string, t: (k: string, o?: any) => string) {
    const key = type.toLowerCase();
    // when backend sends "Yard"/"Warehouse" we keep it;
    // if it sends canonical keys, we map.
    const map: Record<string, string> = {
        yard: t("storageAreas.enums.types.yard"),
        warehouse: t("storageAreas.enums.types.warehouse")
    };
    return map[key] || type;
}
