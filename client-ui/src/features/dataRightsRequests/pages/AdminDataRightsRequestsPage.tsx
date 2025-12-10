import "../style/dataRightsAdminStyle.css";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useAuth0 } from "@auth0/auth0-react";

import adminDataRightsService from "../service/dataRightsAdminService";
import { mapRequestsDto } from "../mappers/dataRightsMapper";
import type { DataRightsRequest, RequestStatus, RequestType } from "../domain/dataRights";

import { AdminDataRightsHeader } from "../components/admin/AdminDataRightsHeader";
import { AdminDataRightsStrip } from "../components/admin/AdminDataRightsStrip";
import { AdminRequestDetailsModal } from "../components/admin/AdminRequestDetailsModal";
import { RectificationDecisionModal } from "../components/admin/RectificationDecisionModal";

export default function DataRightsAdminPage() {
    const { t } = useTranslation();
    const { user } = useAuth0();

    const [items, setItems] = useState<DataRightsRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [busyAction, setBusyAction] = useState(false);

    // --- ESTADOS DE FILTRO ---
    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<RequestStatus | 'All'>('All');
    const [typeFilter, setTypeFilter] = useState<RequestType | 'All'>('All');

    const [selected, setSelected] = useState<DataRightsRequest | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isRectificationOpen, setIsRectificationOpen] = useState(false);

    const email = user?.email ?? "";

    async function reload() {
        if (!email) return;
        try {
            setLoading(true);

            const [waitingDtos, mineDtos] = await Promise.all([
                adminDataRightsService.getWaitingForAssignment(),
                adminDataRightsService.getForResponsible(email),
            ]);

            const allDtos = [...waitingDtos, ...mineDtos];
            const byId = new Map<string, DataRightsRequest>();
            mapRequestsDto(allDtos).forEach(r => {
                byId.set(r.id, r);
            });

            const list = Array.from(byId.values()).sort((a, b) =>
                a.createdOn.value.localeCompare(b.createdOn.value),
            );

            setItems(list);
            if (list.length && !selected) {
                setSelected(list[0]);
            }
        } catch (e: any) {
            const msg = e?.response?.data?.detail ?? t("dataRights.admin.loadError", "Error loading requests");
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (email) void reload();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [email]);

    // --- FILTRAGEM COMPLETA ---
    const filtered = useMemo(() => {
        if (!items) return [];

        return items.filter(r => {
            // 1. Texto (ID, Email, Tipo, Status)
            const txt = `${r.requestId} ${r.userEmail} ${r.type} ${r.status} ${r.processedBy ?? ""}`.toLowerCase();
            const matchesQuery = query ? txt.includes(query.toLowerCase()) : true;

            // 2. Status
            const matchesStatus = statusFilter === 'All' ? true : r.status === statusFilter;

            // 3. Tipo
            const matchesType = typeFilter === 'All' ? true : r.type === typeFilter;

            return matchesQuery && matchesStatus && matchesType;
        });
    }, [items, query, statusFilter, typeFilter]);

    // --- LIMPAR SELEÇÃO SE DESAPARECER DOS FILTROS ---
    useEffect(() => {
        if (filtered.length === 0) {
            // Se lista vazia, fecha o detalhe (opcional) ou limpa seleção
            // setIsDetailsOpen(false); 
            // setSelected(null); 
            return;
        }
        if (selected) {
            const stillVisible = filtered.find(r => r.id === selected.id);
            if (!stillVisible) {
                // Se o selecionado já não está na lista filtrada, fecha o modal
                setIsDetailsOpen(false);
                setSelected(null);
            }
        }
    }, [filtered, selected]);


    // --- ESTATÍSTICAS ---
    const stats = useMemo(() => {
        const total = items.length;
        const count = (s: RequestStatus) => items.filter(r => r.status === s).length;
        return {
            total,
            waiting: count("WaitingForAssignment"),
            inProgress: count("InProgress"),
            completed: count("Completed"),
            rejected: count("Rejected")
        };
    }, [items]);

    function handleSelect(r: DataRightsRequest) {
        setSelected(r);
        setIsDetailsOpen(true);
    }

    async function handleAssignToMe() {
        if (!selected || !email) return;
        try {
            setBusyAction(true);
            const updated = await adminDataRightsService.assignResponsible(selected.requestId, email);
            toast.success(t("dataRights.admin.assignSuccess", "Request assigned to you"));
            await reload();
            setSelected(prev => prev && prev.requestId === updated.requestId ? { ...prev, ...updated } : prev);
        } catch (e: any) {
            toast.error(t("dataRights.admin.assignError", "Error assigning request"));
        } finally {
            setBusyAction(false);
        }
    }

    async function handleRespond() {
        if (!selected) return;
        if (selected.type === "Rectification"){
            setIsRectificationOpen(true);
            return;
        }
        try {
            setBusyAction(true);
            if (selected.type === "Access") {
                await adminDataRightsService.respondAccess(selected.requestId);
                toast.success(t("dataRights.admin.respondAccessSuccess", "Access response sent"));
            } else if (selected.type === "Deletion") {
                await adminDataRightsService.respondDeletion(selected.requestId);
                toast.success(t("dataRights.admin.respondDeletionSuccess", "Deletion processed"));
            }
            await reload();
            setIsDetailsOpen(false);
        } catch (e: any) {
            toast.error(t("dataRights.admin.respondError", "Error responding"));
        } finally {
            setBusyAction(false);
        }
    }

    return (
        <div className="dr-wrapper dr-admin-wrapper">
            <AdminDataRightsHeader
                stats={stats}
                query={query}
                onQueryChange={setQuery}
                // Passar Props de Filtro
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                typeFilter={typeFilter}
                setTypeFilter={setTypeFilter}
            />

            {/* CARTÕES DE MÉTRICAS */}
            <div className="dr-metrics-row">
                <div className="dr-metric-card">
                    <span className="label">{t("dataRights.stats.total", "Total")}</span>
                    <span className="value">{stats.total}</span>
                </div>
                <div className="dr-metric-card">
                    <span className="label">{t("dataRights.stats.waiting", "Waiting")}</span>
                    <span className="value">{stats.waiting}</span>
                </div>
                <div className="dr-metric-card">
                    <span className="label">{t("dataRights.stats.inProgress", "In progress")}</span>
                    <span className="value">{stats.inProgress}</span>
                </div>
                <div className="dr-metric-card">
                    <span className="label">{t("dataRights.stats.completed", "Completed")}</span>
                    <span className="value success">{stats.completed}</span>
                </div>
                <div className="dr-metric-card">
                    <span className="label">{t("dataRights.stats.rejected", "Rejected")}</span>
                    <span className="value danger">{stats.rejected}</span>
                </div>
            </div>

            <AdminDataRightsStrip
                items={filtered} // Usar lista filtrada
                loading={loading}
                selectedId={selected?.id ?? null}
                onSelect={handleSelect}
            />

            <AdminRequestDetailsModal
                request={selected}
                open={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                onAssignToMe={handleAssignToMe}
                onRespond={handleRespond}
                isBusy={busyAction}
            />

            <RectificationDecisionModal
                open={isRectificationOpen}
                request={selected}
                onClose={() => setIsRectificationOpen(false)}
                onApplied={updated => {
                    setItems(prev => prev.map(r => (r.id === updated.id ? updated : r)));
                    setSelected(updated);
                    setIsRectificationOpen(false);
                    setIsDetailsOpen(false);
                }}
            />
        </div>
    );
}