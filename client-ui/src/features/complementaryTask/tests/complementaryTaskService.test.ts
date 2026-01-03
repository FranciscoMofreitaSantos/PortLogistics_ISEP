import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import * as mapper from "../mappers/complementaryTaskMapper";

//
// 🔹 Mock user store para gerar o header automaticamente
//
vi.mock("../../../app/store", () => ({
    useAppStore: {
        getState: () => ({
            user: {
                email: "unit.test@mock.com"
            }
        })
    }
}));

const expectedHeaders = {
    headers: {
        "x-user-email": "unit.test@mock.com"
    }
};

//
// 🔹 Mocks da API
//
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

let service: typeof import("../services/complementaryTaskService");

const mapToDomainSpy = vi.spyOn(mapper, "mapToCTDomain");

describe("ComplementaryTask Service", () => {

    beforeAll(async () => {
        service = await import("../services/complementaryTaskService");
    });

    beforeEach(() => {
        vi.clearAllMocks();

        // retorna o DTO como está (evitar dependência no mapper)
        mapToDomainSpy.mockImplementation(data => data as any);
    });

    it("getAllCT deve chamar GET com header e mapear resultados", async () => {

        const mockData = [
            { id: "1", code: "C1" },
            { id: "2", code: "C2" }
        ];

        mockGet.mockResolvedValue({ data: mockData });

        const result = await service.getAllCT();

        expect(mockGet).toHaveBeenCalledWith(
            "/api/complementary-tasks",
            expectedHeaders
        );

        expect(mapToDomainSpy).toHaveBeenCalledTimes(2);
        expect(result).toHaveLength(2);
    });

    it("createCT deve chamar POST com DTO e header", async () => {

        const dto = { code: "NEW", category: "CAT1" } as any;

        mockPost.mockResolvedValue({
            data: { id: "10", ...dto }
        });

        await service.createCT(dto);

        expect(mockPost).toHaveBeenCalledWith(
            "/api/complementary-tasks",
            dto,
            expectedHeaders
        );

        expect(mapToDomainSpy).toHaveBeenCalled();
    });

    it("updateCT deve chamar PUT com código, DTO e header", async () => {

        const code = "CT01";
        const dto = { status: "InProgress" } as any;

        mockPut.mockResolvedValue({
            data: { code, ...dto }
        });

        await service.updateCT(code, dto);

        expect(mockPut).toHaveBeenCalledWith(
            `/api/complementary-tasks/${code}`,
            dto,
            expectedHeaders
        );
    });

    it("getCTByCode deve chamar rota correta com header", async () => {

        mockGet.mockResolvedValue({ data: { code: "ABC" } });

        await service.getCTByCode("ABC");

        expect(mockGet).toHaveBeenCalledWith(
            "/api/complementary-tasks/search/code/ABC",
            expectedHeaders
        );
    });

    //
    // -------- getCTByVveCode ----------
    //

    describe("getCTByVveCode", () => {

        it("deve lidar com resposta como objeto único", async () => {

            const mockData = { id: "1", vve: "VVE1" };

            mockGet.mockResolvedValue({ data: mockData });

            const result = await service.getCTByVveCode("VVE1");

            expect(mockGet).toHaveBeenCalledWith(
                "/api/complementary-tasks/search/vveCode",
                {
                    ...expectedHeaders,
                    params: { vve: "VVE1" }
                }
            );

            expect(result).toHaveLength(1);
            expect(result[0].id).toBe("1");
        });

        it("deve lidar com resposta como array", async () => {

            const mockData = [{ id: "1" }, { id: "2" }];

            mockGet.mockResolvedValue({ data: mockData });

            const result = await service.getCTByVveCode("VVE1");

            expect(result).toHaveLength(2);
        });

        it("deve retornar array vazio se API devolver null", async () => {

            mockGet.mockResolvedValue({ data: null });

            const result = await service.getCTByVveCode("VVE1");

            expect(result).toEqual([]);
        });
    });

    it("getCTInRange deve enviar parâmetros e header corretamente", async () => {

        mockGet.mockResolvedValue({ data: [] });

        const start = 1000;
        const end = 2000;

        await service.getCTInRange(start, end);

        expect(mockGet).toHaveBeenCalledWith(
            "/api/complementary-tasks/search/in-range",
            {
                ...expectedHeaders,
                params: { timeStart: start, timeEnd: end }
            }
        );
    });
});