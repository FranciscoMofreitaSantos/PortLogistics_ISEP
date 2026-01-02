import { operationsApi } from "../../../services/api.tsx";

export type UpdateBerthDockDto = {
    actualBerthTime: string;
    actualDockId: string;
    updaterEmail: string;
};

export async function updateBerthDockVVE(id: string, dto: UpdateBerthDockDto) {
    const res = await operationsApi.put(`/api/vve/${id}/berth`, dto);
    return res.data;
}
