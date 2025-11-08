// src/features/viewer3d/scene/PortScene.ts
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { SceneData, ContainerDto, StorageAreaDto } from "../types";

import { makePortBase } from "./objects/PortBase";
import { ASSETS_TEXTURES } from "./utils/assets";
// @ts-ignore – ficheiro local em JS/TS sem types
import { computePortGrids, drawPortGridsDebug } from "./objects/portGrids";
import { makeContainerPlaceholder } from "./objects/Container";
import { addRoadPoles } from "./objects/roadLights";
import { makeStorageAreaPlaceholder } from "./objects/StorageArea";

export type LayerVis = { containers: boolean };

export class PortScene {
    container: HTMLDivElement;
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    controls: OrbitControls;

    gBase = new THREE.Group();
    gContainers = new THREE.Group();
    gStorage = new THREE.Group();

    pickables: THREE.Object3D[] = [];
    reqId = 0;

    private _grids: ReturnType<typeof computePortGrids> | null = null;

    constructor(container: HTMLDivElement) {
        this.container = container;

        // === RENDERER ===
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(this.renderer.domElement);

        // === SCENE & LIGHTS ===
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);

        this.camera = new THREE.PerspectiveCamera(20, container.clientWidth / container.clientHeight, 0.1, 8000);
        this.camera.position.set(180, 200, 420);

        this.scene.add(new THREE.AmbientLight(0xffffff, 0.6));
        this.scene.add(new THREE.HemisphereLight(0xffffff, 0x404040, 0.25));

        // === BASE DO PORTO ===
        const { group: base, layout } = makePortBase({
            width: 1200,
            depth: 1000,
            waterMargin: 500,
            roadWidth: 12,
            gridStep: 10,
            slabHeight: 0,
            slabThickness: 18,
            waterGap: 10,
            waterThickness: 60,
            showZones: false,
            showGrid: false,
            textures: {
                paving: ASSETS_TEXTURES.port.paving.paving,
                water: ASSETS_TEXTURES.port.water.water,
                road_vertical: ASSETS_TEXTURES.port.road.road,
                road_horizontal: ASSETS_TEXTURES.port.road.roadhorizontal,
            },
        });
        this.gBase = base;
        this.scene.add(this.gBase);

        // === FARÓIS ===
        addRoadPoles(this.scene, layout, {
            yGround: 0,
            roadWidth: 12,
            poleHeight: 7.5,
            poleOffset: 1.4,
            spacing: 22,
            intensity: 0,
            spawnGlow: false,
            clearMargin: 1.2,
        });

        // === GRELHAS (A/B/C) ===
        const W = layout.zoneC.size.w;
        const D = layout.zoneC.size.d * 2;
        this._grids = computePortGrids(W, D, 10);
        drawPortGridsDebug(this.scene, this._grids, 0.06);

        // === CÂMARA ===
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.target.set(0, 0, 0);

        // === GRUPOS ===
        this.gContainers.name = "containers";
        this.gStorage.name = "storage-areas";
        this.gBase.add(this.gContainers); // containers também herdam transform da base
        this.gBase.add(this.gStorage);    // IMPORTANTE: storages no mesmo parent da base

