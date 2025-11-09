import * as THREE from "three";
import type { StorageAreaDto } from "../../types";
import { Materials } from "../Materials";

// src/features/viewer3d/scene/objects/StorageArea.ts
export function makeStorageAreaPlaceholder(sa: StorageAreaDto): THREE.Object3D {
    const baseW = Math.max(2, Number(sa.widthM)  || 10);
    const baseH = Math.max(1, Number(sa.heightM) ||  3);
    const baseD = Math.max(2, Number(sa.depthM)  || 10);

    // ↑ ligeiramente maiores no piso; ↑ mais altos
    const FOOTPRINT_SCALE = 0.65; // 0.5 → 0.65 (maior)
    const HEIGHT_SCALE    = 1.4;  // 0.5 → 1.4  (mais alto)

    const W = baseW * FOOTPRINT_SCALE;
    const H = baseH * HEIGHT_SCALE;
    const D = baseD * FOOTPRINT_SCALE;

    const mesh = new THREE.Mesh(new THREE.BoxGeometry(W, H, D), Materials.storage);
    mesh.castShadow = false; mesh.receiveShadow = true;

    const x = Number(sa.positionX) || 0;
    const z = Number(sa.positionZ) || 0;
    mesh.position.set(x, H / 2 /*assenta no chão*/, z);

    mesh.userData = { type: "StorageArea", id: sa.id, label: sa.name };
    return mesh;
}

