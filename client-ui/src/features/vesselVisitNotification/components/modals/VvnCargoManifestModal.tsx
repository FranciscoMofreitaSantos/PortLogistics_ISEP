import { useTranslation } from "react-i18next";
import type { CargoManifestDto } from "../../dto/vvnTypesDtos";
import { fmtDT } from "../../mappers/vvnMappers";
import { EntriesTable } from "../EntriesTable";

type Props = {
    open: boolean;
    onClose: () => void;
    manifest?: CargoManifestDto | null;
    mode: "loading" | "unloading";
};

export function VvnCargoManifestModal({ open, onClose, manifest, mode }: Props) {
    const { t } = useTranslation();
    if (!open) return null;

    const baseKey = mode === "loading" ? "vvn.modals.loading" : "vvn.modals.unloading";

    return (
        <div className="sa-modal-backdrop" onClick={onClose}>
            <div className="vvn-pop-modal" onClick={(e) => e.stopPropagation()}>
                <div className="sa-dock-head">
                    <div className="sa-dock-spacer" />
                    <h3 className="sa-dock-title">{t(`${baseKey}.title`)}</h3>
                    <button className="sa-icon-btn sa-dock-close" onClick={onClose}>
                        ✖
                    </button>
                </div>

                {!manifest ? (
                    <div className="sa-empty">{t(`${baseKey}.empty`)}</div>
                ) : (
                    <>
                        <div className="vvn-def">
                            <div>
                                <span>{t(`${baseKey}.code`)}<br /></span>
                                <strong>{manifest.code}</strong>
                            </div>
                            <div>
                                <span>{t(`${baseKey}.type`)}<br /></span>
                                <strong>{manifest.type}</strong>
                            </div>
                            <div>
                                <span>{t(`${baseKey}.created`)}<br /></span>
                                <strong>{fmtDT(manifest.createdAt)}</strong>
                            </div>
                            <div>
                                <span>{t(`${baseKey}.createdBy`)}<br /></span>
                                <strong>{manifest.createdBy}</strong>
                            </div>
                        </div>

                        <EntriesTable entries={manifest.entries} />
                    </>
                )}
            </div>
        </div>
    );
}
