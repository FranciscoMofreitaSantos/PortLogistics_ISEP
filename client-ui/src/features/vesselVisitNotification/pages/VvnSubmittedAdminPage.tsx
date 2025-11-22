import { useEffect, useMemo, useState } from "react";
import { FaShip, FaCheck, FaXmark } from "react-icons/fa6";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import vvnService from "../service/vvnService";
import type {
    VesselVisitNotificationDto,
    FilterSubmittedVvnStatusDto,
} from "../dto/vvnTypesDtos";

import { GUID_RE, shortDT, fmtDT } from "../mappers/vvnMappers";

import { VvnCrewModal } from "../components/modals/VvnCrewModal";
import { VvnCargoManifestModal } from "../components/modals/VvnCargoManifestModal";
import { VvnTasksModal } from "../components/modals/VvnTasksModal";
import { VvnRejectModal } from "../components/modals/VvnRejectModal";

import "../../storageAreas/style/storageAreaStyle.css";
import "../style/vvn.css";

/* ========================= PAGE ========================= */

export default function VvnSubmittedAdminPage() {
    const { t } = useTranslation();

    // dados
    const [vvns, setVvns] = useState<VesselVisitNotificationDto[]>([]);
    const [selected, setSelected] = useState<VesselVisitNotificationDto | null>(
        null,
    );
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

    // popups de detalhe
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
                            {t("vvn.header.submitted", {
                                count: vvns.length,
                            })}
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
                            const statusKey = `v-${(
                                v.status || ""
                            ).toLowerCase()}`;
                            return (
                                <button
                                    key={v.id}
                                    className={`vvn-item ${
                                        active ? "active" : ""
                                    }`}
                                    onClick={() => setSelected(v)}
                                >
                                    <div className="vvn-item-top">
                                        <strong>{v.code}</strong>
                                        <span
                                            className={`vvn-status ${statusKey}`}
                                        >
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
                        <div className="sa-empty">
                            {t("common.selectOne")}
                        </div>
                    ) : (
                        <>
                            {/* HEAD: info + Accept / Reject */}
                            <div className="vvn-head">
                                <div>
                                    <h3 className="vvn-title">
                                        {selected.code}
                                    </h3>
                                    <div className="vvn-sub">
                                        {t("vvn.filters.imo")}{" "}
                                        {selected.vesselImo} •{" "}
                                        {t("vvn.details.status")}:{" "}
                                        <b>{selected.status}</b>
                                    </div>
                                </div>
                                <div className="vvn-actions">
                                    <button
                                        className="sa-btn sa-btn-primary"
                                        onClick={() => doAccept(selected)}
                                        title={
                                            t(
                                                "vvn.actions.accept",
                                            ) as string
                                        }
                                    >
                                        <FaCheck /> {t("vvn.actions.accept")}
                                    </button>
                                    <button
                                        className="sa-btn sa-btn-danger"
                                        onClick={openReject}
                                        title={
                                            t(
                                                "vvn.actions.reject",
                                            ) as string
                                        }
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
                                    <div className="sa-card-value">
                                        {selected.volume}
                                    </div>
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

                            {/* Acesso rápido aos detalhes */}
                            <div className="vvn-quick-grid">
                                <button
                                    className="vvn-tile is-crew"
                                    onClick={() => setCrewOpen(true)}
                                >
                                    <span className="vvn-ico">🧑‍✈️</span>
                                    <span className="vvn-text">
                                        <b>{t("vvn.modals.crew.title")}</b>
                                        <span>
                                            {t("vvn.quick.crewSubtitle")}
                                        </span>
                                    </span>
                                </button>

                                <button
                                    className="vvn-tile is-loading"
                                    onClick={() => setLoadOpen(true)}
                                >
                                    <span className="vvn-ico">📦</span>
                                    <span className="vvn-text">
                                        <b>{t("vvn.modals.loading.title")}</b>
                                        <span>
                                            {t("vvn.quick.loadingSubtitle")}
                                        </span>
                                    </span>
                                </button>

                                <button
                                    className="vvn-tile is-unloading"
                                    onClick={() => setUnloadOpen(true)}
                                >
                                    <span className="vvn-ico">📤</span>
                                    <span className="vvn-text">
                                        <b>{t("vvn.modals.unloading.title")}</b>
                                        <span>
                                            {t("vvn.quick.unloadingSubtitle")}
                                        </span>
                                    </span>
                                </button>

                                <button
                                    className="vvn-tile is-tasks"
                                    onClick={() => setTasksOpen(true)}
                                >
                                    <span className="vvn-ico">✅</span>
                                    <span className="vvn-text">
                                        <b>{t("vvn.modals.tasks.title")}</b>
                                        <span>
                                            {t("vvn.quick.tasksSubtitle")}
                                        </span>
                                    </span>
                                </button>
                            </div>
                        </>
                    )}
                </main>
            </div>

            {/* ===== MODAIS REUTILIZÁVEIS ===== */}

            <VvnRejectModal
                open={rejectOpen}
                onClose={() => setRejectOpen(false)}
                message={rejectMsg}
                setMessage={setRejectMsg}
                onConfirm={doReject}
            />

            <VvnCrewModal
                open={crewOpen && !!selected}
                onClose={() => setCrewOpen(false)}
                crewManifest={selected?.crewManifest ?? null}
            />

            <VvnCargoManifestModal
                open={loadOpen && !!selected}
                onClose={() => setLoadOpen(false)}
                manifest={selected?.loadingCargoManifest ?? null}
                mode="loading"
            />

            <VvnCargoManifestModal
                open={unloadOpen && !!selected}
                onClose={() => setUnloadOpen(false)}
                manifest={selected?.unloadingCargoManifest ?? null}
                mode="unloading"
            />

            <VvnTasksModal
                open={tasksOpen && !!selected}
                onClose={() => setTasksOpen(false)}
                tasks={selected?.tasks ?? []}
            />
        </div>
    );
}
