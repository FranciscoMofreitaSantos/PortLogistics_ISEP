import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { apiDeleteVessel } from "../../services/vesselService";
import type { Vessel } from "../../domain/vessel";

interface Props {
    open: boolean;
    vessel: Vessel | null;
    onClose: () => void;
    onDeleted: () => void | Promise<void>;
}

export default function VesselDeleteModal({ open, vessel, onClose, onDeleted }: Props) {
    const { t } = useTranslation();

    if (!open || !vessel) return null;

    // A partir daqui garantimos que NÃO é null
    const v: Vessel = vessel;

    async function handleDelete() {
        await apiDeleteVessel(v.id);
        toast.success(t("Vessel.messages.deleted", { defaultValue: "Vessel deleted" }));
        await onDeleted();
        onClose();
    }

    const imo =
        typeof v.imoNumber === "string"
            ? v.imoNumber
            : v.imoNumber.value;

    return (
        <div className="vt-modal-overlay">
            <div className="vt-modal vt-modal-delete">
                <h3>{t("Vessel.modal.deleteTitle", { defaultValue: "Delete vessel" })}</h3>
                <p>
                    {t("Vessel.fields.name")}: <strong>{v.name}</strong>
                    <br />
                    IMO: <strong>{imo}</strong>
                    <br />
                    {t("Vessel.fields.owner")}: <strong>{v.owner}</strong>
                </p>

                <div className="vt-modal-actions">
                    <button className="vt-btn-cancel" onClick={onClose}>
                        {t("Vessel.buttons.cancel", { defaultValue: "Cancel" })}
                    </button>
                    <button className="vt-btn-delete" onClick={handleDelete}>
                        {t("Vessel.buttons.delete", { defaultValue: "Delete" })}
                    </button>
                </div>
            </div>
        </div>
    );
}
