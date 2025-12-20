import { useState, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { BookAIcon } from "lucide-react";
import "../style/complementaryTask.css";

import {
    getAllCT,
    getCTByCode,
    getCTByCategory,
    getCTByStaff,
    getCTByVve,
    getScheduledCT,
    getCompletedCT,
    getInProgressCT,
    getCTInRange,
    updateCT
} from "../services/complementaryTaskService";

import {
    getCTCById,
    getAllCTC
} from "../../complementaryTaskCategory/services/complementaryTaskCategoryService";

import {
    getAllVVE,
    getVVEById
} from "../../vesselVisitExecution/services/vesselVisitExecutionService";

import type { ComplementaryTask } from "../domain/complementaryTask";
import type { ComplementaryTaskCategory } from "../../complementaryTaskCategory/domain/complementaryTaskCategory";
import type { VesselVisitExecutionDTO } from "../../vesselVisitExecution/dto/vesselVisitExecutionDTO";
import type { UpdateComplementaryTaskDTO } from "../dtos/updateComplementaryTaskDTO";

import ComplementaryTaskTable from "../components/ComplementaryTaskTable";
import ComplementaryTaskSearch from "../components/ComplementaryTaskSearch";
import ComplementaryTaskCreateModal from "../components/ComplementaryTaskCreateModal";
import ComplementaryTaskEditModal from "../components/ComplementaryTaskEditModal";
import ComplementaryTaskCategoryDetailsModal from "../../complementaryTaskCategory/components/ComplementaryTaskCategoryDetailsModal";
import ComplementaryTaskFixCategoryModal from "../components/ComplementaryTaskFixCategoryModal";
import VesselVisitExecutionDetailsModal from "../../vesselVisitExecution/components/vesselVisitExecutionDetailsModal.tsx";

export type FilterType = "all" | "code" | "category" | "staff" | "vve" | "scheduled" | "completed" | "inProgress" | "range";

function ComplementaryTaskPage() {
    const { t } = useTranslation();
    const didMountRef = useRef(false);

    const [tasks, setTasks] = useState<ComplementaryTask[]>([]);
    const [categories, setCategories] = useState<ComplementaryTaskCategory[]>([]);
    const [vves, setVves] = useState<VesselVisitExecutionDTO[]>([]);

    const [selectedTask, setSelectedTask] = useState<ComplementaryTask | null>(null);
    const [viewCategory, setViewCategory] = useState<ComplementaryTaskCategory | null>(null);
    const [viewVve, setViewVve] = useState<VesselVisitExecutionDTO | null>(null);
    const [taskToFix, setTaskToFix] = useState<ComplementaryTask | null>(null);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isCategoryDetailsOpen, setIsCategoryDetailsOpen] = useState(false);
    const [isVveDetailsOpen, setIsVveDetailsOpen] = useState(false);
    const [isFixModalOpen, setIsFixModalOpen] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!didMountRef.current) {
            didMountRef.current = true;
            loadData();
        }
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [tasksData, catsData, vvesData] = await Promise.all([
                getAllCT(),
                getAllCTC(),
                getAllVVE()
            ]);

            setTasks(tasksData);
            setCategories(catsData);
            setVves(vvesData as unknown as VesselVisitExecutionDTO[]);
        } catch (err) {
            setError(err as Error);
            toast.error(t("ct.errors.loadAll") || "Error loading data");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = async (type: FilterType, value: any) => {
        setIsLoading(true);
        setError(null);
        try {
            let data: ComplementaryTask[] = [];
            switch (type) {
                case "code":
                    try {
                        const result = await getCTByCode(value);
                        data = result ? [result] : [];
                    } catch { data = []; }
                    break;
                case "category": data = await getCTByCategory(value); break;
                case "staff": data = await getCTByStaff(value); break;
                case "vve": data = await getCTByVve(value); break;
                case "scheduled": data = await getScheduledCT(); break;
                case "completed": data = await getCompletedCT(); break;
                case "inProgress": data = await getInProgressCT(); break;
                case "range":
                    data = await getCTInRange(value.start, value.end);
                    break;
                case "all":
                default:
                    await loadData();
                    return;
            }
            setTasks(data);
        } catch (err) {
            setError(err as Error);
            setTasks([]);
            toast.error(t("ct.errors.search") || "Search failed");
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = async (code: string, newStatus: string) => {
        setIsLoading(true);
        try {
            const task = tasks.find(t => t.code === code);
            if (!task) throw new Error("Task not found");


            const updateDto: UpdateComplementaryTaskDTO = {
                category: task.category,
                staff: task.staff,
                status: newStatus as any,
                timeStart: task.timeStart,
                vve: task.vve,
                ...(newStatus === "Completed" && { timeEnd: new Date() })
            };

            await updateCT(code, updateDto as any);
            toast.success(t("ct.success.statusUpdated") || "Status updated successfully");
            await loadData();
        } catch (err) {
            toast.error((err as Error).message || t("ct.errors.statusUpdateFailed"));
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewVve = async (vveId: string) => {
        if (!vveId) return;
        setIsLoading(true);
        try {
            const vveData = await getVVEById(vveId);
            setViewVve(vveData as unknown as VesselVisitExecutionDTO);
            setIsVveDetailsOpen(true);
        } catch {
            toast.error("Failed to load VVE details");
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewCategory = async (categoryId: string) => {
        setIsLoading(true);
        try {
            const categoryData = await getCTCById(categoryId);
            setViewCategory(categoryData);
            setIsCategoryDetailsOpen(true);
        } catch {
            toast.error(t("ct.errors.loadCategory") || "Failed to load category details");
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (task: ComplementaryTask) => {
        setSelectedTask(task);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedTask(null);
        loadData();
    };

    const stats = useMemo(() => {
        const total = tasks.length;
        const scheduled = tasks.filter(t => t.status === "Scheduled").length;
        const inProgress = tasks.filter(t => t.status === "InProgress").length;
        const completed = tasks.filter(t => t.status === "Completed").length;
        return { total, scheduled, inProgress, completed };
    }, [tasks]);

    return (
        <div className="ct-page-container">
            <div className="ct-header">
                <Link to="/dashboard" className="ct-back-button" title={t("actions.backToDashboard")}>
                    ‹
                </Link>
                <h1>
                    <BookAIcon className="ct-icon" /> {t("ct.title") || "Complementary Tasks"}
                </h1>
            </div>

            <div className="ct-controls-container">
                <div className="ct-stats-grid">
                    <div className="ct-stat-card total" onClick={() => handleSearch("all", "")} style={{cursor: 'pointer'}}>
                        <span className="stat-icon">📋</span>
                        <span className="stat-value">{stats.total}</span>
                        <span className="stat-title">{t("ct.stats.total") || "Total"}</span>
                    </div>
                    <div className="ct-stat-card warning" onClick={() => handleSearch("scheduled", "")} style={{cursor: 'pointer'}}>
                        <span className="stat-icon">⏳</span>
                        <span className="stat-value">{stats.scheduled}</span>
                        <span className="stat-title">{t("ct.stats.scheduled") || "Scheduled"}</span>
                    </div>
                    <div className="ct-stat-card active" onClick={() => handleSearch("inProgress", "")} style={{cursor: 'pointer'}}>
                        <span className="stat-icon">⚙️</span>
                        <span className="stat-value">{stats.inProgress}</span>
                        <span className="stat-title">{t("ct.stats.inProgress") || "In Progress"}</span>
                    </div>
                    <div className="ct-stat-card success" onClick={() => handleSearch("completed", "")} style={{cursor: 'pointer'}}>
                        <span className="stat-icon">✅</span>
                        <span className="stat-value">{stats.completed}</span>
                        <span className="stat-title">{t("ct.stats.completed") || "Completed"}</span>
                    </div>
                </div>

                <div className="ct-action-box">
                    <ComplementaryTaskSearch onSearch={handleSearch} />
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="create-ct-button"
                    >
                        {t("ct.createButton") || "New Task"}
                    </button>
                </div>
            </div>

            {isLoading && <p className="loading-overlay">{t("common.loading")}</p>}

            <ComplementaryTaskTable
                tasks={tasks}
                categories={categories}
                vves={vves}
                onEdit={handleEdit}
                onViewCategory={handleViewCategory}
                onViewVve={handleViewVve}
                onFixCategory={(task) => { setTaskToFix(task); setIsFixModalOpen(true); }}
                onStatusChange={handleStatusChange}
            />

            <ComplementaryTaskCreateModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreated={loadData}
                vveList={vves}
            />

            {selectedTask && (
                <ComplementaryTaskEditModal
                    isOpen={isEditModalOpen}
                    onClose={handleCloseEditModal}
                    onUpdated={handleCloseEditModal}
                    resource={selectedTask}
                    vveList={vves}
                />
            )}

            <ComplementaryTaskCategoryDetailsModal
                isOpen={isCategoryDetailsOpen}
                onClose={() => setIsCategoryDetailsOpen(false)}
                category={viewCategory}
            />

            <VesselVisitExecutionDetailsModal
                isOpen={isVveDetailsOpen}
                onClose={() => setIsVveDetailsOpen(false)}
                vve={viewVve}
            />

            <ComplementaryTaskFixCategoryModal
                isOpen={isFixModalOpen}
                task={taskToFix}
                onClose={() => setIsFixModalOpen(false)}
                onFixed={() => { loadData(); setIsFixModalOpen(false); setTaskToFix(null); }}
            />
        </div>
    );
}

export default ComplementaryTaskPage;