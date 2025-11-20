// src/features/vesselsTypes/components/VesselTypeTable.tsx
import type { VesselType } from "../domain/vesselType";
import { useTranslation } from "react-i18next";

interface Props {
    items: VesselType[];
    loading: boolean;
    onSelect: (v: VesselType) => void;
}

export default function VesselTypeTable({ items, loading, onSelect }: Props) {
    const { t } = useTranslation();

    if (loading) return <p>{t("loading")}</p>;
    if (!items.length) return <p>{t("vesselTypes.empty")}</p>;

    return (
        <div className="vt-table-wrapper">
            <table className="vt-table">
                <thead>
                <tr>
                    <th>{t("vesselTypes.details.name")}</th>
                    <th>{t("vesselTypes.details.description")}</th>
                    <th>{t("vesselTypes.details.bays")}</th>
                    <th>{t("vesselTypes.details.rows")}</th>
                    <th>{t("vesselTypes.details.tiers")}</th>
                    <th>{t("vesselTypes.details.capacity")}</th>
                </tr>
                </thead>
                <tbody>
                {items.map(v => (
                    <tr key={v.id} className="vt-row" onClick={() => onSelect(v)}>
                        <td><span className="vt-badge">{v.name}</span></td>
                        <td>{v.description}</td>
                        <td>{v.maxBays}</td>
                        <td>{v.maxRows}</td>
                        <td>{v.maxTiers}</td>
                        <td>{v.capacityTeu}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
