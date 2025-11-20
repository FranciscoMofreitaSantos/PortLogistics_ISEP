import { FaTimes } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import type { VesselType } from "../domain/vesselType";

interface Props {
    selected: VesselType | null;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

export default function VesselTypeSlideDetails({ selected, onClose, onEdit, onDelete }: Props) {
    const { t } = useTranslation();

    if (!selected) return null;

    return (
        <div className="vt-slide">
            <button className="vt-slide-close" onClick={onClose}>
                <FaTimes />
            </button>

            <h3>{selected.name}</h3>

            <p><strong>{t("vesselTypes.details.description")}:</strong> {selected.description}</p>
            <p><strong>{t("vesselTypes.details.bays")}:</strong> {selected.maxBays}</p>
            <p><strong>{t("vesselTypes.details.rows")}:</strong> {selected.maxRows}</p>
            <p><strong>{t("vesselTypes.details.tiers")}:</strong> {selected.maxTiers}</p>
            <p><strong>{t("vesselTypes.details.capacity")}:</strong> {selected.capacityTeu}</p>

            <div className="vt-slide-actions">
                <button className="vt-btn-edit" onClick={onEdit}>{t("vesselTypes.edit")}</button>
                <button className="vt-btn-delete" onClick={onDelete}>{t("vesselTypes.delete")}</button>
            </div>
        </div>
    );
}
