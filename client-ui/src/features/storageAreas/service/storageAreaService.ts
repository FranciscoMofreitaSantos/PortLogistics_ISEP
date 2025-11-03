import api from "../../../services/api";
import type {
    CreatingStorageArea,
    StorageAreaDto,
    StorageAreaDockDistance,
    StorageAreaGridDto,
    ContainerDto
} from "../type/storageAreaType";

/** Get all storage areas */
export async function getAllStorageAreas(): Promise<StorageAreaDto[]> {
    const response = await api.get("/api/storageAreas");
    return response.data;
}

/** Get storage area by ID (GUID) */
export async function getStorageAreaById(id: string): Promise<StorageAreaDto> {
    const response = await api.get(`/api/storageAreas/id/${id}`);
    return response.data;
}

/** Get storage area by name */
export async function getStorageAreaByName(name: string): Promise<StorageAreaDto> {
    const response = await api.get(`/api/storageAreas/name/${name}`);
    return response.data;
}

/** Get distances to docks (by id or name) */
export async function getStorageAreaDistances(
    id?: string,
    name?: string
): Promise<StorageAreaDockDistance[]> {
    const params: Record<string, string> = {};
    if (id) params.id = id;
    if (name) params.name = name;

    const response = await api.get("/api/storageAreas/distances", { params });
    return response.data;
}

/** Get physical resources of a storage area (by id or name) */
export async function getStorageAreaResources(id?: string, name?: string): Promise<string[]> {
    const params: Record<string, string> = {};
    if (id) params.id = id;
    if (name) params.name = name;

    const response = await api.get("/api/storageAreas/physicalresources", { params });
    return response.data;
}

/** Create a new storage area */
export async function createStorageArea(data: CreatingStorageArea): Promise<StorageAreaDto> {
    const response = await api.post("/api/storageAreas", data);
    return response.data;
}

/** Get REAL grid for a storage area (occupied slots) */
export async function getStorageAreaGrid(id: string): Promise<StorageAreaGridDto> {
    const response = await api.get(`/api/storageAreas/${id}/grid`);
    return response.data;
}


// storageAreaService.ts
export async function getContainerAtPosition(storageAreaId: string, bay: number, row: number, tier: number): Promise<ContainerDto> {
    const res = await api.get(`/api/storageAreas/${storageAreaId}/container`, {
        params: { bay, row, tier }
    });

    const raw = res.data;

    return {
        id: raw.id,
        isoNumber: raw.isoCode?.value ?? raw.isoCode ?? "-", 
        description: raw.description ?? "-",
        containerType: raw.type ?? "-",         
        containerStatus: raw.status ?? "-",
        weight: raw.weightKg ?? 0
    };
}




const storageAreaService = {
    getAll: getAllStorageAreas,
    getById: getStorageAreaById,
    getByName: getStorageAreaByName,
    getDistances: getStorageAreaDistances,
    getResources: getStorageAreaResources,
    create: createStorageArea,
    getGrid: getStorageAreaGrid,
    getContainerAtPosition: getContainerAtPosition,
};

export default storageAreaService;
