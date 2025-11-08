// src/features/viewer3d/scene/PortScene.ts
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { SceneData, ContainerDto } from "../types";

import { makePortBase } from "./objects/PortBase";
import { ASSETS_TEXTURES } from "./utils/assets";
import { computePortGrids, drawPortGridsDebug } from "./objects/portGrids";
import { makeContainerPlaceholder } from "./objects/Container";
import { addRoadPoles } from "./objects/roadLights";

export type LayerVis = { containers: boolean };

export class PortScene {
    container: HTMLDivElement;
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    controls: OrbitControls;

    gBase = new THREE.Group();
    gContainers = new THREE.Group();

    pickables: THREE.Object3D[] = [];
    reqId = 0;

    private _grids: ReturnType<typeof computePortGrids> | null = null;

    constructor(container: HTMLDivElement) {
        this.container = container;

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(this.renderer.domElement);

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);

        this.camera = new THREE.PerspectiveCamera(
            60,
            container.clientWidth / container.clientHeight,
            0.1,
            8000
        );
        this.camera.position.set(180, 200, 420);

        this.scene.add(new THREE.AmbientLight(0xffffff, 0.6));
        this.scene.add(new THREE.HemisphereLight(0xffffff, 0x404040, 0.25));

        // === BASE DO PORTO ===
        const { group: base, layout } = makePortBase({
            width: 1200,
            depth: 1200,
            waterMargin: 500,
            roadWidth: 12,
            gridStep: 10,
            slabHeight: 0,
            slabThickness: 18,
            waterGap: 10,
            waterThickness: 60,
            showZones: false,  // <- põe false se quiseres sem overlays
            showGrid: true,   // <- põe false para desligar grelha técnica
            textures: {
                paving: ASSETS_TEXTURES.port.paving.paving,
                water: ASSETS_TEXTURES.port.water.water,
                road_vertical: ASSETS_TEXTURES.port.road.road,
                road_horizontal: ASSETS_TEXTURES.port.road.roadhorizontal,
            },
        });
        this.gBase = base;
        this.scene.add(this.gBase);

        // === FARÓIS (mantidos) ===
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
        // Deriva W/D reais do layout para evitar hardcode:
        const W = layout.zoneC.size.w;           // == width
        const D = layout.zoneC.size.d * 2;       // zona C é metade superior → D/2, logo D = 2*C.d
        this._grids = computePortGrids(W, D, 10);
        drawPortGridsDebug(this.scene, this._grids, 0.06);

        // === CÂMARA ===
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.target.set(0, 0, 0);

        // === GRUPO DE CONTENTORES ===
        this.gContainers.name = "containers";
        this.scene.add(this.gContainers);

        window.addEventListener("resize", this.onResize);
        this.loop();
    }

    onResize = () => {
        const w = this.container.clientWidth,
            h = this.container.clientHeight;
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
    };

    setLayers(vis: LayerVis) {
        this.gContainers.visible = vis.containers;
    }

    load(data: SceneData) {
        // Limpa contentores
        while (this.gContainers.children.length) {
            const c: any = this.gContainers.children.pop();
            c?.geometry?.dispose?.();
            if (Array.isArray(c?.material)) c.material.forEach((m: any) => m?.dispose?.());
            else c?.material?.dispose?.();
        }
        this.pickables = [];

        // Remapeia TODOS para A.2 (máx. 2 por célula com folga)
        const a2 = this._grids?.A?.["A.2"];
        if (a2) this.remapContainersToA2_Max2PerSlot(data.containers, a2);

        // Adiciona placeholders (escala 3×)
        for (const c of data.containers) {
            const mesh = makeContainerPlaceholder(c, 3);

            this.gContainers.add(mesh);
            this.pickables.push(mesh);
        }

        // Enquadrar câmara
        const box = new THREE.Box3();
        this.pickables.forEach((o) => box.expandByObject(o));
        if (!box.isEmpty()) {
            const size = new THREE.Vector3(),
                center = new THREE.Vector3();
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

    /**
     * A.2 com **no máximo 2 tiers por célula**.
     * Usa stride em linhas/colunas para deixar ruas e margem de segurança.
     */
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

        const L40 = 12.19 * SCALE;  // comprimento (X geom)
        const W40 =  2.44 * SCALE;  // largura (Z geom)
        const H    =  2.59 * SCALE;  // altura
        const SAFE = 1.0;
        const GAP_Y = 0.14;         // folga entre tiers

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
            .sort((a, b) => (a.r - b.r) || (a.c - b.c));

        if (!slots.length) return;

        // 2 por slot (tier 0 e 1), com folga vertical
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
