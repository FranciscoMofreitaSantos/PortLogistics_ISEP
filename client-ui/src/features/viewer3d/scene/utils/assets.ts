// src/features/viewer3d/scene/assets.ts
const BASE = import.meta.env.BASE_URL || "/"; // funciona em subpath

const MODELS = `${BASE}3Dmodels`;
const TEX    = `${BASE}3Dtextures`;

export const ASSETS_MODELS = {
    vessels: {
        vessel: `${MODELS}/ships/Boat.glb`,
        vesseltuga: `${MODELS}/ships/boat-tow-a.glb`,
        vesseltugb: `${MODELS}/ships/boat-tow-b.glb`,
        cruise: `${MODELS}/ships/Cruise_ship.glb`,
        cargo: `${MODELS}/ships/ship-cargo-a.glb`,
        ship_ocean: `${MODELS}/ships/ship-ocean-liner.glb`,
    },
    containers: {
        container: `${MODELS}/containers/Container.glb`,
        container2: `${MODELS}/containers/Container2.glb`,
        container3: `${MODELS}/containers/Container3.glb`,
    },
    cranes: {},
    vehicles: {
        van:          `${MODELS}/vehicles/van.glb`,
        deliveryFlat: `${MODELS}/vehicles/delivery-flat.glb`,
    },
    props: {},
} as const;

export const ASSETS_TEXTURES = {
    vessels: {
        containerShip: `${TEX}/ships/colormap.png`,
    },
    containers: {},
    cranes: {},
    vehicles: {},
    props: {},
} as const;
