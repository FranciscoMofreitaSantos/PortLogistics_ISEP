// src/features/viewer3d/scene/objects/Vessel.ts
import * as THREE from "three";
import type { VesselDto } from "../../types";

function safe(n: any, min: number, fallback: number) {
    const v = Number(n);
    return Math.max(min, Number.isFinite(v) ? v : fallback);
}
function num(n: any, fallback: number) {
    const v = Number(n);
    return Number.isFinite(v) ? v : fallback;
}

/* --- apenas visuais --- */
const VESSEL_FREEBOARD_M  = 7;
const VESSEL_HEIGHT_SCALE = 1.35;
const VESSEL_ADD_HEIGHT_M = 0;

/** Placeholder enquanto o GLB carrega (visual only) */
export function makeVesselPlaceholder(v: VesselDto): THREE.Mesh {
    const L = safe(v.lengthMeters, 20, 70);
    const W = safe(v.widthMeters,  6,  18);

    const draft = num((v as any).draftMeters ?? 7, 7);
    const H = Math.max(5, draft + VESSEL_FREEBOARD_M) * VESSEL_HEIGHT_SCALE + VESSEL_ADD_HEIGHT_M;

    const geom = new THREE.BoxGeometry(L, H, W);
    const mat  = new THREE.MeshStandardMaterial({ color: 0x2e8197, metalness: 0.2, roughness: 0.6 });
    const mesh = new THREE.Mesh(geom, mat);

    // Y = H/2 + positionY (offset vindo do placement)
    const yOffset = num((v as any).positionY, 0);
    mesh.position.set(num((v as any).positionX, 0), H / 2 + yOffset, num((v as any).positionZ, 0));
    mesh.rotation.y = num((v as any).rotationY, 0);

    mesh.userData = { type: "Vessel", id: (v as any).id, label: `${(v as any).name} (${(v as any).imoNumber})` };
    return mesh;
}
