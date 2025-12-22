import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import type { Incident } from "../domain/incident";
import "../style/incidents.css";
import { resolveIncident, deleteIncident,updateListsVVEs } from "../services/incidentService";

export default function IncidentDetailsPanel({
                                                 selected,
                                                 onChanged,
                                                 onDeleted,
                                                 onClose,
                                             }: {
    selected: Incident | null;
    onChanged: (next: Incident) => void;
    onDeleted: (code: string) => void;
    onClose: () => void;
}) {
    const { t } = useTranslation();
    const [busy, setBusy] = useState(false);

    const isResolved = useMemo(() => !!selected?.endTime, [selected]);
    const isNotSpecific = useMemo(
        () => !!selected?.impactMode && selected.impactMode !== "Specific",
        [selected?.impactMode]
    );
    const handleResolve = async () => {
        if (!selected) return;
        setBusy(true);
        try {
            const updated = await resolveIncident(selected.code);
            toast.success(t("incident.success.resolved"));
            onChanged(updated);
        } catch (e) {
            toast.error((e as Error).message || t("incident.errors.resolveFailed"));
        } finally {
            setBusy(false);
        }
    };

    const handleUpdateLists = async () => {
        if (!selected) return;
        setBusy(true);
        try {
            const updated = await updateListsVVEs(selected.code);
            toast.success(t("incident.success.updatedList"));
            onChanged(updated);
        } catch (e) {
            toast.error((e as Error).message || t("incident.errors.updatedFailed"));
        } finally {
            setBusy(false);
        }
    };


    const handleDelete = async () => {
        if (!selected) return;
        const ok = window.confirm(t("incident.confirm.delete", { code: selected.code }));
        if (!ok) return;

        setBusy(true);
        try {
            await deleteIncident(selected.code);
            toast.success(t("incident.success.deleted"));
            onDeleted(selected.code);
        } catch (e) {
            toast.error((e as Error).message || t("incident.errors.deleteFailed"));
        } finally {
            setBusy(false);
        }
    };


    if (!selected) return null;

    const vves = selected.vveList ?? [];

    return (
        <>
            {/* Header Fixo do Modal */}
            <div className="in-details-header">
                <div>
                    <div className="in-title" style={{ fontSize: "1.2rem" }}>
                        {t("incident.details.title")}
                    </div>
                    <div className="in-subtitle">
                        <span className="in-mono">{selected.code}</span>
                        <span style={{ margin: "0 6px", color: "#cbd5e1" }}>|</span>
                        <span className="in-mono">{selected.incidentTypeCode}</span>
                    </div>
                </div>

                <button className="in-close-btn" onClick={onClose} title={t("actions.close")}>
                    ✕
                </button>
            </div>

            {/* Corpo com Scroll */}
            <div className="in-details-body">
                {/* Barra de Ações */}
                <div className="in-actions" style={{ marginBottom: "1.5rem" }}>
                    {!isResolved && (
                        <button className="in-btn in-btn-primary" disabled={busy} onClick={handleResolve}>
                            {t("incident.actions.resolve")}
                        </button>
                    )}
                    <button className="in-btn in-btn-danger" disabled={busy} onClick={handleDelete}>
                        {t("actions.delete")}
                    </button>
                    {isNotSpecific && !isResolved && (
                    <button className="in-btn in-btn-primary" disabled={busy} onClick={handleUpdateLists}>
                        {t("actions.atualizar")}
                    </button>
                    )}
                </div>

                {/* Grid de Informações Principais */}
                <div className="in-kv-grid">
                    <div className="in-kv">
                        <div className="in-k">{t("incident.fields.severity")}</div>
                        <div className="in-v">
              <span className={`in-pill in-pill-${selected.severity.toLowerCase()}`}>
                {t(`incident.severity.${selected.severity}`)}
              </span>
                        </div>
                    </div>

                    <div className="in-kv">
                        <div className="in-k">{t("incident.fields.impactMode")}</div>
                        <div className="in-v">
              <span className="in-pill in-pill-neutral">
                {t(`incident.impact.${selected.impactMode}`)}
              </span>
                        </div>
                    </div>

                    <div className="in-kv">
                        <div className="in-k">{t("incident.fields.startTime")}</div>
                        <div className="in-v">{new Date(selected.startTime).toLocaleString()}</div>
                    </div>

                    <div className="in-kv">
                        <div className="in-k">{t("incident.fields.endTime")}</div>
                        <div className="in-v">
                            {selected.endTime ? new Date(selected.endTime).toLocaleString() : "-"}
                        </div>
                    </div>
                </div>

                {/* Descrição */}
                <div className="in-block">
                    <div className="in-block-title">{t("incident.fields.description")}</div>
                    <div className="in-desc">{selected.description || <span className="in-muted">-</span>}</div>
                </div>

                {/* VVEs (READ-ONLY) */}
                <div className="in-block">
                    <div className="in-block-title">{t("incident.fields.vves")}</div>

                    {vves.length === 0 ? (
                        <div className="in-muted" style={{ fontStyle: "italic", fontSize: "0.85rem" }}>
                            {t("incident.vve.empty")}
                        </div>
                    ) : (
                        <div className="in-chip-wrap">
                            {vves.map((vve) => (
                                <div key={vve} className="in-chip">
                                    <span className="in-mono">{vve}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {selected.upcomingWindowStartTime && selected.upcomingWindowEndTime && (
                    <div className="in-block">
                        <div className="in-block-title">{t("incident.fields.upcomingWindow")}</div>
                        <div className="in-muted">
                            {new Date(selected.upcomingWindowStartTime).toLocaleString()} —{" "}
                            {new Date(selected.upcomingWindowEndTime).toLocaleString()}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}