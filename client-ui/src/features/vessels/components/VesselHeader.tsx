import { FaShip, FaPlus } from "react-icons/fa";
import { useTranslation } from "react-i18next";

type Props = {
    count: number;
    onCreate: () => void;
    onOpenStats: () => void;
};

export function VesselHeader({ count, onCreate, onOpenStats }: Props) {
    const { t } = useTranslation();

    return (
        <div className="vt-title-area">
            <div>
                <h2 className="vt-title">
                    <FaShip /> {t("Vessel.title")}
                </h2>
                <p className="vt-sub">{t("Vessel.count", { count })}</p>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
                <button className="vt-create-btn-top" onClick={onCreate}>
                    <FaPlus /> {t("Vessel.buttons.add")}
                </button>
                <button
                    className="vt-create-btn-top"
                    style={{ background: "#444" }}
                    onClick={onOpenStats}
                >
                    📊 {t("Vessel.buttons.stats", { defaultValue: "Statistics" })}
                </button>
            </div>
        </div>
    );
}
