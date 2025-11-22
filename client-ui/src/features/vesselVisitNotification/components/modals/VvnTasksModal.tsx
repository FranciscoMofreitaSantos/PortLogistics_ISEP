import { useTranslation } from "react-i18next";
import type { TaskDto } from "../../dto/vvnTypesDtos";

type Props = {
    open: boolean;
    onClose: () => void;
    tasks?: TaskDto[] | null;
};

export function VvnTasksModal({ open, onClose, tasks }: Props) {
    const { t } = useTranslation();
    if (!open) return null;

    const empty = !tasks || tasks.length === 0;

    return (
        <div className="sa-modal-backdrop" onClick={onClose}>
            <div className="vvn-pop-modal" onClick={(e) => e.stopPropagation()}>
                <div className="sa-dock-head">
                    <div className="sa-dock-spacer" />
                    <h3 className="sa-dock-title">{t("vvn.modals.tasks.title")}</h3>
                    <button className="sa-icon-btn sa-dock-close" onClick={onClose}>
                        ✖
                    </button>
                </div>

                {empty ? (
                    <div className="sa-empty">{t("vvn.modals.tasks.empty")}<br /></div>
                ) : (
                    <ul className="vvn-task-list">
                        {tasks!.map((tk) => (
                            <li key={tk.id}>
                                <b>{tk.title}</b>
                                {tk.status && (
                                    <span className="vvn-task-status"> · {tk.status}</span>
                                )}
                                {tk.description && (
                                    <div className="vvn-task-desc">{tk.description}</div>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
