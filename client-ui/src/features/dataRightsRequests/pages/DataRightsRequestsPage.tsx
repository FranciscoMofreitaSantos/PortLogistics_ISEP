// src/features/dataRightsRequests/pages/DataRightsRequestsPage.tsx
import { useMemo } from "react";

import "../style/dataRightsStyle.css";

import { useDataRightsRequests } from "../hooks/useDataRightsRequests";
import { DataRightsHeader } from "../components/DataRightsHeader";
import { DataRightsStrip } from "../components/DataRightsStrip";
import { DataRightsMainPanel } from "../components/DataRightsMainPanel";
import { DataRightsCreatePanel } from "../components/DataRightsCreatePanel";
import type { RequestStatus } from "../domain/dataRights";

export default function DataRightsRequestsPage() {
    const {
        loading,
        filtered,
        selected,
        setSelected,
        query,
        setQuery,
        creating,
        setType,
        updateRectification,
        setCreating,
        submitNewRequest,
        isCreateOpen,
        setIsCreateOpen,
    } = useDataRightsRequests();

    // --- Estatísticas por estado ---
    const stats = useMemo(() => {
        const total = filtered.length;

        const count = (status: RequestStatus) =>
            filtered.filter(r => r.status === status).length;

        return {
            total,
            waiting: count("WaitingForAssignment"),
            inProgress: count("InProgress"),
            completed: count("Completed"),
            rejected: count("Rejected"),
        };
    }, [filtered]);

    return (
        <div className="dr-wrapper">
            <DataRightsHeader
                count={filtered.length}
                query={query}
                onQueryChange={setQuery}
                onToggleCreate={() => setIsCreateOpen(v => !v)}
                isCreateOpen={isCreateOpen}
            />

            {/* --- STATS --- */}
            <section className="dr-stats-row">
                <div className="dr-stat-card dr-stat-total">
                    <span className="dr-stat-label">TOTAL</span>
                    <span className="dr-stat-value">{stats.total}</span>
                </div>

                <div className="dr-stat-card dr-stat-waiting">
                    <span className="dr-stat-label">WAITING FOR ASSIGNMENT</span>
                    <span className="dr-stat-value">{stats.waiting}</span>
                </div>

                <div className="dr-stat-card dr-stat-progress">
                    <span className="dr-stat-label">IN PROGRESS</span>
                    <span className="dr-stat-value">{stats.inProgress}</span>
                </div>

                <div className="dr-stat-card dr-stat-completed">
                    <span className="dr-stat-label">COMPLETED</span>
                    <span className="dr-stat-value">{stats.completed}</span>
                </div>

                <div className="dr-stat-card dr-stat-rejected">
                    <span className="dr-stat-label">REJECTED</span>
                    <span className="dr-stat-value">{stats.rejected}</span>
                </div>
            </section>

            {/* --- CONTEÚDO PRINCIPAL --- */}
            <div className="dr-content">
                <div className="dr-left">
                    <DataRightsStrip
                        items={filtered}
                        loading={loading}
                        selectedId={selected?.id ?? null}
                        onSelect={setSelected}
                    />

                    <DataRightsMainPanel selected={selected} />
                </div>
            </div>

            {/* --- MODAL DE CRIAÇÃO --- */}
            {isCreateOpen && (
                <div
                    className="dr-modal-overlay"
                    onClick={() => setIsCreateOpen(false)}
                >
                    <div
                        className="dr-modal"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            className="dr-modal-close"
                            onClick={() => setIsCreateOpen(false)}
                            aria-label="Close"
                        >
                            ✕
                        </button>

                        <DataRightsCreatePanel
                            creating={creating}
                            setType={setType}
                            updateRectification={updateRectification}
                            setCreating={setCreating}
                            onSubmit={submitNewRequest}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
