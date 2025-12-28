import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import * as mapper from "../mappers/complementaryTaskMapper";

// Mocks para a API
const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPut = vi.fn();

vi.mock("../../../services/api", () => ({
    operationsApi: {
        get: mockGet,
        post: mockPost,
        put: mockPut,
    }
}));

let service: typeof import('../services/complementaryTaskService');
const mapToDomainSpy = vi.spyOn(mapper, 'mapToCTDomain');

describe('ComplementaryTask Service', () => {

    beforeAll(async () => {
        service = await import('../services/complementaryTaskService');
    });

    beforeEach(() => {
        vi.clearAllMocks();
        // Implementação básica do spy para retornar o dado como está
        mapToDomainSpy.mockImplementation((data) => data as any);
    });

    it('getAllCT deve chamar GET e mapear a lista de resultados', async () => {
        const mockData = [{ id: "1", code: "C1" }, { id: "2", code: "C2" }];
        mockGet.mockResolvedValue({ data: mockData });

        const result = await service.getAllCT();

        expect(mockGet).toHaveBeenCalledWith("/api/complementary-tasks");
        expect(mapToDomainSpy).toHaveBeenCalledTimes(2);
        expect(result).toHaveLength(2);
    });

    it('createCT deve chamar POST com o DTO correto', async () => {
        const dto = { code: "NEW", category: "CAT1" } as any;
        mockPost.mockResolvedValue({ data: { id: "10", ...dto } });

        await service.createCT(dto);

        expect(mockPost).toHaveBeenCalledWith("/api/complementary-tasks", dto);
        expect(mapToDomainSpy).toHaveBeenCalled();
    });

    it('updateCT deve chamar PUT com o código e DTO', async () => {
        const code = "CT01";
        const dto = { status: "InProgress" } as any;
        mockPut.mockResolvedValue({ data: { code, ...dto } });

        await service.updateCT(code, dto);

        expect(mockPut).toHaveBeenCalledWith(`/api/complementary-tasks/${code}`, dto);
    });

    it('getCTByCode deve chamar a rota de pesquisa por código', async () => {
        mockGet.mockResolvedValue({ data: { code: "ABC" } });

        await service.getCTByCode("ABC");

        expect(mockGet).toHaveBeenCalledWith("/api/complementary-tasks/search/code/ABC");
    });

    describe('getCTByVveCode', () => {
        it('deve lidar com resposta que é um objeto único', async () => {
            const mockData = { id: "1", vve: "VVE1" };
            mockGet.mockResolvedValue({ data: mockData });

            const result = await service.getCTByVveCode("VVE1");

            expect(result).toHaveLength(1);
            expect(result[0].id).toBe("1");
        });

        it('deve lidar com resposta que é um array', async () => {
            const mockData = [{ id: "1" }, { id: "2" }];
            mockGet.mockResolvedValue({ data: mockData });

            const result = await service.getCTByVveCode("VVE1");

            expect(result).toHaveLength(2);
        });

        it('deve retornar array vazio se não houver dados', async () => {
            mockGet.mockResolvedValue({ data: null });

            const result = await service.getCTByVveCode("VVE1");

            expect(result).toEqual([]);
        });
    });

    it('getCTInRange deve passar os parâmetros de tempo corretamente', async () => {
        mockGet.mockResolvedValue({ data: [] });
        const start = 1000;
        const end = 2000;

        await service.getCTInRange(start, end);

        expect(mockGet).toHaveBeenCalledWith("/api/complementary-tasks/search/in-range", {
            params: { timeStart: start, timeEnd: end }
        });
    });
});