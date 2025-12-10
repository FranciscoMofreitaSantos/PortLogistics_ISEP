// src/features/dataRightsRequests/admin/components/AdminRequestDetailsModal.tsx

import { useTranslation } from "react-i18next";
import type { DataRightsRequest, RequestStatus } from "../../domain/dataRights";

type Props = {
    request: DataRightsRequest | null;
    open: boolean;
    onClose: () => void;
    onAssignToMe: () => void;
    onRespond: () => void;
    isBusy: boolean;
};

// Configuração dos passos (igual à página de utilizador)
const STATUS_STEPS: {
    id: RequestStatus;
    icon: string;
    labelKey: string;
    defaultLabel: string;
}[] = [
    {
        id: "WaitingForAssignment",
        icon: "⏳",
        labelKey: "dataRights.stats.waiting", // Reutiliza as traduções que criámos
        defaultLabel: "Waiting",
    },
    {
        id: "InProgress",
        icon: "🛠️",
        labelKey: "dataRights.stats.inProgress",
        defaultLabel: "In Progress",
    },
    {
        id: "Completed",
        icon: "✅",
        labelKey: "dataRights.stats.completed",
        defaultLabel: "Completed",
    },
    {
        id: "Rejected",
        icon: "❌",
        labelKey: "dataRights.stats.rejected",
        defaultLabel: "Rejected",
    },
];

const STATUS_ORDER: RequestStatus[] = [
    "WaitingForAssignment",
    "InProgress",
    "Completed",
    "Rejected",
];

function getStepState(step: RequestStatus, current: RequestStatus) {
    if (step === current) return "active";
    // Regra especial: se está Rejected, o Completed fica "pending" (e vice-versa visualmente)
    if (current === "Rejected" && step === "Completed") return "pending";
    if (current === "Completed" && step === "Rejected") return "pending";

    const stepIndex = STATUS_ORDER.indexOf(step);
    const currentIndex = STATUS_ORDER.indexOf(current);

    // Se o passo atual é maior que este passo, então este está "done"
    // Nota: Rejeitado e Completado estão no fim, tratamos acima.
    if (stepIndex === -1 || currentIndex === -1) return "pending";

    // Se o pedido está Rejected, Waiting e InProgress estão "done"
    if (current === "Rejected" && stepIndex < 3) return "done";

    return currentIndex > stepIndex ? "done" : "pending";
}

