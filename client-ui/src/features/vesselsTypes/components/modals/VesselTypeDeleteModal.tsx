import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { apiDeleteVesselType } from "../../services/vesselTypeService";
import type { VesselType } from "../../domain/vesselType";

interface Props {
    open: boolean;
    vesselType: VesselType | null;
    onClose: () => void;
    onDeleted: () => void;
}

export default function VesselTypeDeleteModal({open, vesselType, onClose, onDeleted,}: Props) {
    const { t } = useTranslation();

    // Se não estiver aberto ou não houver vesselType, não renderiza nada
    if (!open || !vesselType) return null;

    // A partir daqui, vt é SEMPRE VesselType (não pode ser null)
    const vt: VesselType = vesselType;

    async function handleDelete() {
        await apiDeleteVesselType(vt.id);
        toast.success(t("vesselTypes.deleted"));
        onDeleted();
        onClose();
    }

    return (
        <div className="vt-modal-overlay">
            <div className="vt-modal vt-modal-delete">
                <h3>{t("vesselTypes.delete")}</h3>
                <p>
                    {t("vesselTypes.details.name")}: <strong>{vt.name}</strong>
                    <br />
                    {t("vesselTypes.details.capacity")}:{" "}
                    <strong>{vt.capacityTeu} TEU</strong>
                </p>

                <div className="vt-modal-actions">
                    <button className="vt-btn-cancel" onClick={onClose}>
                        {t("vesselTypes.cancel")}
                    </button>
                    <button className="vt-btn-delete" onClick={handleDelete}>
                        {t("vesselTypes.delete")}
                    </button>
                </div>
            </div>
        </div>
    );
}
