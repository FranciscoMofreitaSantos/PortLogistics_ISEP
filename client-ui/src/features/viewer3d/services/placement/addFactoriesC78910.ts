// src/features/viewer3d/services/placement/addFactoriesC78910.ts
import * as THREE from "three";
import type { GridsResult, Rect } from "../../scene/objects/portGrids";
import { ASSETS_MODELS } from "../../scene/utils/assets";
import { loadGLBNormalized } from "../../scene/utils/loadGLBNormalized";

export type FactoriesOpts = {
    zones?: Array<"C.7" | "C.8" | "C.9" | "C.10">;
    roadY?: number;
    marginX?: number;          // margem lateral dentro da zona
    marginZ?: number;          // margem frente/fundo dentro da zona
    bandDepthRatio?: number;   // espessura da faixa em Z → “linha” em X
    fitScaleFactor?: number;   // encosta sem tocar (0.97..0.995)
    /** rotação extra depois de auto-alinhar o modelo ao eixo X */
    yawExtra?: number;
    /** override opcional do footprint alvo */
    targetFootprint?: { x?: number; z?: number };
    /** espaço ENTRE as fábricas ao longo de X */
    cellGapX?: number;
    /** número de fábricas por zona */
    countPerZone?: number;
};

const DEF: Required<Omit<FactoriesOpts, "targetFootprint">> = {
    zones: ["C.7", "C.8", "C.9", "C.10"],
    roadY: 0.03,
    marginX: 5.0,
    marginZ: 4.0,
    bandDepthRatio: 0.26,
    fitScaleFactor: 0.992,
    yawExtra: 0,
    cellGapX: 1.8,
    countPerZone: 3,
};

function thinBandCenteredZ(r: Rect, bandDepthRatio: number, marginZ: number): Rect {
    const inner: Rect = {
        minX: r.minX,
        maxX: r.maxX,
        minZ: r.minZ + marginZ,
        maxZ: r.maxZ - marginZ,
    };
    const d = (inner.maxZ - inner.minZ) * THREE.MathUtils.clamp(bandDepthRatio, 0.05, 1);
    const cz = (inner.minZ + inner.maxZ) / 2;
    return { minX: inner.minX, maxX: inner.maxX, minZ: cz - d / 2, maxZ: cz + d / 2 };
}

/**
 * Carrega, centra, assenta e **força o eixo mais comprido do modelo a ficar // +X**.
 */
async function loadFactoryAlignedToX() {
    const root = await loadGLBNormalized(ASSETS_MODELS.buildings.factoryBuilding, {
        centerXZ: true,
        baseY0: true,
    });

    // medir caixa
    root.updateWorldMatrix(true, true);
    let box = new THREE.Box3().setFromObject(root);
    let size = box.getSize(new THREE.Vector3());

    // Se veio “comprido” em Z, roda -90º para alinhar o comprimento em X
    if (size.z > size.x) {
        root.rotation.y -= Math.PI / 2;
        root.updateWorldMatrix(true, true);
        box = new THREE.Box3().setFromObject(root);
        size = box.getSize(new THREE.Vector3());
    }

    // recentrar XZ e assentar em Y=0 (defensivo)
    const center = box.getCenter(new THREE.Vector3());
    root.position.x -= center.x;
    root.position.z -= center.z;
    const minY = box.min.y;
    root.position.y -= minY;

    root.traverse((o: any) => {
        if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; }
    });

    // devolver tamanho final pós-rotação/recálculo
    root.updateWorldMatrix(true, true);
    const finalSize = new THREE.Box3().setFromObject(root).getSize(new THREE.Vector3());
    return { root, size: finalSize };
}

async function spawnFactory(
    parent: THREE.Group,
    cell: Rect,
    roadY: number,
    fitScale: number,
    yawExtra: number,
    target?: { x?: number; z?: number },
) {
    const { root, size } = await loadFactoryAlignedToX();

    // espaço disponível na célula (quase cheio)
    const availW = (cell.maxX - cell.minX) * fitScale;
    const availD = (cell.maxZ - cell.minZ) * fitScale;

    // usar footprint alvo (ou dimensões do modelo já alinhado)
    const tgtW = target?.x ?? size.x;
    const tgtD = target?.z ?? size.z;

    const s = Math.min(
        availW / Math.max(tgtW, 0.001),
        availD / Math.max(tgtD, 0.001),
    );
    root.scale.setScalar(s);

    // pivot para posicionar/rodar na célula
    const pivot = new THREE.Group();
    pivot.position.set(
        (cell.minX + cell.maxX) / 2,
        roadY,
        (cell.minZ + cell.maxZ) / 2,
    );
    // a fábrica já vem “comprida” // X; yawExtra é só ajuste fino
    pivot.rotation.y = yawExtra;

    pivot.add(root);
    parent.add(pivot);
}

/** N fábricas por zona, **em fila ao longo do eixo X** e **compridas // X**. */
export function addFactoriesInC78910(
    parent: THREE.Group,
    grids: GridsResult | null | undefined,
    userOpts: FactoriesOpts = {},
) {
    if (!grids?.C) {
        console.warn("[factories] grids não prontas.");
        return new THREE.Group();
    }

    const O = { ...DEF, ...userOpts };
    const G = new THREE.Group();
    G.name = "factories-C78910";
    parent.add(G);

    for (const key of O.zones!) {
        const grid = grids.C[key as keyof typeof grids.C];
        if (!grid) continue;

        // 1) Faixa fina em Z (miolo) → “linha” horizontal (along X)
        const band = thinBandCenteredZ(grid.rect, O.bandDepthRatio, O.marginZ);

        // 2) Margens laterais em X
        const rect: Rect = {
            minX: band.minX + O.marginX,
            maxX: band.maxX - O.marginX,
            minZ: band.minZ,
            maxZ: band.maxZ,
        };

        // 3) Partir em N células AO LONGO DO X (lado-a-lado)
        const N = Math.max(1, O.countPerZone);
        const W = rect.maxX - rect.minX;
        const totalGap = O.cellGapX * (N - 1);
        const cellW = (W - totalGap) / N;

        for (let i = 0; i < N; i++) {
            const xL = rect.minX + i * (cellW + O.cellGapX);
            const xR = xL + cellW;
            const cell: Rect = { minX: xL, maxX: xR, minZ: rect.minZ, maxZ: rect.maxZ };

            void spawnFactory(
                G,
                cell,
                O.roadY,
                O.fitScaleFactor,
                O.yawExtra,
                O.targetFootprint ?? { x: 26, z: 18 },
            );
        }
    }

    return G;
}
