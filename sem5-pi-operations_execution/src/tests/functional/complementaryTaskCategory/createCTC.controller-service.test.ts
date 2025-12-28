import { describe, it, expect } from "vitest";
import { createCtcTestContext } from "./_ctcTestContext";
import ComplementaryTaskCategoryService from "../../../services/complementaryTaskCategoryService";
import CreateComplementaryTaskCategoryController from "../../../controllers/complementaryTaskCategory/createComplementaryTaskCategoryController";

describe("CTC | Create | Controller + Service", () => {

    const {
        repoMock,
        mapperMock,
        controller,
        mockRes
    } =
        createCtcTestContext(
            ComplementaryTaskCategoryService,
            CreateComplementaryTaskCategoryController
        );

    it("should create a new category", async () => {

        const dto = {
            code: "CTC001",
            name: "Maintenance",
            description: "Engine maintenance",
            category: "Maintenance"
        };

        const domain = { code: "CTC001" };

        repoMock.findByCode.mockResolvedValue(null);
        repoMock.save.mockResolvedValue(domain);
        mapperMock.toDTO.mockReturnValue(dto);

        const req = { body: dto };
        const res = mockRes();

        controller.req = req as any;
        controller.res = res as any;

        await controller["executeImpl"]();

        expect(repoMock.findByCode).toHaveBeenCalledWith("CTC001");
        expect(repoMock.save).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(dto);
    });

    it("should return 400 when category already exists", async () => {

        repoMock.findByCode.mockResolvedValue({});

        const req = { body: { code: "CTC001" } };
        const res = mockRes();

        controller.req = req as any;
        controller.res = res as any;

        await controller["executeImpl"]();

        expect(res.status).toHaveBeenCalledWith(400);
    });
});