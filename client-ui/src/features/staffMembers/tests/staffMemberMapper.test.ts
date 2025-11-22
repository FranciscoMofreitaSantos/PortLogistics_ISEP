import { describe, it, expect } from "vitest";
import { mapToStaffMemberDomain } from "../mappers/staffMemberMapper";
import type { StaffMember } from "../domain/staffMember.ts";

describe('StaffMember Mapper', () => {
    it('deve mapear a resposta completa da API para o domínio StaffMember', () => {
        const apiResponse = {
            id: 101,
            shortName: 'John Doe',
            mecanographicNumber: 'M12345',
            email: 'john.doe@example.com',
            phone: '123456789',
            schedule: {
                shift: 'Morning',
                daysOfWeek: '0000111',
            },
            isActive: true,
            qualificationCodes: ['Q1', 'Q2'],
            extraField: 'should be ignored'
        };

        const expectedDomain: StaffMember = {
            id: '101',
            shortName: 'John Doe',
            mecanographicNumber: 'M12345',
            email: 'john.doe@example.com',
            phone: '123456789',
            schedule: {
                shift: 'Morning',
                daysOfWeek: '0000111',
            },
            isActive: true,
            qualificationCodes: ['Q1', 'Q2'],
        };

        const result = mapToStaffMemberDomain(apiResponse);

        expect(result).toEqual(expectedDomain);
        expect(typeof result.id).toBe('string');
        expect(result.qualificationCodes).toEqual(['Q1', 'Q2']);
    });

    it('deve lidar com qualificationCodes nulos ou vazios', () => {
        const apiResponse = {
            id: 102,
            shortName: 'Jane Smith',
            mecanographicNumber: 'M67890',
            email: 'jane.smith@example.com',
            phone: '987654321',
            schedule: {
                shift: 'Evening',
                daysOfWeek: '1111100',
            },
            isActive: true,
            qualificationCodes: null,
        };

        const result = mapToStaffMemberDomain(apiResponse);
        expect(result.qualificationCodes).toEqual([]);
    });
});