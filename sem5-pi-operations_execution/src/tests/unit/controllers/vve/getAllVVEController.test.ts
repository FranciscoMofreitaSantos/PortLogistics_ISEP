import { describe, it, beforeEach, expect, vi } from "vitest";
import GetAllVVEController from "../../../../controllers/vve/getAllVVEController";

import { mockRes } from "../../../helpers/mockHttp";

// Mock do Serviço
const mockService = {
    getAllAsync: vi.fn()
};

let req: any;
let res: any;
let controller: any;

beforeEach(() => {
    vi.clearAllMocks();

    req = {};
    res = mockRes();

    controller = new GetAllVVEController(
        mockService as any
    );
});

describe("GetAllVVEController", () => {

    it("returns 200 and a list of VVEs on success", async () => {
        // Arrange
        const mockList = [
            { id: "vve-1", status: "IN_PORT" },
            { id: "vve-2", status: "DEPARTED" }
        ];

        mockService.getAllAsync.mockResolvedValue({
            getValue: () => mockList
        });

        // Act
        await controller.execute(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockList);
    });

    it("returns 500 when service throws an error", async () => {
        // Arrange
        mockService.getAllAsync.mockRejectedValue(new Error("Database connection failed"));

        // Act
        await controller.execute(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(500);

        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: "Erro ao listar VVEs"
        }));
    });
});