        window.addEventListener("resize", this.onResize);
        this.loop();
    }

    onResize = () => {
        const w = this.container.clientWidth, h = this.container.clientHeight;
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
    };

    setLayers(vis: LayerVis) {
        this.gContainers.visible = vis.containers;
    }

    /* ======================================================================
       LAYOUT SIMPLES: distribuir Storage Areas dentro da Zona B (B.1 → B.2)
       ----------------------------------------------------------------------
       Estratégia:
       - "Row-major": varre em X (esquerda→direita) e quebra linha em Z quando
         não cabe mais; quando enche B.1, continua em B.2.
       - Respeita margin às bordas e gap entre peças.
       ====================================================================== */

    private placeRectFillRowMajor(
        items: StorageAreaDto[],
        fromIdx: number,
        rect: { minX: number; maxX: number; minZ: number; maxZ: number },
        margin = 4,
        gap = 2
    ): number {
        let i = fromIdx;

        let x = rect.minX + margin;
        let z = rect.minZ + margin;
        let rowMaxDepth = 0;

        while (i < items.length) {
            const sa = items[i] as any;
            const w = Math.max(2, Number(sa.widthM)  || 10); // extensão em X
            const d = Math.max(2, Number(sa.depthM)  || 10); // extensão em Z
            const h = Math.max(1, Number(sa.heightM) ||  3); // extensão em Y

            // se não cabe nesta linha, nova linha (Z+)
            if (x + w + margin > rect.maxX) {
                x = rect.minX + margin;
                z += rowMaxDepth + gap;
                rowMaxDepth = 0;
            }

            // se não cabe no rect (altura restante), para
            if (z + d + margin > rect.maxZ) break;

            // centro do slot
            const cx = x + w / 2;
            const cz = z + d / 2;

            sa.positionX = cx;
            sa.positionY = h / 2;
            sa.positionZ = cz;
            (sa as any).rotationY = 0;

            // avança
            x += w + gap;
            rowMaxDepth = Math.max(rowMaxDepth, d);
            i++;
        }

        return i;
    }

    /** Preenche B.1 e depois B.2 com grelha simples. */
    private placeStorageAreasInB(storage: StorageAreaDto[]) {
        if (!this._grids) return;
        const B1 = this._grids.B["B.1"].rect;
        const B2 = this._grids.B["B.2"].rect;

        let idx = this.placeRectFillRowMajor(storage, 0, B1, 4, 2);
        if (idx < storage.length) {
            this.placeRectFillRowMajor(storage, idx, B2, 4, 2);
        }
    }

    /* ===================== Containers: A.2 com máx. 2 tiers ===================== */

    private remapContainersToA2_Max2PerSlot(
        items: ContainerDto[],
        gridA2: {
            rect: { minX: number; maxX: number; minZ: number; maxZ: number };
            rows: number; cols: number;
            cells: Array<{
                minX: number; maxX: number; minZ: number; maxZ: number;
                r: number; c: number; center: THREE.Vector3;
            }>;
        }
    ) {
        const SCALE = 3;
        const ROAD_W = 12;

        const L40 = 12.19 * SCALE;  // X
        const W40 =  2.44 * SCALE;  // Z
        const H    =  2.59 * SCALE; // Y
        const SAFE = 1.0;
        const GAP_Y = 0.14;

        const rect = gridA2.rect;

        const insetFromX0   = ROAD_W / 2 + W40 / 2 + SAFE;
        const insetFromZTop = ROAD_W / 2 + L40 / 2 + SAFE;

        const strideR = 3;
        const strideC = 2;

        const slots = gridA2.cells
            .filter((cell) => {
                const { r, c } = cell;
                const cx = cell.center.x, cz = cell.center.z;

                if (cx < rect.minX + insetFromX0) return false;
                if (cx > rect.maxX - (W40 / 2 + SAFE)) return false;
                if (cz < rect.minZ + (L40 / 2 + SAFE)) return false;
                if (cz > rect.maxZ - insetFromZTop)   return false;

                if (r < 1 || r >= gridA2.rows - 1) return false;
                if (c < 1 || c >= gridA2.cols - 1) return false;

                if (r % strideR !== 0) return false;
                if (c % strideC !== 0) return false;

                return true;
            })
            .sort((a, b) => (a.c - b.c) || (a.r - b.r));

        if (!slots.length) return;

        for (let i = 0; i < items.length; i++) {
            const slotIndex = Math.floor(i / 2) % slots.length;
            const tier = i % 2; // 0 ou 1
            const cell = slots[slotIndex];
            const c = items[i];

            c.positionX = cell.center.x;
            c.positionY = (H / 2) + tier * (H + GAP_Y);
            c.positionZ = cell.center.z;
            (c as any).rotationY = 0;
        }
    }

    /* ===================== LOAD / PICK / LOOP / DISPOSE ===================== */

    load(data: SceneData) {
        // limpa containers
        while (this.gContainers.children.length) {
            const c: any = this.gContainers.children.pop();
            c?.geometry?.dispose?.();
            if (Array.isArray(c?.material)) c.material.forEach((m: any) => m?.dispose?.());
            else c?.material?.dispose?.();
        }
        // limpa storage
        while (this.gStorage.children.length) {
            const o: any = this.gStorage.children.pop();
            o?.geometry?.dispose?.();
            if (Array.isArray(o?.material)) o.material.forEach((m: any) => m?.dispose?.());
            else o?.material?.dispose?.();
        }
        this.pickables = [];

        // ======== STORAGE AREAS ========
        const storageCopy = data.storageAreas.map(sa => ({ ...sa }));
        this.placeStorageAreasInB(storageCopy); // novo layout simples
        for (const sa of storageCopy) {
            const m = makeStorageAreaPlaceholder(sa);
            if ((sa as any).rotationY != null) (m as any).rotation.y = Number((sa as any).rotationY) || 0;
            this.gStorage.add(m);
            this.pickables.push(m);
        }

        // ======== CONTAINERS (A.2, máx. 2 tiers por célula) ========
        const a2 = this._grids?.A?.["A.2"];
        if (a2) this.remapContainersToA2_Max2PerSlot(data.containers, a2);

        for (const c of data.containers) {
            const mesh = makeContainerPlaceholder(c, 3);
            this.gContainers.add(mesh);
            this.pickables.push(mesh);
        }

        // Enquadrar câmara aos pickables
        const box = new THREE.Box3();
        this.pickables.forEach((o) => box.expandByObject(o));
        if (!box.isEmpty()) {
            const size = new THREE.Vector3(), center = new THREE.Vector3();
            box.getSize(size);
            box.getCenter(center);
            const maxSize = Math.max(size.x, size.y, size.z);
            const distance = (maxSize * 1.5) / Math.tan((this.camera.fov * Math.PI) / 360);
            const dir = new THREE.Vector3(1, 1, 1).normalize();
            this.controls.target.copy(center);
            this.camera.position.copy(center.clone().add(dir.multiplyScalar(distance)));
            this.camera.near = Math.max(0.1, maxSize / 1000);
            this.camera.far = Math.max(2000, distance * 10);
            this.camera.updateProjectionMatrix();
        }
    }

    /** Click → devolve o userData do objeto selecionado */
    raycastAt = (ev: MouseEvent, onPick?: (u: any) => void) => {
        const rect = this.renderer.domElement.getBoundingClientRect();
        const mouse = new THREE.Vector2(
            ((ev.clientX - rect.left) / rect.width) * 2 - 1,
            -((ev.clientY - rect.top) / rect.height) * 2 + 1
        );
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.camera);

        const hits = raycaster.intersectObjects(this.pickables, true);
        if (!hits.length) return;

        let obj: THREE.Object3D | null = hits[0].object;
        while (obj && !obj.userData?.type) obj = obj.parent!;
        onPick?.(obj?.userData ?? { type: "Unknown" });
    };

    loop = () => {
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
        this.reqId = requestAnimationFrame(this.loop);
    };

    dispose() {
        cancelAnimationFrame(this.reqId);
        window.removeEventListener("resize", this.onResize);
        this.scene.traverse((o) => {
            const m = o as THREE.Mesh;
            (m.geometry as any)?.dispose?.();
            const mat = (m.material as THREE.Material | THREE.Material[] | undefined);
            if (Array.isArray(mat)) mat.forEach((mm) => (mm as any)?.dispose?.());
            else (mat as any)?.dispose?.();
        });
        this.renderer.dispose();
        if (this.container.contains(this.renderer.domElement)) {
            this.container.removeChild(this.renderer.domElement);
        }
    }
}
