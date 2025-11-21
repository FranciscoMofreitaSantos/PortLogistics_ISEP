import type { Vessel } from "../domain/vessel";

type Props = {
    vessels: Vessel[];
    onSelect: (v: Vessel) => void;
    val: (x: any) => string;
    getVesselTypeNameById: (id: any) => string;
};

export function VesselCardGrid({ vessels, onSelect, val, getVesselTypeNameById }: Props) {
    return (
        <div className="vt-card-grid">
            {vessels.map(v => (
                <div key={v.id} className="vt-card" onClick={() => onSelect(v)}>
                    <div className="vt-card-header">
                        <span className="vt-card-title">{v.name}</span>
                        <span className="vt-badge">{val(v.imoNumber)}</span>
                    </div>
                    <div className="vt-card-body">
                        <div className="vt-row-item">
                            <span className="vt-label">Owner</span>
                            <span className="vt-chip">{v.owner}</span>
                        </div>
                        <div className="vt-row-item">
                            <span className="vt-label">Type</span>
                            <span className="vt-chip vt-chip-type">
                                {getVesselTypeNameById(v.vesselTypeId)}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
