// src/features/dataRightsRequests/pages/DataRightsRequestsPage.tsx
import { useMemo, useState, useEffect } from "react"; // <--- ADICIONA useEffect AQUI
import "../style/dataRightsStyle.css";

import { useDataRightsRequests } from "../hooks/useDataRightsRequests";
import { DataRightsHeader } from "../components/DataRightsHeader";
import { DataRightsStrip } from "../components/DataRightsStrip";
import { DataRightsMainPanel } from "../components/DataRightsMainPanel";
import { DataRightsCreatePanel } from "../components/DataRightsCreatePanel";

import type { RequestStatus, RequestType, DataRightsRequest } from "../domain/dataRights";

export default function DataRightsRequestsPage() {
    const {
        loading,
        items,
        selected,
        setSelected,
        creating,
        setType,
        updateRectification,
        setCreating,
        submitNewRequest,
        isCreateOpen,
        setIsCreateOpen,
    } = useDataRightsRequests();

    // --- ESTADOS DE FILTRO ---
    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<RequestStatus | 'All'>('All');
    const [typeFilter, setTypeFilter] = useState<RequestType | 'All'>('All');

    // --- LÓGICA DE FILTRAGEM ---
    const filtered = useMemo(() => {
        if (!items) return [];

        return items.filter((r: DataRightsRequest) => {
            const matchesQuery = query
                ? r.requestId.toLowerCase().includes(query.toLowerCase())
                : true;
            const matchesStatus = statusFilter === 'All'
                ? true
                : r.status === statusFilter;
            const matchesType = typeFilter === 'All'
                ? true
                : r.type === typeFilter;

            return matchesQuery && matchesStatus && matchesType;
        });
    }, [items, query, statusFilter, typeFilter]);

    // =================================================================
    //  NOVO: LIMPAR SELEÇÃO QUANDO OS FILTROS MUDAM
    // =================================================================
    useEffect(() => {
        // 1. Se não houver nada na lista filtrada, limpa a seleção
        if (filtered.length === 0) {
            if (selected !== null) setSelected(null);
            return;
        }

        // 2. Se a lista tem itens, mas o item selecionado NÃO está lá
        // (ex: estavas a ver um "Completed" e mudaste o filtro para "Waiting")
        if (selected) {
            const isStillVisible = filtered.find(r => r.id === selected.id);
            if (!isStillVisible) {
                setSelected(null); // Limpa o painel
                // OU, se preferires selecionar logo o primeiro da nova lista:
                // setSelected(filtered[0]); 
            }
        }
    }, [filtered, selected, setSelected]);
    // =================================================================


    // --- ESTATÍSTICAS ---
    const stats = useMemo(() => {
        const list = items || [];
        const count = (s: RequestStatus) => list.filter((r: DataRightsRequest) => r.status === s).length;

        return {
            total: list.length,
            waiting: count("WaitingForAssignment"),
            inProgress: count("InProgress"),
            completed: count("Completed"),
            rejected: count("Rejected"),
        };
    }, [items]);

    return (
        <div className="dr-wrapper">
            <DataRightsHeader
                count={filtered.length}
                query={query}
                onQueryChange={setQuery}
                onToggleCreate={() => setIsCreateOpen(v => !v)}
                isCreateOpen={isCreateOpen}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                typeFilter={typeFilter}
                setTypeFilter={setTypeFilter}
            />

            <section className="dr-stats-row">
                <div className="dr-stat-card dr-stat-total">
                    <span className="dr-stat-label">TOTAL</span>
                    <span className="dr-stat-value">{stats.total}</span>
                </div>
                <div className="dr-stat-card dr-stat-waiting">
                    <span className="dr-stat-label">WAITING</span>
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

            {isCreateOpen && (
                <div className="dr-modal-overlay" onClick={() => setIsCreateOpen(false)}>
                    <div className="dr-modal" onClick={e => e.stopPropagation()}>
                        <button className="dr-modal-close" onClick={() => setIsCreateOpen(false)}>✕</button>
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