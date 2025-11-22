import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import * as mapper from "../mappers/staffMemberMapper";

const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPut = vi.fn();

const apiMock = {
    get: mockGet,
    post: mockPost,
    put: mockPut,
};

vi.mock("../../../services/api", async () => ({
    default: apiMock
}));


let service: typeof import('../services/staffMemberService');

const mapToDomainSpy = vi.spyOn(mapper, 'mapToStaffMemberDomain');

const mockStaffMemberResponse = {
    id: 1,
    mecanographicNumber: 'M001',
    shortName: 'Staff Test',
    email: 'test@example.com',
    phone: '123',
    schedule: { shift: 'Morning', daysOfWeek: '1000000' },
    isActive: true,
    qualificationCodes: ['Q1'],
};

describe('StaffMember Service', () => {
    beforeAll(async () => {
        service = await import('../services/staffMemberService');
    });

    beforeEach(() => {
        vi.clearAllMocks();
        mapToDomainSpy.mockImplementation((data) => ({
            ...data,
            id: String(data.id),
            qualificationCodes: data.qualificationCodes || [],
            schedule: data.schedule,
        } as any));
    });


    it('getStaffMembers deve chamar GET e mapear todos os resultados', async () => {
        const mockData = [mockStaffMemberResponse, { ...mockStaffMemberResponse, id: 2 }];
        mockGet.mockResolvedValue({ data: mockData });

        const result = await service.getStaffMembers();

        expect(mockGet).toHaveBeenCalledWith("/api/StaffMembers");
        expect(mapToDomainSpy).toHaveBeenCalledTimes(2);
        expect(result).toHaveLength(2);
    });

    it('getStaffMemberByMecNumber deve chamar GET com o número mecanográfico correto', async () => {
        mockGet.mockResolvedValue({ data: mockStaffMemberResponse });

        await service.getStaffMemberByMecNumber('M001');

        expect(mockGet).toHaveBeenCalledWith("/api/StaffMembers/mec/M001");
    });

    it('getStaffMembersByQualifications deve chamar GET com os parâmetros URL corretos (códigos)', async () => {
        mockGet.mockResolvedValue({ data: [] });
        const qualifications = ['Q1', 'Q2'];

        await service.getStaffMembersByQualifications(qualifications);

        expect(mockGet).toHaveBeenCalledWith("/api/StaffMembers/by-qualifications", { params: expect.any(URLSearchParams) });

        const callArgs = mockGet.mock.calls[0][1];
        expect(callArgs.params.toString()).toBe('codes=Q1&codes=Q2');
    });

    it('getStaffMembersByExactQualifications deve chamar GET no endpoint exato', async () => {
        mockGet.mockResolvedValue({ data: [] });
        const qualifications = ['Q3'];

        await service.getStaffMembersByExactQualifications(qualifications);

        expect(mockGet).toHaveBeenCalledWith("/api/StaffMembers/by-exact-qualifications", { params: expect.any(URLSearchParams) });
    });

    it('createStaffMember deve chamar POST com o DTO de criação', async () => {
        const request = { shortName: 'New', email: 'a@b.com', phone: '1', schedule: { shift: 'Night', daysOfWeek: '0000001' }, isActive: true };
        mockPost.mockResolvedValue({ data: mockStaffMemberResponse });

        await service.createStaffMember(request as any);

        expect(mockPost).toHaveBeenCalledWith("/api/StaffMembers", request);
    });

    it('updateStaffMember deve chamar PUT com o DTO de atualização', async () => {
        const request = { mecNumber: 'M001', shortName: 'Novo Nome', isActive: false };
        mockPut.mockResolvedValue({ data: mockStaffMemberResponse });

        await service.updateStaffMember(request);

        expect(mockPut).toHaveBeenCalledWith("/api/StaffMembers/update", request);
    });

    it('toggleStaffMemberStatus deve chamar PUT no endpoint de toggle', async () => {
        mockPut.mockResolvedValue({ data: { ...mockStaffMemberResponse, isActive: false } });

        await service.toggleStaffMemberStatus('M001');

        expect(mockPut).toHaveBeenCalledWith("/api/StaffMembers/toggle/M001");
    });
});