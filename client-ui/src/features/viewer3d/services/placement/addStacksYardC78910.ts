import * as THREE from "three";
import type { GridsResult, Rect } from "../../scene/objects/portGrids";
import { ASSETS_MODELS } from "../../scene/utils/assets";
import { loadGLBNormalized } from "../../scene/utils/loadGLBNormalized";


/* =================== Parâmetros base 40ft =================== */
const SCALE = 3;
const BASE = { L: 12.19 * SCALE, W: 2.44 * SCALE, H: 2.59 * SCALE };

export type StacksYardOpts = {
    zones?: Array<"C.7" | "C.8" | "C.9" | "C.10">;
    roadY?: number;

    // “cadeado” central
    widthRatio?: number;
    depthRatio?: number;
    marginX?: number;
    marginZ?: number;

    // grelha
    gapX?: number;          // entre contentores na MESMA linha (eixo X)
    gapZ?: number;          // entre LINHAS (eixo Z)
    maxStack?: 1 | 2 | 3;
    maxCols?: number;       // limite superior de colunas (X)
    rowsMax?: number;       // limite superior de linhas (Z), 0 = sem limite

    // orientação única
    yawRad?: number;        // -PI/2 → comprimento // X
    // NOVO: fator de escala global do contentor (encolher para caber melhor)
    unitScale?: number;     // 0.7..1.0 (ex.: 0.85)
};

const DEF: Required<StacksYardOpts> = {
    zones: ["C.7", "C.8", "C.9", "C.10"],
    roadY: 0.03,
    widthRatio: 0.58,
    depthRatio: 0.55,
    marginX: 4,
    marginZ: 4,
    gapX: 0.40,          // pequeno espaçamento longitudinal
    gapZ: 0.20,          // linhas mais próximas
    maxStack: 3,
    maxCols: 24,
    rowsMax: 0,
    yawRad: -Math.PI / 2,
    unitScale: 0.85,     // ↓ contentores ~15% mais pequenos
};

/* ---------------- utils do “cadeado” ---------------- */
function centerSubRect(r: Rect, wRatio: number, dRatio: number, marginX: number, marginZ: number): Rect {
    const inner: Rect = {
        minX: r.minX + marginX, maxX: r.maxX - marginX,
        minZ: r.minZ + marginZ, maxZ: r.maxZ - marginZ,
    };
    const w = (inner.maxX - inner.minX) * THREE.MathUtils.clamp(wRatio, 0.05, 1);
    const d = (inner.maxZ - inner.minZ) * THREE.MathUtils.clamp(dRatio, 0.05, 1);
    const cx = (inner.minX + inner.maxX) / 2;
    const cz = (inner.minZ + inner.maxZ) / 2;
    return { minX: cx - w / 2, maxX: cx + w / 2, minZ: cz - d / 2, maxZ: cz + d / 2 };
}

/* ----------- normalização + dimensão final medida ----------- */
async function loadAndNormalizeContainer(url: string, unitScale: number) {
    const root = await loadGLBNormalized(url, { centerXZ: true, baseY0: true });

    // medir como veio
    root.updateWorldMatrix(true, true);
    let box = new THREE.Box3().setFromObject(root);
    let sz = box.getSize(new THREE.Vector3());

    // alinhar comprimento ao eixo X
    if (sz.z > sz.x) {
        root.rotation.y -= Math.PI / 2;
        root.updateWorldMatrix(true, true);
        box = new THREE.Box3().setFromObject(root);
        sz = box.getSize(new THREE.Vector3());
    }

    // escala alvo (40ft*SCALE) * unitScale
    const target = { L: BASE.L * unitScale, W: BASE.W * unitScale, H: BASE.H * unitScale };
    const s = Math.min(
        target.L / Math.max(sz.x, 0.001),
        target.W / Math.max(sz.z, 0.001),
        target.H / Math.max(sz.y, 0.001)
    );
    root.scale.setScalar(s);

    // recentrar XZ e assentar em Y
    root.updateWorldMatrix(true, true);
    box = new THREE.Box3().setFromObject(root);
    const center = box.getCenter(new THREE.Vector3());
    const minY = box.min.y;
    root.position.x -= center.x;
    root.position.z -= center.z;
    root.position.y -= minY;

    // sombras
    root.traverse((o: any) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });

    // dimensões finais, **medidas** (usaremos isto para o step)
    root.updateWorldMatrix(true, true);
    const finalSize = new THREE.Box3().setFromObject(root).getSize(new THREE.Vector3());
    return { root, size: finalSize };
}

