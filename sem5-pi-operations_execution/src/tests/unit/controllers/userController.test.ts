import { describe, it, beforeEach, expect, vi } from "vitest";

import UserController from "../../../controllers/userController";
import { mockRes } from "../../helpers/mockHttp";

const mockService = {
    getUser: vi.fn(),
    createUser: vi.fn(),
    updateUser: vi.fn()
};

const mockLogger = {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
};

let req: any;
let res: any;
let controller: UserController;

beforeEach(() => {
    vi.clearAllMocks();

    req = { body: {} };
    res = mockRes();

    controller = new UserController(
        mockService as any,
        mockLogger as any
    );
});

describe("UserController.executeImpl (sync user)", () => {

    it("creates user when user does not exist", async () => {

        req.body = { email: "john@test.com" };

        mockService.getUser.mockResolvedValue({ isSuccess: false });
        mockService.createUser.mockResolvedValue({
            isFailure: false,
            getValue: () => ({ email: "john@test.com" })
        });

        await controller.execute(req, res);

        expect(mockService.createUser).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it("updates user when user already exists", async () => {

        req.body = { email: "john@test.com" };

        mockService.getUser.mockResolvedValue({ isSuccess: true });
        mockService.updateUser.mockResolvedValue({
            isFailure: false,
            getValue: () => ({ email: "john@test.com" })
        });

        await controller.execute(req, res);

        expect(mockService.updateUser).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it("returns 400 when service returns failure result", async () => {

        req.body = { email: "john@test.com" };

        mockService.getUser.mockResolvedValue({ isSuccess: true });
        mockService.updateUser.mockResolvedValue({
            isFailure: true,
            errorValue: () => "Validation error"
        });

        await controller.execute(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it("returns 500 on unexpected exception", async () => {

        req.body = { email: "john@test.com" };

        mockService.getUser.mockRejectedValue(new Error("DB crash"));

        await controller.execute(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});