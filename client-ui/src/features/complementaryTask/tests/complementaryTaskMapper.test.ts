import { describe, it, expect } from "vitest";
import { mapToCTDomain } from "../mappers/complementaryTaskMapper";
import type { ComplementaryTaskDTO } from "../dtos/complementaryTaskDTO";

describe('ComplementaryTask Mapper', () => {
    it('deve mapear um DTO para o domínio ComplementaryTask corretamente', () => {
        const dto: ComplementaryTaskDTO = {
            id: "1",
            code: "CT001",
            category: "Limpeza",
            staff: "John Doe",
            timeStart: new Date("2023-10-10T10:00:00Z"),
            timeEnd: new Date("2023-10-10T12:00:00Z"),
            status: "Scheduled",
            vve: "VVE123"
        };

        const result = mapToCTDomain(dto);

        expect(result).toEqual({
            id: "1",
            code: "CT001",
            category: "Limpeza",
            staff: "John Doe",
            timeStart: dto.timeStart,
            timeEnd: dto.timeEnd,
            status: "Scheduled",
            vve: "VVE123"
        });
    });
});