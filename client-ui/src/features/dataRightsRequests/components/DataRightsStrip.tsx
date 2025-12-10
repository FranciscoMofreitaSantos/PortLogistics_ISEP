// src/features/dataRightsRequests/components/DataRightsStrip.tsx
import { useTranslation } from "react-i18next";
import type { DataRightsRequest } from "../domain/dataRights";

function classNames(...xs: (string | false | null | undefined)[]) {
    return xs.filter(Boolean).join(" ");
}

type Props = {
    items: DataRightsRequest[];
    loading: boolean;
    selectedId: string | null;
    onSelect: (r: DataRightsRequest) => void;
};

export function DataRightsStrip({ items, loading, selectedId, onSelect }: Props) {
    const { t } = useTranslation();

    const statusLabels: Record<string, string> = {
        WaitingForAssignment: "Waiting",
        InProgress: "In Progress",
        Completed: "Completed",
        Rejected: "Rejected",
    };

    return (
        <div className="dr-strip">
            <div className="dr-strip-inner">
                {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div className="dr-strip-skeleton" key={i} />
                    ))
                ) : items.length === 0 ? (
                    <div className="dr-empty">
                        {" "}
                        {t(
                            "dataRights.list.empty",
                            "You don't have any data rights requests yet."
                        )}
                    </div>
                ) : (
                    items.map(r => {
                        const active = selectedId === r.id;
                        // Formatar data curta (ex: 10 Dec)
                        const dateObj = new Date((r.createdOn as any).value ?? r.createdOn);
                        const dateStr = dateObj.toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        });

                        return (
                            <button
                                key={r.id}
                                className={classNames(
                                    "dr-card-mini",
                                    active && "active"
                                )}
                                onClick={() => onSelect(r)}
                            >
                                {/* HEADER: Tipo e Data */}
                                <div className="dr-card-header">
                                    <span className={`dr-badge-type ${r.type}`}>
                                        {r.type === "Access" && "📄 Access"}
                                        {r.type === "Deletion" && "🧹 Deletion"}
                                        {r.type === "Rectification" && "✏️ Rectify"}
                                    </span>
                                    <span className="dr-date">{dateStr}</span>
                                </div>

                                {/* BODY: ID Truncado */}
                                <div className="dr-card-body">
                                    <span className="dr-card-label-small">Request ID</span>
                                    <span className="dr-card-id" title={r.requestId}>
                                        {r.requestId}
                                    </span>
                                </div>

                                {/* FOOTER: Status */}
                                <div className="dr-card-footer">
                                    <div className={`dr-status-badge dr-${r.status}`}>
                                        <div className="dr-status-dot-mini" />
                                        <span>{statusLabels[r.status] ?? r.status}</span>
                                    </div>
                                    {/* Seta indicativa subtil */}
                                    {active && <span style={{fontSize: '1.2rem', color: 'var(--dr-primary)'}}>👉</span>}
                                </div>
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
}