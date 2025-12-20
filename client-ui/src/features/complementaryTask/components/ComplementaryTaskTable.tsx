import { useTranslation } from "react-i18next";
import type { ComplementaryTask } from "../domain/complementaryTask";
import type { ComplementaryTaskCategory } from "../../complementaryTaskCategory/domain/complementaryTaskCategory";
import type { VesselVisitExecutionDTO } from "../../vesselVisitExecution/dto/vesselVisitExecutionDTO";
import { FaExclamationTriangle, FaClock, FaCheckCircle } from "react-icons/fa";
import "../style/complementaryTask.css";

interface Props {
    tasks: ComplementaryTask[];
    categories: ComplementaryTaskCategory[];
    vves: VesselVisitExecutionDTO[];
    onEdit: (task: ComplementaryTask) => void;
    onViewCategory: (categoryId: string) => void;
    onViewVve: (vveId: string) => void;
    onFixCategory: (task: ComplementaryTask) => void;
    onStatusChange: (code: string, newStatus: string) => void;
}

function ComplementaryTaskTable({ tasks, categories, onEdit, onViewCategory, onViewVve, onFixCategory, onStatusChange }: Props) {
    const { t } = useTranslation();

    if (tasks.length === 0) {
        return <p>{t("ct.noData") || "No tasks found."}</p>;
    }

    const formatDate = (date: Date | string | undefined) => {
        if (!date) return "-";
        return new Date(date).toLocaleString([], { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case "Completed": return "status-active";
            case "InProgress": return "status-warning";
            default: return "status-inactive";
        }
    };

    return (
        <table className="ct-table">
            <thead>
            <tr>
                <th>{t("ct.table.code")}</th>
                <th>{t("ct.table.category")}</th>
                <th>{t("ct.table.staff")}</th>
                <th>{t("ct.table.vve")}</th>
                <th>{t("ct.table.start")}</th>
                <th>{t("ct.table.endEstimatedActual") || "End (Exp/Act)"}</th>
                <th>{t("ct.table.status")}</th>
                <th>{t("ct.table.actions")}</th>
            </tr>
            </thead>
            <tbody>
            {tasks.map((task) => {
                const matchedCategory = categories.find(c => c.code === task.category || c.id === task.category);
                const isCategoryActive = matchedCategory ? matchedCategory.isActive : false;
                const isCompleted = task.status === "Completed";
                const isInProgress = task.status === "InProgress";
                const canShowCategoryDetails = isCategoryActive || isCompleted;


                let expectedEndDate: Date | null = null;
                if (matchedCategory?.defaultDuration && task.timeStart) {
                    expectedEndDate = new Date(new Date(task.timeStart).getTime() + matchedCategory.defaultDuration * 60000);
                }

                return (
                    <tr key={task.id} className={!canShowCategoryDetails ? "row-warning" : ""}>
                        <td>{task.code}</td>

                        {/* CATEGORIA */}
                        <td>
                            {canShowCategoryDetails ? (
                                <button onClick={() => matchedCategory && onViewCategory(matchedCategory.id)} className="ct-details-button">
                                    {t("ct.details") || "Details"}
                                </button>
                            ) : (
                                <button onClick={() => onFixCategory(task)} className="ct-danger-button">
                                    <FaExclamationTriangle /> {t("ct.fix")}
                                </button>
                            )}
                        </td>

                        <td>{task.staff}</td>

                        {/* VVE */}
                        <td>
                            <button onClick={() => onViewVve(task.vve)} className="ct-details-button">
                                {t("ct.details") || "Details"}
                            </button>
                        </td>

                        <td>{formatDate(task.timeStart)}</td>

                        {/* FIM ESTIMADO / REAL */}
                        <td>
                            {isCompleted ? (
                                <div className="time-actual" style={{ color: '#2e7d32', fontWeight: 'bold' }}>
                                    <FaCheckCircle size={12} /> {formatDate(task.timeEnd)}
                                </div>
                            ) : (
                                <div className="time-expected" style={{ color: '#666', fontStyle: 'italic' }}>
                                    <FaClock size={12} /> {expectedEndDate ? formatDate(expectedEndDate) : "--:--"}
                                </div>
                            )}
                        </td>

                        <td>
                            <span className={`status-pill ${getStatusClass(task.status)}`}>
                                {t(`ct.status.${task.status}`) || task.status}
                            </span>
                        </td>

                        {/* AÇÕES */}
                        <td>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    onClick={() => onEdit(task)}
                                    className="pr-edit-button"
                                    disabled={isCompleted}
                                >
                                    {t("ct.actions.edit")}
                                </button>

                                {isInProgress && (
                                    <button
                                        onClick={() => onStatusChange(task.code, "Completed")}
                                        className="ct-status-btn-complete"
                                    >
                                        {t("ct.actions.complete")}
                                    </button>
                                )}
                            </div>
                        </td>
                    </tr>
                );
            })}
            </tbody>
        </table>
    );
}

export default ComplementaryTaskTable;