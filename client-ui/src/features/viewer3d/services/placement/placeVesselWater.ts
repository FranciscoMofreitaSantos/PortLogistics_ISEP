// services/placement/placeVesselWater.ts
import type { VesselDto, DockDto } from "../../types";

/** Opções globais de placement (podem ser sobrepostas por-vessel em v.placement) */
export type VesselPlacementOpts = {
    /** afastamento lateral face à dock (água) */
    clearanceM?: number;        // default 4
    /** deslocação ao longo da dock (positivo → “para a direita” da dock) */
    alongOffsetM?: number;      // default 0
    /** ruído opcional para quebrar a rigidez */
    jitterAlongM?: number;      // default 0
    jitterLateralM?: number;    // default 0

    /** controlo do comprimento usado (não mexe no width) */
    lengthScale?: number;       // default 1
    addLengthM?: number;        // default 0

    /** deslocação vertical do centro (subir/descer) */
    yOffsetM?: number;          // default 0
};

/** Overrides por-vessel: v.placement = { ... } */
export type VesselPlacementOverride = Partial<VesselPlacementOpts>;

/** Máx. 8 vessels, 1 por dock (na mesma ordem de docks). */
export function placeVesselsOnWater(
    vessels: (VesselDto & { placement?: VesselPlacementOverride })[],
    docks: Array<DockDto & { rotationY?: number }>,
    opts: VesselPlacementOpts = {}
): Array<VesselDto & { rotationY?: number; positionY?: number; placement?: VesselPlacementOverride }> {
    if (!Array.isArray(vessels) || !Array.isArray(docks) || docks.length === 0) return [];

    const O: Required<VesselPlacementOpts> = {
        clearanceM: 14,
        alongOffsetM: 0,
        jitterAlongM: 0,
        jitterLateralM: 0,
        lengthScale: 1.6,
        addLengthM: 0,
        yOffsetM: -12,
        ...opts,
    };

    const count = Math.min(8, Math.min(vessels.length, docks.length));
    const out: Array<VesselDto & { rotationY?: number; positionY?: number; placement?: VesselPlacementOverride }> = [];

    for (let i = 0; i < count; i++) {
        const v0 = vessels[i];
        const d  = docks[i];

        const ov = { ...(v0.placement ?? {}) };
        const C  = { ...O, ...ov };

        const rot = Number(d.rotationY ?? 0);

        // normal (para a água) e tangente (ao longo da dock)
        // rot=0 → dock horizontal (tangente +X), água +Z
        const nX = Math.sin(rot), nZ = Math.cos(rot);      // lateral
        const tX = Math.cos(rot), tZ = -Math.sin(rot);     // along

        // tamanhos “seguros”
        const length0 = Math.max(20, Number(v0.lengthMeters) || 70);
        const width0  = Math.max( 6, Number(v0.widthMeters)  || 18);
        const dockLen = Math.max(10, Number(d.lengthM) || 80);

        const lengthUsed = Math.min(length0 * C.lengthScale + C.addLengthM, dockLen * 0.98);

        const dockDepth = Math.max(4, Number(d.depthM) || 20);
        const lateralOffset = dockDepth / 2 + width0 / 2 + C.clearanceM;

        // jitter
        const jAlong    = C.jitterAlongM   ? (Math.random() * 2 - 1) * C.jitterAlongM   : 0;
        const jLateral  = C.jitterLateralM ? (Math.random() * 2 - 1) * C.jitterLateralM : 0;

        // posição
        const px = Number(d.positionX) + (nX * (lateralOffset + jLateral)) + (tX * (C.alongOffsetM + jAlong));
        const pz = Number(d.positionZ) + (nZ * (lateralOffset + jLateral)) + (tZ * (C.alongOffsetM + jAlong));

        out.push({
            ...v0,
            lengthMeters: lengthUsed,          // ← comprimento “efetivo” para o placeholder/GLB
            // widthMeters mantém-se
            positionX: px,
            positionZ: pz,
            positionY: C.yOffsetM,            // ← offset vertical (o placeholder somará H/2)
            rotationY: rot,
            placement: ov,                    // mantém overrides por-vessel
        });
    }

    return out;
}
