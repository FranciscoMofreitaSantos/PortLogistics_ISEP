import type { VesselDto } from "../dto/vesselDtos";
import type { Vessel } from "../domain/vessel";

export function mapVesselDto(dto: VesselDto): Vessel {
    return {
        id: dto.id,
        name: dto.name,
        owner: dto.owner,
        imoNumber: dto.imoNumber,
        vesselTypeId: dto.vesselTypeId,
    };
}
