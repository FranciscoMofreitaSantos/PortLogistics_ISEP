import { useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { apiCreateVesselType } from "../../services/vesselTypeService";
import { toCreateVesselTypeDto } from "../../mappers/vesselTypeMapper";

interface Props {
    open: boolean;
    onClose: () => void;
    onCreated: () => void;
}

export default function VesselTypeCreateModal({ open, onClose, onCreated }: Props) {
    const { t } = useTranslation();

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [maxBays, setMaxBays] = useState("10");
    const [maxRows, setMaxRows] = useState("10");
    const [maxTiers, setMaxTiers] = useState("10");

    if (!open) return null;

    async function handleSave() {
        if (!name.trim()) {
            toast.error(t("vesselTypes.errors.nameRequired"));
            return;
        }

        const baysNum = Number(maxBays);
        const rowsNum = Number(maxRows);
        const tiersNum = Number(maxTiers);

        // valida inteiros > 0
        if (!Number.isFinite(baysNum) || baysNum < 1 ||
            !Number.isFinite(rowsNum) || rowsNum < 1 ||
            !Number.isFinite(tiersNum) || tiersNum < 1) {
            toast.error(t("vesselTypes.errors.invalidDimensions") || "Invalid dimensions");
            return;
        }

        const dto = toCreateVesselTypeDto({
            name,
            description,
            maxBays: baysNum,
            maxRows: rowsNum,
            maxTiers: tiersNum,
        });

        await apiCreateVesselType(dto);
        toast.success(t("vesselTypes.created"));
        onCreated();
        onClose();
    }

    return (
        <div className="vt-modal-overlay">
            <div className="vt-modal">
                <h3>{t("vesselTypes.add")}</h3>

                <label>{t("vesselTypes.details.name")} *</label>
                <input
                    className="vt-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <label>{t("vesselTypes.details.description")}</label>
                <input
                    className="vt-input"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                <label>{t("vesselTypes.details.bays")} *</label>
                <input
                    type="number"
                    min={1}
                    className="vt-input"
                    value={maxBays}
                    onChange={(e) => setMaxBays(e.target.value)}
                />

                <label>{t("vesselTypes.details.rows")} *</label>
                <input
                    type="number"
                    min={1}
                    className="vt-input"
                    value={maxRows}
                    onChange={(e) => setMaxRows(e.target.value)}
                />

                <label>{t("vesselTypes.details.tiers")} *</label>
                <input
                    type="number"
                    min={1}
                    className="vt-input"
                    value={maxTiers}
                    onChange={(e) => setMaxTiers(e.target.value)}
                />

                <div className="vt-modal-actions">
                    <button className="vt-btn-cancel" onClick={onClose}>
                        {t("vesselTypes.cancel")}
                    </button>
                    <button className="vt-btn-save" onClick={handleSave}>
                        {t("vesselTypes.save")}
                    </button>
                </div>
            </div>
        </div>
    );
}
