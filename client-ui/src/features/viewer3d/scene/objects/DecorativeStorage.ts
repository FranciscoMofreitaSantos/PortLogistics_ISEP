// src/features/viewer3d/scene/objects/DecorativeStorage.ts
import * as THREE from "three";

export type DecorativeNode = {
    zone: string;
    widthM: number; depthM: number; heightM: number;
    positionX: number; positionZ: number; rotationY: number;
};

const MAT = new THREE.MeshStandardMaterial({ color: 0xffd44d, metalness: 0, roughness: 1 });

export function makeDecorativeStorage(n: DecorativeNode): THREE.Mesh {
    const geom = new THREE.BoxGeometry(n.widthM, n.heightM, n.depthM);
    const mesh = new THREE.Mesh(geom, MAT);
    mesh.position.set(n.positionX, n.heightM / 2 + 0.01, n.positionZ);
    mesh.rotation.y = n.rotationY || 0;
    mesh.castShadow = false;
    mesh.receiveShadow = true;
    mesh.name = `DecorativeStorage:${n.zone}`;
    mesh.userData = { type: "DecorativeStorage", zone: n.zone };
    return mesh;
}
