import type { DockRebalanceFinalDto } from "../dto/dockRebalanceDTO";
import { planningApi } from "../../../services/api";


export async function getDockRebalanceProposal(day: string): Promise<DockRebalanceFinalDto> {
    const res = await planningApi.get("/api/rebalance/docks/plan", {
        params: { day }
    });

    return res.data;
}