/* ---------------- spawn de uma pilha ---------------- */
async function spawnStack(
    parent: THREE.Group,
    pos: THREE.Vector3,
    yawRad: number,
    roadY: number,
    stackH: number,
    urls: string[],
    unitScale: number
) {
    // mede a altura real do primeiro
    const first = await loadAndNormalizeContainer(urls[0], unitScale);
    const H = first.size.y;
    // para o primeiro nível usa o próprio first, os restantes novos loads
    for (let i = 0; i < stackH; i++) {
        const { root } = i === 0 ? first : await loadAndNormalizeContainer(urls[i % urls.length], unitScale);

        const pivot = new THREE.Group();
        pivot.position.set(pos.x, roadY + i * (H + 0.02), pos.z); // 0.02 evita z-fighting
        pivot.rotation.y = yawRad;

        pivot.add(root);
        parent.add(pivot);
    }
}

/* ---------------------- API principal ---------------------- */
export function addContainerYardsInC78910(
    parent: THREE.Group,
    grids: GridsResult | null | undefined,
    userOpts: StacksYardOpts = {}
) {
    if (!grids?.C) {
        console.warn("[stacks-yard] grids não prontas.");
        return new THREE.Group();
    }

    const O = { ...DEF, ...userOpts };
    const G = new THREE.Group(); G.name = "stacks-yard-C78910"; parent.add(G);

    // ε: folga mínima para NUNCA tocar mesmo com flutuações de bbox
    const EPS = 0.04;

    for (const key of O.zones!) {
        const grid = grids.C[key as keyof typeof grids.C];
        if (!grid) continue;

        const yard = centerSubRect(grid.rect, O.widthRatio, O.depthRatio, O.marginX, O.marginZ);
        const usableW = yard.maxX - yard.minX; // X
        const usableD = yard.maxZ - yard.minZ; // Z

        // Como o step depende da dimensão **final medida**, primeiro estimamos
        // o step com o “alvo” (BASE * unitScale). Depois medimos um contentor real
        // para refinar.
        const estLen = BASE.L * O.unitScale;
        const estWid = BASE.W * O.unitScale;

        // pass 1 (estimativa) só para contar slots
        let stepX = estLen + O.gapX + EPS;
        let stepZ = estWid + O.gapZ + EPS;

        // slots máximos que cabem geometricamente
        let colsRaw = Math.max(1, Math.floor(usableW / stepX));
        let rowsRaw = Math.max(1, Math.floor(usableD / stepZ));
        const cols = Math.min(colsRaw, Math.max(1, O.maxCols));
        const rows = O.rowsMax && O.rowsMax > 0 ? Math.min(rowsRaw, O.rowsMax) : rowsRaw;

        // Agora medimos um contentor real (precisão no step).
        // Usamos o container verde como base.
        const probe = loadAndNormalizeContainer(ASSETS_MODELS.containers.container, O.unitScale);
        // Nota: não aguardamos aqui para paralelizar; aguardamos ao usar os valores:
        void probe;

        // Função lazy que devolve tamanho real quando a promise cumprir
        let realLen = estLen, realWid = estWid;
        const ensureRealSize = async () => {
            const p = await probe;
            realLen = p.size.x; // comprimento ao longo de X
            realWid = p.size.z; // largura ao longo de Z
            stepX = realLen + O.gapX + EPS;
            stepZ = realWid + O.gapZ + EPS;
        };

        // centragem
        const offsetX = (usableW - cols * stepX) / 2 + stepX / 2;
        const offsetZ = (usableD - rows * stepZ) / 2 + stepZ / 2;

        // garante dimensionamento refinado antes de instanciar
        const prep = ensureRealSize();

        // alternância de modelo por pilha
        let toggle = 0;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const x = yard.minX + offsetX + c * stepX;
                const z = yard.minZ + offsetZ + r * stepZ;

                const urls =
                    toggle++ % 2 === 0
                        ? [ASSETS_MODELS.containers.container, ASSETS_MODELS.containers.container2]
                        : [ASSETS_MODELS.containers.container2, ASSETS_MODELS.containers.container];

                // espera o “prep” apenas na primeira utilização
                // (as seguintes já apanham stepX/stepZ reais)
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                (async () => {
                    await prep;
                    const pos = new THREE.Vector3(x, 0, z);
                    await spawnStack(G, pos, O.yawRad, O.roadY, O.maxStack, urls, O.unitScale);
                })();
            }
        }
    }
    return G;
}
