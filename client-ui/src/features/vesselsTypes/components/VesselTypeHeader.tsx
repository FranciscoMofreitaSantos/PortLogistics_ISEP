import { FaShip } from "react-icons/fa";
import { useTranslation } from "react-i18next";

interface Props {
    total: number;
    onCreateClick: () => void;
}

export default function VesselTypeHeader({ total, onCreateClick }: Props) {
    const { t } = useTranslation();

    return (
        <div className="vt-title-area">
            <div className="vt-title-box">
                <h2 className="vt-title">
                    <FaShip className="vt-icon" /> {t("vesselTypes.title")}
                </h2>
                <p className="vt-sub">
                    {t("vesselTypes.count", { count: total })}
                </p>
            </div>

            <button
                className="vt-create-btn-top"
                onClick={onCreateClick}
            >
                + {t("vesselTypes.add")}
            </button>
        </div>
    );
}
