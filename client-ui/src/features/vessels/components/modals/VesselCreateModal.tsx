
import type { CreateVesselRequest } from "../../domain/vessel";
import type { VesselType } from "../../../vesselsTypes/domain/vesselType";
import { useTranslation } from "react-i18next";

type Props = {
    open: boolean;
    form: CreateVesselRequest;
    setForm: (f: CreateVesselRequest) => void;
    vesselTypes: VesselType[];
    onSave: () => void;
    onClose: () => void;
};

export function VesselCreateModal({open, form, setForm, vesselTypes, onSave, onClose,}: Props) {
    const { t } = useTranslation();
    if (!open) return null;

    return (
        <div className="vt-modal-overlay">
            <div className="vt-modal">
                <h3>{t("Vessel.modal.addTitle")}</h3>

                <label>{t("Vessel.fields.imo")}</label>
                <input
                    className="vt-input"
                    value={form.imoNumber}
                    onChange={e => setForm({ ...form, imoNumber: e.target.value })}
                />

                <label>{t("Vessel.fields.name")}</label>
                <input
                    className="vt-input"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                />

                <label>{t("Vessel.fields.owner")}</label>
                <input
                    className="vt-input"
                    value={form.owner}
                    onChange={e => setForm({ ...form, owner: e.target.value })}
                />

                <label>{t("Vessel.fields.type")}</label>
                <select
                    className="vt-input vt-input--vesseltype"
                    value={form.vesselTypeName}
                    onChange={e => setForm({ ...form, vesselTypeName: e.target.value })}
                >
                    <option value="">Select Vessel Type</option>
                    {vesselTypes.map(t => (
                        <option key={t.id} value={t.name}>
                            {t.name}
                        </option>
                    ))}
                </select>

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