export function AdminRequestDetailsModal({
                                             request,
                                             open,
                                             onClose,
                                             onAssignToMe,
                                             onRespond,
                                             isBusy,
                                         }: Props) {
    const { t } = useTranslation();

    if (!open || !request) return null;

    const created = new Date(
        (request.createdOn as any).value ?? request.createdOn,
    ).toLocaleString();
    const updated = request.updatedOn
        ? new Date(
            (request.updatedOn as any).value ?? request.updatedOn,
        ).toLocaleString()
        : "-";

    const canAssign = !request.processedBy;
    const canRespond =
        request.status === "InProgress" &&
        !!request.processedBy &&
        (request.type === "Access" ||
            request.type === "Deletion" ||
            request.type === "Rectification");

    // Lógica para Payload bonito
    let payloadPretty: string | null = null;
    if (request.payload) {
        try {
            const parsed =
                typeof request.payload === "string"
                    ? JSON.parse(request.payload)
                    : request.payload;
            payloadPretty = JSON.stringify(parsed, null, 2);
        } catch {
            payloadPretty = String(request.payload);
        }
    }

    return (
        <div className="dr-modal-overlay">
            <div className="dr-modal dr-admin-modal">
                <div className="dr-modal-header">
                    <div>
                        <h2 className="dr-card-title">
                            🧾 {t("dataRights.admin.detailsTitle", "Request details")}
                        </h2>
                        <p className="dr-card-subtitle">
                            ID: <strong>{request.requestId}</strong>
                        </p>
                    </div>
                    <button
                        type="button"
                        className="dr-modal-close"
                        onClick={onClose}
                    >
                        ✕
                    </button>
                </div>

                {/* --- NOVA TIMELINE (PROCESS TRACKER) --- */}
                <div className="dr-process-grid">
                    {STATUS_STEPS.map(step => {
                        const state = getStepState(step.id, request.status);

                        let className = "dr-process-step";
                        if (state === "done") className += " done";
                        if (state === "active") className += " active";
                        if (state === "pending") className += " pending";

                        // Estilo especial para cartão Rejeitado
                        if (request.status === "Rejected" && step.id === "Rejected") {
                            className = "dr-process-step rejected-active";
                        } else if (step.id === "Rejected" && state === "done") {
                            // Caso raro se um rejeitado for considerado "passado"
                            className = "dr-process-step rejected-done";
                        }

                        return (
                            <div key={step.id} className={className}>
                                <span className="dr-process-icon">{step.icon}</span>
                                <span className="dr-process-label">
                                    {t(step.labelKey, step.defaultLabel)}
                                </span>
                            </div>
                        );
                    })}
                </div>
                {/* --------------------------------------- */}

                <div className="dr-modal-grid">
                    <div className="dr-field">
                        <span className="dr-label">
                            {t("dataRights.main.type", "Type")}
                        </span>
                        <span className="dr-value dr-pill">
                            {request.type === "Access" && "📄 "}
                            {request.type === "Deletion" && "🧹 "}
                            {request.type === "Rectification" && "✏️ "}
                            {request.type}
                        </span>
                    </div>

                    <div className="dr-field">
                        <span className="dr-label">
                            {t("dataRights.main.status", "Status")}
                        </span>
                        <span className={`dr-value dr-pill dr-${request.status}`}>
                            {request.status}
                        </span>
                    </div>

                    <div className="dr-field">
                        <span className="dr-label">
                            {t("dataRights.admin.userEmail", "User (request owner)")}
                        </span>
                        <span className="dr-value">
                            {request.userEmail}
                        </span>
                    </div>

                    <div className="dr-field">
                        <span className="dr-label">
                            {t("dataRights.main.processedBy", "Processed by")}
                        </span>
                        <span className="dr-value">
                            {request.processedBy ?? "—"}
                        </span>
                    </div>

                    <div className="dr-field">
                        <span className="dr-label">
                            {t("dataRights.main.createdOn", "Created at")}
                        </span>
                        <span className="dr-value">{created}</span>
                    </div>

                    <div className="dr-field">
                        <span className="dr-label">
                            {t("dataRights.main.updatedOn", "Last update")}
                        </span>
                        <span className="dr-value">{updated}</span>
                    </div>
                </div>

                {payloadPretty && (
                    <div className="dr-payload-box dr-payload-box-admin">
                        <h3 className="dr-label">
                            {t("dataRights.main.payload", "Payload / system data")}
                        </h3>
                        <pre className="dr-payload">{payloadPretty}</pre>
                    </div>
                )}

                <div className="dr-modal-actions">
                    {canAssign && (
                        <button
                            type="button"
                            onClick={onAssignToMe}
                            className="dr-primary-btn"
                            disabled={isBusy}
                        >
                            👤 {t("dataRights.admin.assignToMe", "Assign to me")}
                        </button>
                    )}

                    {canRespond && (
                        <button
                            type="button"
                            onClick={onRespond}
                            className="dr-secondary-btn"
                            disabled={isBusy}
                        >
                            🚀{" "}
                            {request.type === "Access"
                                ? t("dataRights.admin.respondAccess", "Generate access response")
                                : request.type === "Deletion"
                                    ? t("dataRights.admin.respondDeletion", "Perform deletion")
                                    : t("dataRights.admin.respondRectification", "Open rectification decision")
                            }
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={onClose}
                        className="dr-ghost-btn"
                        disabled={isBusy}
                    >
                        {t("common.close", "Close")}
                    </button>
                </div>
            </div>
        </div>
    );
}