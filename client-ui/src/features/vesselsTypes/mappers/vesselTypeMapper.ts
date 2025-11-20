import type { VesselType } from "../domain/vesselType";
import type {
    VesselTypeResponseDto,
    CreateVesselTypeDto,
    UpdateVesselTypeDto,
} from "../dto/vesselTypesDtos";

// DTO -> Domain
export function mapVesselTypeDto(dto: VesselTypeResponseDto): VesselType {
    return {
        id: dto.id,
        name: dto.name,
        description: dto.description,
        maxBays: dto.maxBays,
        maxRows: dto.maxRows,
        maxTiers: dto.maxTiers,
        capacityTeu: dto.capacity,
    };
}

// Domain (ou form) -> Create DTO
export function toCreateVesselTypeDto(data: Omit<VesselType, "id" | "capacityTeu">): CreateVesselTypeDto {
    return {
        name: data.name,
        description: data.description ?? null,
        maxBays: data.maxBays,
        maxRows: data.maxRows,
        maxTiers: data.maxTiers,
    };
}

// Domain (ou form) -> Update DTO
export function toUpdateVesselTypeDto(data: Partial<Omit<VesselType, "capacityTeu">>): UpdateVesselTypeDto {
    return {
        name: data.name,
        description: data.description ?? null,
        maxBays: data.maxBays,
        maxRows: data.maxRows,
        maxTiers: data.maxTiers,
    };
}
