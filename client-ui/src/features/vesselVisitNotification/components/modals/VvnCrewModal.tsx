import { useTranslation } from "react-i18next";
import type { CrewManifestDto, CrewMemberDto } from "../../dto/vvnTypesDtos";

type Props = {
    open: boolean;
    onClose: () => void;
    crewManifest?: CrewManifestDto | null;
};

export function VvnCrewModal({ open, onClose, crewManifest }: Props) {
    const { t } = useTranslation();
    if (!open) return null;

    return (
        <div className="sa-modal-backdrop" onClick={onClose}>
            <div className="vvn-pop-modal" onClick={(e) => e.stopPropagation()}>
                <div className="sa-dock-head">
                    <div className="sa-dock-spacer" />
                    <h3 className="sa-dock-title">{t("vvn.modals.crew.title")}</h3>
                    <button className="sa-icon-btn sa-dock-close" onClick={onClose}>
                        ✖
                    </button>
                </div>

                {!crewManifest ? (
                    <div className="sa-empty">{t("vvn.modals.crew.empty")}</div>
                ) : (
                    <>
                        <div className="vvn-def">
                            <div>
                                <span>{t("vvn.modals.crew.captain")}<br /></span>
                                <strong>{crewManifest.captainName}</strong>
                            </div>
                            <div>
                                <span>{t("vvn.modals.crew.total")}<br /></span>
                                <strong>{crewManifest.totalCrew}</strong>
                            </div>
                        </div>
                        <div className="vvn-table-wrap">
                            <table className="vvn-table">
                                <thead>
                                <tr>
                                    <th>{t("vvn.modals.crew.table.name")}</th>
                                    <th>{t("vvn.modals.crew.table.role")}</th>
                                    <th>{t("vvn.modals.crew.table.nationality")}</th>
                                    <th>{t("vvn.modals.crew.table.citizenId")}</th>
                                </tr>
                                </thead>
                                <tbody>
                                {(crewManifest.crewMembers || []).map((m: CrewMemberDto) => (
                                    <tr key={m.id}>
                                        <td>{m.name}</td>
                                        <td>{m.role}</td>
                                        <td>{m.nationality}</td>
                                        <td>{m.citizenId}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
