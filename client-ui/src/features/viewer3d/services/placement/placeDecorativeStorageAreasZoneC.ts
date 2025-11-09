// services/placement/placeDecorativeStorageAreasZoneC.ts
import type { GridsResult } from "../../scene/objects/portGrids";

export type Rect = { minX: number; maxX: number; minZ: number; maxZ: number };
export type DecorativeSA = {
    zone: string;
    widthM: number; depthM: number; heightM: number;
    positionX: number; positionZ: number; rotationY: number;
};

/** Opções de afinação de dimensões/folgas. */
export type DecoRectOpts = {
    /** Recuo geral às bordas da zona (X e Z). */
    edgeInsetM?: number;          // default 8
    /** Folga extra às ruas nas extremidades (aplicada no eixo Z). */
    roadClearM?: number;          // default 8

    /** Fração da largura útil da zona usada como ESPESSURA (X). */
    thicknessRatio?: number;      // default 0.18
    /** Multiplicador rápido da espessura. */
    thicknessScale?: number;      // default 1

    /** Fração do comprimento útil da zona usada como COMPRIMENTO (Z). */
    lengthRatio?: number;         // default 0.88
    /** Multiplicador rápido do comprimento. */
    lengthScale?: number;         // default 1

    /** Altura base (Y) e multiplicador. */
    heightM?: number;             // default 2
    heightScale?: number;         // default 1

    /** Ativar as bandas de topo (C.5 e C.6). */
    includeTopBands?: boolean;    // default true
};

/* utils */
const sizeX = (r: Rect) => r.maxX - r.minX;
const sizeZ = (r: Rect) => r.maxZ - r.minZ;
const midX  = (r: Rect) => (r.minX + r.maxX) / 2;
// @ts-ignore
const midZ  = (r: Rect) => (r.minZ + r.maxZ) / 2;

/**
 * Retângulos decorativos na Zona C:
 *  - C.8/C.10 → encostados ao LADO ESQUERDO (X), centrados em Z.
 *  - C.7/C.9  → encostados ao LADO DIREITO (X), centrados em Z.
 *  - C.5/C.6  → banda encostada EM BAIXO (Z), centrada em X (opcional).
 */
export function placeDecorativeStorageAreasZoneC(
    grids: GridsResult,
    opts: DecoRectOpts = {}
): DecorativeSA[] {
    const O: Required<DecoRectOpts> = {
        edgeInsetM: 8,
        roadClearM: 8,
        thicknessRatio: 0.18,
        thicknessScale: 1,
        lengthRatio: 0.88,
        lengthScale: 1,
        heightM: 2,
        heightScale: 1,
        includeTopBands: true,
        ...opts,
    };

    const out: DecorativeSA[] = [];

    const addVerticalStrip = (zoneKey: keyof GridsResult["C"], side: "left" | "right") => {
        const g = grids.C[zoneKey]; if (!g) return;
        const r = g.rect;

        // área útil com recuos
        const usableX = Math.max(1, sizeX(r) - 2 * O.edgeInsetM);
        const usableZ = Math.max(1, sizeZ(r) - 2 * O.edgeInsetM);

        // dimensões desejadas
        const width  = Math.max(1, usableX * O.thicknessRatio * O.thicknessScale); // espessura (X)
        const maxDepth = Math.max(0, usableZ - 2 * O.roadClearM);
        const depth  = Math.max(1, Math.min(maxDepth, usableZ * O.lengthRatio * O.lengthScale)); // comprimento (Z)

        // posicionamento
        const xLeft  = (r.minX + O.edgeInsetM) + width / 2;
        const xRight = (r.maxX - O.edgeInsetM) - width / 2;
        const posX   = side === "left" ? xLeft : xRight;

        // centrado no espaço com folga às ruas
        const zMin = r.minZ + O.edgeInsetM + O.roadClearM;
        const zMax = r.maxZ - O.edgeInsetM - O.roadClearM;
        const posZ = (zMin + zMax) / 2;

        out.push({
            zone: zoneKey,
            widthM: width,
            depthM: depth,
            heightM: Math.max(0.1, O.heightM * O.heightScale),
            positionX: posX,
            positionZ: posZ,
            rotationY: 0,
        });
    };

    const addBottomBand = (zoneKey: keyof GridsResult["C"]) => {
        const g = grids.C[zoneKey]; if (!g) return;
        const r = g.rect;

        const usableX = Math.max(1, sizeX(r) - 2 * O.edgeInsetM);
        const usableZ = Math.max(1, sizeZ(r) - 2 * O.edgeInsetM);

        const width = Math.max(1, usableX * O.lengthRatio * O.lengthScale);         // ao longo de X
        const depth = Math.max(1, usableZ * O.thicknessRatio * O.thicknessScale);    // espessura em Z

        // encostado em baixo com folga à rua
        const bottomInset = O.edgeInsetM + O.roadClearM;
        const posZ = (r.minZ + bottomInset) + depth / 2;
        const posX = midX(r);

        out.push({
            zone: zoneKey,
            widthM: width,
            depthM: depth,
            heightM: Math.max(0.1, O.heightM * O.heightScale),
            positionX: posX,
            positionZ: posZ,
            rotationY: 0,
        });
    };

    // Esquerda (no render): encostar à DIREITA
    addVerticalStrip("C.7", "right");
    addVerticalStrip("C.9", "right");

    // Direita: encostar à ESQUERDA
    addVerticalStrip("C.8", "left");
    addVerticalStrip("C.10", "left");

    if (O.includeTopBands) {
        addBottomBand("C.5");
        addBottomBand("C.6");
    }

    return out;
}
