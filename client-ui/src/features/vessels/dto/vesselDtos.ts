export type VesselDto = {
    id: string;
    name: string;
    owner: string;
    imoNumber: string | { value: string };
    vesselTypeId: string | { value: string };
};

export type CreateVesselRequestDto = {
    imoNumber: string;
    name: string;
    owner: string;
    vesselTypeName: string;
};

export type UpdateVesselRequestDto = {
    name?: string;
    owner?: string;
};
