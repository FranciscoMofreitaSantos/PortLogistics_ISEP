import { useEffect, useMemo, useState } from "react";
import { FaShip, FaCheck, FaXmark } from "react-icons/fa6";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import vvnService from "../service/vvnService";
import type {
    VesselVisitNotificationDto,
    FilterSubmittedVvnStatusDto,
    CargoManifestEntryDto,
    CrewMemberDto,
    Iso6346Code,
} from "../types/vvnTypes";

import "../../storageAreas/style/storageAreaStyle.css";
import "../style/vvn.css";

/* ===== Helpers reutilizados ===== */
const GUID_RE =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

function shortDT(s?: string | null) {
    if (!s) return "-";
    const d = new Date(s);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${dd}/${mm}`;
}

function fmtDT(s?: string | null) {
    if (!s) return "-";
    const d = new Date(s);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
}

/** aceita Iso6346Code | string */
function isoString(x: Iso6346Code | string | undefined | null) {
    if (!x) return "-";
    if (typeof x === "string") return x;
    return (x as any).value || (x as any).Value || "-";
}

/* ========================= PAGE ========================= */

export default function VvnSubmittedAdminPage() {
    const { t } = useTranslation();

    // dados
    const [vvns, setVvns] = useState<VesselVisitNotificationDto[]>([]);
    const [selected, setSelected] = useState<VesselVisitNotificationDto | null>(null);
    const [loading, setLoading] = useState(false);

    // filtros
    const [specificRep, setSpecificRep] = useState<string>("");
    const [imo, setImo] = useState("");
    const [eta, setEta] = useState("");
    const [etd, setEtd] = useState("");
    const [submittedDate, setSubmittedDate] = useState("");

    // modal reject
    const [rejectOpen, setRejectOpen] = useState(false);
    const [rejectMsg, setRejectMsg] = useState("");

    // popups de detalhe (opcional: ver manifests / crew / tasks)
    const [crewOpen, setCrewOpen] = useState(false);
    const [loadOpen, setLoadOpen] = useState(false);
    const [unloadOpen, setUnloadOpen] = useState(false);
    const [tasksOpen, setTasksOpen] = useState(false);

    const filtered = useMemo(() => vvns, [vvns]);

    async function load() {
        setLoading(true);
        try {
            const safeRep = GUID_RE.test(specificRep) ? specificRep : undefined;

            const f: FilterSubmittedVvnStatusDto = {
                specificRepresentative: safeRep,
                vesselImoNumber: imo || undefined,
                estimatedTimeArrival: eta || undefined,
                estimatedTimeDeparture: etd || undefined,
                submittedDate: submittedDate || undefined,
            };

            const data = await vvnService.getSubmittedAll(f);
            setVvns(data);
            setSelected((prev) => {
                if (!prev) return data[0] ?? null;
                const same = data.find((v) => v.id === prev.id);
                return same ?? data[0] ?? null;
            });

            toast.success(t("vvn.toast.loaded") as string);
        } catch (e: any) {
            toast.error(
                e?.response?.data ??
                (t("vvn.toast.loadError") as string) ??
                "Failed to load submitted VVNs",
            );
        } finally {
            setLoading(false);
        }
    }

    // 1º load
    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // reload com debounce ao mexer nos filtros
    useEffect(() => {
        const h = setTimeout(() => {
            load();
        }, 350);
        return () => clearTimeout(h);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [specificRep, imo, eta, etd, submittedDate]);

    async function doAccept(v: VesselVisitNotificationDto) {
        const s = (v.status || "").toString().toLowerCase();
        if (!s.includes("submitted")) {
            toast.error(t("vvn.actions.noActionsForState") as string);
            return;
        }
        await vvnService.acceptById(v.id);
        toast.success(t("vvn.toast.updateSuccess") as string);
        await load();
    }

    function openReject() {
        if (!selected) return;
        setRejectMsg("");
        setRejectOpen(true);
    }

    async function doReject() {
        if (!selected) return;
        if (!rejectMsg.trim()) {
            toast.error(t("vvn.modals.reject.placeholder") as string);
            return;
        }
        await vvnService.rejectByCode({
            vvnCode: selected.code,
            reason: rejectMsg.trim(),
        });
        toast.success(t("vvn.toast.rejectSuccess") as string);
        setRejectOpen(false);
        setRejectMsg("");
        await load();
    }

    /* ==================== RENDER ==================== */

    return (
        <div className="sa-wrapper">
            {/* HEADER: só Submitted (ALL) */}
            <div className="vt-title-area vvn-header-tight">
                <div className="vvn-header-left">
                    <h2 className="vt-title">
                        <FaShip /> {t("vvn.submittedAll.title")}
                    </h2>
                    <div className="vvn-counters">
                        <span className="vvn-chip vvn-chip-sub">
                            {t("vvn.header.submitted", { count: vvns.length })}
                        </span>
                    </div>
                </div>
                <div className="vvn-header-right">
                    <span className="sa-note">
                        {t("vvn.submittedAll.subtitle")}
                    </span>
                </div>
            </div>

            {/* FILTROS (sem tabs) */}
            <div className="vvn-filters">
                <div className="sa-field small">
                    <label>{t("vvn.filters.specificRepGuid")}</label>
                    <input
                        className="sa-input"
                        value={specificRep}
                        onChange={(e) => setSpecificRep(e.target.value)}
                    />
                </div>
                <div className="sa-field small">
                    <label>{t("vvn.filters.imo")}</label>
                    <input
                        className="sa-input"
                        value={imo}
                        onChange={(e) => setImo(e.target.value)}
                    />
                </div>
                <div className="sa-field small">
                    <label>{t("vvn.filters.eta")}</label>
                    <input
                        type="date"
                        className="sa-input"
                        value={eta}
                        onChange={(e) => setEta(e.target.value)}
                    />
                </div>
                <div className="sa-field small">
                    <label>{t("vvn.filters.etd")}</label>
                    <input
                        type="date"
                        className="sa-input"
                        value={etd}
                        onChange={(e) => setEtd(e.target.value)}
                    />
                </div>
                <div className="sa-field small">
                    <label>{t("vvn.filters.submitted")}</label>
                    <input
                        type="date"
                        className="sa-input"
                        value={submittedDate}
                        onChange={(e) => setSubmittedDate(e.target.value)}
                    />
                </div>
            </div>

            {/* LISTA + DETALHE */}
            <div className="vvn-grid">
                <aside className="vvn-list">
                    {loading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <div className="vvn-skel" key={i} />
                        ))
                    ) : filtered.length === 0 ? (
                        <div className="sa-empty">{t("vvn.list.empty")}</div>
                    ) : (
                        filtered.map((v) => {
                            const active = v.id === selected?.id;
                            const statusKey = `v-${(v.status || "").toLowerCase()}`;
                            return (
                                <button
                                    key={v.id}
                                    className={`vvn-item ${active ? "active" : ""}`}
                                    onClick={() => setSelected(v)}
                                >
                                    <div className="vvn-item-top">
                                        <strong>{v.code}</strong>
                                        <span className={`vvn-status ${statusKey}`}>
                                            {v.status}
                                        </span>
                                    </div>
                                    <div className="vvn-item-sub">
                                        {t("vvn.filters.imo")} {v.vesselImo} ·{" "}
                                        {t("vvn.details.eta")}{" "}
                                        {shortDT(v.estimatedTimeArrival)} ·{" "}
                                        {t("vvn.details.etd")}{" "}
                                        {shortDT(v.estimatedTimeDeparture)}
                                    </div>
                                </button>
                            );
                        })
                    )}
                </aside>

                <main className="vvn-main">
                    {!selected ? (
                        <div className="sa-empty">{t("common.selectOne")}</div>
                    ) : (
                        <>
                            {/* HEAD: info + Accept / Reject */}
                            <div className="vvn-head">
                                <div>
                                    <h3 className="vvn-title">{selected.code}</h3>
                                    <div className="vvn-sub">
                                        {t("vvn.filters.imo")} {selected.vesselImo} •{" "}
                                        {t("vvn.details.status")}:{" "}
                                        <b>{selected.status}</b>
                                    </div>
                                </div>
                                <div className="vvn-actions">
                                    <button
                                        className="sa-btn sa-btn-primary"
                                        onClick={() => doAccept(selected)}
                                        title={t("vvn.actions.accept") as string}
                                    >
                                        <FaCheck /> {t("vvn.actions.accept")}
                                    </button>
                                    <button
                                        className="sa-btn sa-btn-danger"
                                        onClick={openReject}
                                        title={t("vvn.actions.reject") as string}
                                    >
                                        <FaXmark /> {t("vvn.actions.reject")}
                                    </button>
                                </div>
                            </div>

                            {/* KPIs simples */}
                            <section className="vvn-kpis">
                                <div className="sa-card">
                                    <div className="sa-card-title">
                                        {t("vvn.details.eta")}
                                    </div>
                                    <div className="sa-card-value">
                                        {fmtDT(selected.estimatedTimeArrival)}
                                    </div>
                                </div>
                                <div className="sa-card">
                                    <div className="sa-card-title">
                                        {t("vvn.details.etd")}
                                    </div>
                                    <div className="sa-card-value">
                                        {fmtDT(selected.estimatedTimeDeparture)}
                                    </div>
                                </div>
                                <div className="sa-card">
                                    <div className="sa-card-title">
                                        {t("vvn.details.volume")}
                                    </div>
                                    <div className="sa-card-value">{selected.volume}</div>
                                </div>
                                <div className="sa-card">
                                    <div className="sa-card-title">
                                        {t("vvn.details.dock")}
                                    </div>
                                    <div className="sa-card-value">
                                        {selected.dock || "-"}
                                    </div>
                                </div>
                            </section>

                            {/* Acesso rápido aos detalhes (crew/loading/unloading/tasks) */}
                            <div className="vvn-quick-grid">
                                <button
                                    className="vvn-tile is-crew"
                                    onClick={() => setCrewOpen(true)}
                                >
                                    <span className="vvn-ico">🧑‍✈️</span>
                                    <span className="vvn-text">
                                        <b>{t("vvn.modals.crew.title")}</b>
                                        <span>{t("vvn.quick.crewSubtitle")}</span>
                                    </span>
                                </button>

                                <button
                                    className="vvn-tile is-loading"
                                    onClick={() => setLoadOpen(true)}
                                >
                                    <span className="vvn-ico">📦</span>
                                    <span className="vvn-text">
                                        <b>{t("vvn.modals.loading.title")}</b>
                                        <span>{t("vvn.quick.loadingSubtitle")}</span>
                                    </span>
                                </button>

                                <button
                                    className="vvn-tile is-unloading"
                                    onClick={() => setUnloadOpen(true)}
                                >
                                    <span className="vvn-ico">📤</span>
                                    <span className="vvn-text">
                                        <b>{t("vvn.modals.unloading.title")}</b>
                                        <span>{t("vvn.quick.unloadingSubtitle")}</span>
                                    </span>
                                </button>

                                <button
                                    className="vvn-tile is-tasks"
                                    onClick={() => setTasksOpen(true)}
                                >
                                    <span className="vvn-ico">✅</span>
                                    <span className="vvn-text">
                                        <b>{t("vvn.modals.tasks.title")}</b>
                                        <span>{t("vvn.quick.tasksSubtitle")}</span>
                                    </span>
                                </button>
                            </div>
                        </>
                    )}
                </main>
            </div>

            {/* ===== REJECT MODAL ===== */}
            {rejectOpen && (
                <div className="sa-modal-backdrop" onClick={() => setRejectOpen(false)}>
                    <div className="vvn-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="sa-dock-head">
                            <div className="sa-dock-spacer" />
                            <h3 className="sa-dock-title">
                                {t("vvn.modals.reject.title")}
                            </h3>
                            <button
                                className="sa-icon-btn sa-dock-close"
                                onClick={() => setRejectOpen(false)}
                            >
                                ✖
                            </button>
                        </div>
                        <div className="vvn-modal-body">
                            <textarea
                                className="sa-textarea"
                                placeholder={
                                    (t("vvn.modals.reject.placeholder") as string) ||
                                    (t("common.reasonPlaceholder") as string)
                                }
                                value={rejectMsg}
                                onChange={(e) => setRejectMsg(e.target.value)}
                            />
                        </div>
                        <div className="vvn-modal-actions">
                            <button
                                className="sa-btn sa-btn-cancel"
                                onClick={() => setRejectOpen(false)}
                            >
                                {t("common.cancel")}
                            </button>
                            <button
                                className="sa-btn sa-btn-danger"
                                onClick={doReject}
                            >
                                {t("common.confirm")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== POPUPS DE DETALHE (mesmo estilo da outra page) ===== */}

            {/* Crew Manifest */}
            {crewOpen && selected && (
                <div className="sa-modal-backdrop" onClick={() => setCrewOpen(false)}>
                    <div className="vvn-pop-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="sa-dock-head">
                            <div className="sa-dock-spacer" />
                            <h3 className="sa-dock-title">
                                {t("vvn.modals.crew.title")}
                            </h3>
                            <button
                                className="sa-icon-btn sa-dock-close"
                                onClick={() => setCrewOpen(false)}
                            >
                                ✖
                            </button>
                        </div>
                        {!selected.crewManifest ? (
                            <div className="sa-empty">
                                {t("vvn.modals.crew.empty")}
                            </div>
                        ) : (
                            <>
                                <div className="vvn-def">
                                    <div>
                                        <span>
                                            {t("vvn.modals.crew.captain")}
                                            <br />
                                        </span>
                                        <strong>{selected.crewManifest.captainName}</strong>
                                    </div>
                                    <div>
                                        <span>
                                            {t("vvn.modals.crew.total")}
                                            <br />
                                        </span>
                                        <strong>{selected.crewManifest.totalCrew}</strong>
                                    </div>
                                </div>
                                <div className="vvn-table-wrap">
                                    <table className="vvn-table">
                                        <thead>
                                        <tr>
                                            <th>
                                                {t("vvn.modals.crew.table.name")}
                                            </th>
                                            <th>
                                                {t("vvn.modals.crew.table.role")}
                                            </th>
                                            <th>
                                                {t(
                                                    "vvn.modals.crew.table.nationality",
                                                )}
                                            </th>
                                            <th>
                                                {t(
                                                    "vvn.modals.crew.table.citizenId",
                                                )}
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {(selected.crewManifest.crewMembers || []).map(
                                            (m: CrewMemberDto) => (
                                                <tr key={m.id}>
                                                    <td>{m.name}</td>
                                                    <td>{m.role}</td>
                                                    <td>{m.nationality}</td>
                                                    <td>{m.citizenId}</td>
                                                </tr>
                                            ),
                                        )}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Loading Cargo Manifest */}
            {loadOpen && selected && (
                <div className="sa-modal-backdrop" onClick={() => setLoadOpen(false)}>
                    <div className="vvn-pop-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="sa-dock-head">
                            <div className="sa-dock-spacer" />
                            <h3 className="sa-dock-title">
                                {t("vvn.modals.loading.title")}
                            </h3>
                            <button
                                className="sa-icon-btn sa-dock-close"
                                onClick={() => setLoadOpen(false)}
                            >
                                ✖
                            </button>
                        </div>
                        {!selected.loadingCargoManifest ? (
                            <div className="sa-empty">
                                {t("vvn.modals.loading.empty")}
                            </div>
                        ) : (
                            <>
                                <div className="vvn-def">
                                    <div>
                                        <span>
                                            {t("vvn.modals.loading.code")}
                                            <br />
                                        </span>
                                        <strong>
                                            {selected.loadingCargoManifest.code}
                                        </strong>
                                    </div>
                                    <div>
                                        <span>
                                            {t("vvn.modals.loading.type")}
                                            <br />
                                        </span>
                                        <strong>
                                            {selected.loadingCargoManifest.type}
                                        </strong>
                                    </div>
                                    <div>
                                        <span>
                                            {t("vvn.modals.loading.created")}
                                            <br />
                                        </span>
                                        <strong>
                                            {fmtDT(
                                                selected.loadingCargoManifest
                                                    .createdAt,
                                            )}
                                        </strong>
                                    </div>
                                    <div>
                                        <span>
                                            {t("vvn.modals.loading.createdBy")}
                                            <br />
                                        </span>
                                        <strong>
                                            {
                                                selected.loadingCargoManifest
                                                    .createdBy
                                            }
                                        </strong>
                                    </div>
                                </div>
                                <EntriesTable
                                    entries={selected.loadingCargoManifest.entries}
                                />
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Unloading Cargo Manifest */}
            {unloadOpen && selected && (
                <div className="sa-modal-backdrop" onClick={() => setUnloadOpen(false)}>
                    <div className="vvn-pop-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="sa-dock-head">
                            <div className="sa-dock-spacer" />
                            <h3 className="sa-dock-title">
                                {t("vvn.modals.unloading.title")}
                            </h3>
                            <button
                                className="sa-icon-btn sa-dock-close"
                                onClick={() => setUnloadOpen(false)}
                            >
                                ✖
                            </button>
                        </div>
                        {!selected.unloadingCargoManifest ? (
                            <div className="sa-empty">
                                {t("vvn.modals.unloading.empty")}
                                <br />
                            </div>
                        ) : (
                            <>
                                <div className="vvn-def">
                                    <div>
                                        <span>
                                            {t("vvn.modals.unloading.code")}
                                            <br />
                                        </span>
                                        <strong>
                                            {selected.unloadingCargoManifest.code}
                                        </strong>
                                    </div>
                                    <div>
                                        <span>
                                            {t("vvn.modals.unloading.type")}
                                            <br />
                                        </span>
                                        <strong>
                                            {selected.unloadingCargoManifest.type}
                                        </strong>
                                    </div>
                                    <div>
                                        <span>
                                            {t("vvn.modals.unloading.created")}
                                            <br />
                                        </span>
                                        <strong>
                                            {fmtDT(
                                                selected.unloadingCargoManifest
                                                    .createdAt,
                                            )}
                                        </strong>
                                    </div>
                                    <div>
                                        <span>
                                            {t("vvn.modals.unloading.createdBy")}
                                            <br />
                                        </span>
                                        <strong>
                                            {
                                                selected.unloadingCargoManifest
                                                    .createdBy
                                            }
                                        </strong>
                                    </div>
                                </div>
                                <EntriesTable
                                    entries={selected.unloadingCargoManifest.entries}
                                />
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Tasks */}
            {tasksOpen && selected && (
                <div className="sa-modal-backdrop" onClick={() => setTasksOpen(false)}>
                    <div className="vvn-pop-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="sa-dock-head">
                            <div className="sa-dock-spacer" />
                            <h3 className="sa-dock-title">
                                {t("vvn.modals.tasks.title")}
                            </h3>
                            <button
                                className="sa-icon-btn sa-dock-close"
                                onClick={() => setTasksOpen(false)}
                            >
                                ✖
                            </button>
                        </div>
                        {!selected.tasks || selected.tasks.length === 0 ? (
                            <div className="sa-empty">
                                {t("vvn.modals.tasks.empty")}
                                <br />
                            </div>
                        ) : (
                            <ul className="vvn-task-list">
                                {selected.tasks.map((tk) => (
                                    <li key={tk.id}>
                                        <b>{tk.title}</b>
                                        {tk.status ? (
                                            <span className="vvn-task-status">
                                                {" "}
                                                · {tk.status}
                                            </span>
                                        ) : null}
                                        {tk.description ? (
                                            <div className="vvn-task-desc">
                                                {tk.description}
                                            </div>
                                        ) : null}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

/* Tabela de entries de cargo manifest (mesma da outra page) */
function EntriesTable({ entries }: { entries: CargoManifestEntryDto[] }) {
    const { t } = useTranslation();
    if (!entries || entries.length === 0)
        return <div className="sa-empty">{t("vvn.modals.loading.empty")}</div>;
    return (
        <div className="vvn-table-wrap">
            <table className="vvn-table">
                <thead>
                <tr>
                    <th>{t("vvn.entriesTable.storageArea")}</th>
                    <th>{t("vvn.entriesTable.position")}</th>
                    <th>{t("vvn.entriesTable.iso")}</th>
                    <th>{t("vvn.entriesTable.type")}</th>
                    <th>{t("vvn.entriesTable.status")}</th>
                    <th>{t("vvn.entriesTable.weight")}</th>
                </tr>
                </thead>
                <tbody>
                {entries.map((e) => (
                    <tr key={e.id}>
                        <td>{e.storageAreaName}</td>
                        <td>{`Bay ${e.bay} · Row ${e.row} · Tier ${e.tier}`}</td>
                        <td>{isoString(e.container?.isoCode)}</td>
                        <td>{e.container?.type ?? "-"}</td>
                        <td>{e.container?.status ?? "-"}</td>
                        <td>{e.container?.weightKg ?? 0}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
