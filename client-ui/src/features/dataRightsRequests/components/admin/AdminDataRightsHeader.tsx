import { useTranslation } from "react-i18next";
import type { RequestStatus, RequestType } from "../../domain/dataRights";

type Stats = {
    total: number;
    waiting: number;
    inProgress: number;
    completed: number;
    rejected: number;
};

type Props = {
    stats: Stats;
    query: string;
    onQueryChange: (v: string) => void;

    // --- NOVAS PROPS DE FILTRO ---
    statusFilter: RequestStatus | 'All';
    setStatusFilter: (s: RequestStatus | 'All') => void;
    typeFilter: RequestType | 'All';
    setTypeFilter: (t: RequestType | 'All') => void;
};

export function AdminDataRightsHeader({
                                          stats,
                                          query,
                                          onQueryChange,
                                          statusFilter,
                                          setStatusFilter,
                                          typeFilter,
                                          setTypeFilter,
                                      }: Props) {
    const { t } = useTranslation();

    // Helper para os botões (reutilizado)
    const FilterBtn = ({
                           label,
                           isActive,
                           onClick,
                           icon
                       }: { label: string, isActive: boolean, onClick: () => void, icon?: string }) => (
        <button
            type="button"
            className={`dr-filter-chip ${isActive ? "active" : ""}`}
            onClick={onClick}
        >
            {icon && <span className="dr-chip-icon">{icon}</span>}
            {label}
        </button>
    );

    return (
        <header className="dr-header dr-admin-header">
            {/* LINHA SUPERIOR */}
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '1rem' }}>
                <div className="dr-header-left">
                    <h1 className="dr-title">
                        🛡️ {t("dataRights.admin.title", "Data Rights – Admin")}
                    </h1>
                    <p className="dr-subtitle">
                        {t("dataRights.admin.subtitle", "Manage GDPR / privacy requests, assign yourself and respond.")}
                    </p>
                    <span className="dr-chip-count">
                        {t("dataRights.count", "{{count}} total", { count: stats.total })}
                    </span>
                </div>

                <div className="dr-header-right">
                    <input
                        className="dr-search"
                        placeholder={t("dataRights.admin.search_PH", "Search by ID, email...")}
                        value={query}
                        onChange={e => onQueryChange(e.target.value)}
                    />
                </div>
            </div>

            {/* --- BARRA DE FILTROS --- */}
            <div className="dr-filters-toolbar">
                {/* STATUS */}
                <div className="dr-filter-group">
                    <span className="dr-filter-label">
                        {t("dataRights.filters.statusLabel", "Status:")}
                    </span>
                    <FilterBtn label={t("dataRights.filters.all", "All")} isActive={statusFilter === 'All'} onClick={() => setStatusFilter('All')} />
                    <FilterBtn label={t("dataRights.filters.waiting", "Waiting")} icon="⏳" isActive={statusFilter === 'WaitingForAssignment'} onClick={() => setStatusFilter('WaitingForAssignment')} />
                    <FilterBtn label={t("dataRights.filters.inProgress", "In Progress")} icon="🛠️" isActive={statusFilter === 'InProgress'} onClick={() => setStatusFilter('InProgress')} />
                    <FilterBtn label={t("dataRights.filters.completed", "Completed")} icon="✅" isActive={statusFilter === 'Completed'} onClick={() => setStatusFilter('Completed')} />
                    <FilterBtn label={t("dataRights.filters.rejected", "Rejected")} icon="❌" isActive={statusFilter === 'Rejected'} onClick={() => setStatusFilter('Rejected')} />
                </div>

                {/* TIPO */}
                <div className="dr-filter-group">
                    <span className="dr-filter-label">
                        {t("dataRights.filters.typeLabel", "Type:")}
                    </span>
                    <FilterBtn label={t("dataRights.filters.all", "All")} isActive={typeFilter === 'All'} onClick={() => setTypeFilter('All')} />
                    <FilterBtn label={t("dataRights.filters.access", "Access")} icon="📄" isActive={typeFilter === 'Access'} onClick={() => setTypeFilter('Access')} />
                    <FilterBtn label={t("dataRights.filters.deletion", "Deletion")} icon="🧹" isActive={typeFilter === 'Deletion'} onClick={() => setTypeFilter('Deletion')} />
                    <FilterBtn label={t("dataRights.filters.rectification", "Rectification")} icon="✏️" isActive={typeFilter === 'Rectification'} onClick={() => setTypeFilter('Rectification')} />
                </div>
            </div>
        </header>
    );
}