import { describe, it, beforeEach, expect, vi } from "vitest";
import GetVVEByImoController from "../../../../controllers/vve/getVVEByImoController"; // Ajusta o caminho
import { BusinessRuleValidationError } from "../../../../core/logic/BusinessRuleValidationError";
import { mockRes } from "../../../helpers/mockHttp";

// Mock do Serviço e Logger
const mockService = {
    getByImoAsync: vi.fn()
};
const mockLogger = {
    error: vi.fn()
};

let req: any;
let res: any;
let controller: any;

beforeEach(() => {
    vi.clearAllMocks();

    req = {
        params: { imo: "IMO9999999" }
    };
    res = mockRes();

    controller = new GetVVEByImoController(
        mockService as any,
        mockLogger as any
    );
});

describe("GetVVEByImoController", () => {

    it("returns 200 and the result on success", async () => {
        // Arrange
        const mockResult = [
            { id: "vve-1", imo: "IMO9999999" },
            { id: "vve-2", imo: "IMO9999999" }
        ];

        mockService.getByImoAsync.mockResolvedValue({
            getValue: () => mockResult
        });

        // Act
        await controller.execute(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockResult);
        expect(mockService.getByImoAsync).toHaveBeenCalledWith("IMO9999999");
    });

    it("returns 400 if 'imo' parameter is missing", async () => {
        // Arrange
        req.params.imo = undefined;

        // Act
        await controller.execute(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: "VVE imo is required"
        }));
        expect(mockService.getByImoAsync).not.toHaveBeenCalled();
    });

    it("returns 400 on BusinessRuleValidationError", async () => {
        // Arrange
        const errorMessage = "Invalid IMO format";

        // Simula erro de validação vindo do serviço
        mockService.getByImoAsync.mockRejectedValue(
            new BusinessRuleValidationError(errorMessage)
        );

        // Act
        await controller.execute(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: errorMessage
        }));
    });

    it("returns 500 on unexpected error and logs it", async () => {
        // Arrange
        const error = new Error("Database unaccessible");
        mockService.getByImoAsync.mockRejectedValue(error);

        // Act
        await controller.execute(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: "Internal server error"
        }));

        // Verifica se o erro foi registado no logger
        expect(mockLogger.error).toHaveBeenCalledWith(
            "Unexpected error fetching VVE by imo",
            { e: error }
        );
    });
});