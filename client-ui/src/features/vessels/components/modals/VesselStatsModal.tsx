import { Bar } from "react-chartjs-2";
import { useTranslation } from "react-i18next";

type Props = {
    open: boolean;
    vesselTypeCounts: { name: string; count: number }[];
    onClose: () => void;
};

export function VesselStatsModal({ open, vesselTypeCounts, onClose }: Props) {
    const { t } = useTranslation();
    if (!open) return null;

    return (
        <div className="vt-modal-overlay">
            <div className="vt-modal-stats">
                <h3 className="vt-modal-title">
                    {t("Vessel.analytics.title", { defaultValue: "Vessel Statistics" })}
                </h3>

                <div className="vt-stats-chart">
                    <Bar
                        data={{
                            labels: vesselTypeCounts.map(v => v.name),
                            datasets: [
                                {
                                    label: t("Vessel.analytics.types", { defaultValue: "Count" }),
                                    data: vesselTypeCounts.map(v => v.count),
                                    backgroundColor: "#4e79a7",
                                },
                            ],
                        }}
                        options={{
                            responsive: true,
                            plugins: { legend: { display: false } },
                            scales: { y: { ticks: { precision: 0 } } },
                        }}
                    />
                </div>

                <div className="vt-modal-actions">
                    <button className="vt-btn-cancel" onClick={onClose}>
                        {t("Vessel.buttons.close", { defaultValue: "Close" })}
                    </button>
                </div>
            </div>
        </div>
    );
}
