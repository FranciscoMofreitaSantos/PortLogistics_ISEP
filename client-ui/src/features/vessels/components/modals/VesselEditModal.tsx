import type { UpdateVesselRequest } from "../../domain/vessel";
import { useTranslation } from "react-i18next";

type Props = {
    open: boolean;
    editData: UpdateVesselRequest;
    setEditData: (d: UpdateVesselRequest) => void;
    onSave: () => void;
    onClose: () => void;
};

export function VesselEditModal({ open, editData, setEditData, onSave, onClose }: Props) {
    const { t } = useTranslation();
    if (!open) return null;

    return (
        <div className="vt-modal-overlay">
            <div className="vt-modal">
                <h3>{t("Vessel.modal.editTitle")}</h3>

                <label>{t("Vessel.fields.name")}</label>
                <input
                    className="vt-input"
                    value={editData.name || ""}
                    onChange={e => setEditData({ ...editData, name: e.target.value })}
                />

                <label>{t("Vessel.fields.owner")}</label>
                <input
                    className="vt-input"
                    value={editData.owner || ""}
                    onChange={e => setEditData({ ...editData, owner: e.target.value })}
                />

                <div className="vt-modal-actions">
                    <button className="vt-btn-cancel" onClick={onClose}>
                        {t("Vessel.buttons.cancel", { defaultValue: "Cancel" })}
                    </button>
                    <button className="vt-btn-save" onClick={onSave}>
                        {t("Vessel.buttons.save", { defaultValue: "Save" })}
                    </button>
                </div>
            </div>
        </div>
    );
}
