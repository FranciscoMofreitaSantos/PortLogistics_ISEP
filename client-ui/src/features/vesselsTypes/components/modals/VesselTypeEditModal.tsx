import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { apiUpdateVesselType } from "../../services/vesselTypeService";
import { toUpdateVesselTypeDto } from "../../mappers/vesselTypeMapper";
import type { VesselType } from "../../domain/vesselType";

interface Props {
    open: boolean;
    vesselType: VesselType | null;
    onClose: () => void;
    onUpdated: () => void;
}

export default function VesselTypeEditModal({open, vesselType, onClose, onUpdated,}: Props) {
    const { t } = useTranslation();
    const [model, setModel] = useState<VesselType | null>(vesselType);

    useEffect(() => {
        setModel(vesselType);
    }, [vesselType]);

    // Se não estiver aberto ou não houver modelo, não renderiza nada
    if (!open || !model) return null;

    // A partir daqui o TS sabe que isto é sempre VesselType, nunca null
    const vt: VesselType = model;

    async function handleSave() {
        const dto = toUpdateVesselTypeDto(vt);
        await apiUpdateVesselType(vt.id, dto);
        toast.success(t("vesselTypes.updated"));
        onUpdated();
        onClose();
    }

    return (
        <div className="vt-modal-overlay">
            <div className="vt-modal">
                <h3>{t("vesselTypes.edit")}</h3>

                <label>{t("vesselTypes.details.name")}</label>
                <input
                    className="vt-input"
                    value={vt.name}
                    onChange={(e) =>
                        setModel(prev =>
                            prev ? { ...prev, name: e.target.value } : prev
                        )
                    }
                />

                <label>{t("vesselTypes.details.description")}</label>
                <input
                    className="vt-input"
                    value={vt.description ?? ""}
                    onChange={(e) =>
                        setModel(prev =>
                            prev ? { ...prev, description: e.target.value } : prev
                        )
                    }
                />

                <label>{t("vesselTypes.details.bays")}</label>
                <input
                    type="number"
                    min={1}
                    className="vt-input"
                    value={vt.maxBays}
                    onChange={(e) =>
                        setModel(prev =>
                            prev
                                ? {
                                    ...prev,
                                    maxBays: Math.max(1, Number(e.target.value)),
                                }
                                : prev
                        )
                    }
                />

                <label>{t("vesselTypes.details.rows")}</label>
                <input
                    type="number"
                    min={1}
                    className="vt-input"
                    value={vt.maxRows}
                    onChange={(e) =>
                        setModel(prev =>
                            prev
                                ? {
                                    ...prev,
                                    maxRows: Math.max(1, Number(e.target.value)),
                                }
                                : prev
                        )
                    }
                />

                <label>{t("vesselTypes.details.tiers")}</label>
                <input
                    type="number"
                    min={1}
                    className="vt-input"
                    value={vt.maxTiers}
                    onChange={(e) =>
                        setModel(prev =>
                            prev
                                ? {
                                    ...prev,
                                    maxTiers: Math.max(1, Number(e.target.value)),
                                }
                                : prev
                        )
                    }
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
