// src/features/dataRightsRequests/components/DataRightsHeader.tsx
import { useTranslation } from "react-i18next";
import type { RequestStatus, RequestType } from "../domain/dataRights";

type Props = {
    count: number;
    query: string;
    onQueryChange: (v: string) => void;
    onToggleCreate: () => void;
    isCreateOpen: boolean;

    // --- NOVAS PROPS DE FILTRO ---
    statusFilter: RequestStatus | 'All';
    setStatusFilter: (s: RequestStatus | 'All') => void;
    typeFilter: RequestType | 'All';
    setTypeFilter: (t: RequestType | 'All') => void;
};

export function DataRightsHeader({
                                     count,
                                     query,
                                     onQueryChange,
                                     onToggleCreate,
                                     isCreateOpen,
                                     statusFilter,
                                     setStatusFilter,
                                     typeFilter,
                                     setTypeFilter,
                                 }: Props) {
    const { t } = useTranslation();

    // Pequeno componente interno para evitar repetição de código
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
        <header className="dr-header">
            {/* LINHA SUPERIOR (Títulos e Pesquisa) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '1rem' }}>
                <div className="dr-header-left">
                    <h1 className="dr-title">
                        🔐 {t("dataRights.title", "My Data Rights")}
                    </h1>
                    <p className="dr-subtitle">
                        {t("dataRights.subtitle", "Manage your privacy requests and history.")}
                    </p>
                    <span className="dr-chip-count">
                        {t("dataRights.count", "{{count}} requests found", { count })}
                    </span>
                </div>

                <div className="dr-header-right">
                    <input
                        className="dr-search"
                        placeholder={t("dataRights.search_PH", "Search by ID...")}
                        value={query}
                        onChange={e => onQueryChange(e.target.value)}
                    />
                    <button
                        type="button"
                        className="dr-cta-btn"
                        onClick={onToggleCreate}
                    >
                        {isCreateOpen ? "✕ Close" : "+ New Request"}
                    </button>
                </div>
            </div>

            {/* --- BARRA DE FILTROS --- */}
            <div className="dr-filters-toolbar">
                {/* GRUPO 1: STATUS */}
                <div className="dr-filter-group">
                    <span className="dr-filter-label">Status:</span>
                    <FilterBtn label="All" isActive={statusFilter === 'All'} onClick={() => setStatusFilter('All')} />
                    <FilterBtn label="Waiting" icon="⏳" isActive={statusFilter === 'WaitingForAssignment'} onClick={() => setStatusFilter('WaitingForAssignment')} />
                    <FilterBtn label="In Progress" icon="🛠️" isActive={statusFilter === 'InProgress'} onClick={() => setStatusFilter('InProgress')} />
                    <FilterBtn label="Completed" icon="✅" isActive={statusFilter === 'Completed'} onClick={() => setStatusFilter('Completed')} />
                    <FilterBtn label="Rejected" icon="❌" isActive={statusFilter === 'Rejected'} onClick={() => setStatusFilter('Rejected')} />
                </div>

                {/* GRUPO 2: TIPO */}
                <div className="dr-filter-group">
                    <span className="dr-filter-label">Type:</span>
                    <FilterBtn label="All" isActive={typeFilter === 'All'} onClick={() => setTypeFilter('All')} />
                    <FilterBtn label="Access" icon="📄" isActive={typeFilter === 'Access'} onClick={() => setTypeFilter('Access')} />
                    <FilterBtn label="Deletion" icon="🧹" isActive={typeFilter === 'Deletion'} onClick={() => setTypeFilter('Deletion')} />
                    <FilterBtn label="Rectification" icon="✏️" isActive={typeFilter === 'Rectification'} onClick={() => setTypeFilter('Rectification')} />
                </div>
            </div>
        </header>
    );
}