import * as THREE from "three";
import type { StorageAreaDto } from "../../types";
import { Materials } from "../Materials";


export function makeStorageAreaPlaceholder(sa: StorageAreaDto): THREE.Object3D {
    const W = Math.max(2, Number(sa.widthM)  || 10);
    const H = Math.max(1, Number(sa.heightM) ||  3);
    const D = Math.max(2, Number(sa.depthM)  || 10);

    const mesh = new THREE.Mesh(new THREE.BoxGeometry(W, H, D), Materials.storage);
    mesh.castShadow = false; mesh.receiveShadow = true;

    const x = Number(sa.positionX) || 0;
    const y = (Number(sa.positionY) || 0);
    const z = Number(sa.positionZ) || 0;
    mesh.position.set(x, y, z);

    mesh.userData = { type: "StorageArea", id: sa.id, label: sa.name };
    return mesh;
}
