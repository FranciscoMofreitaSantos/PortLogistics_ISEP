import { describe, it, expect } from "vitest";
import { createCtcTestContext } from "./_ctcTestContext";
import ComplementaryTaskCategoryService from "../../../services/complementaryTaskCategoryService";
import ActivateComplementaryTaskCategoryController from "../../../controllers/complementaryTaskCategory/activateComplementaryTaskCategoryController";

describe("CTC | Activate | Controller + Service", () => {

    const {
        repoMock,
        mapperMock,
        controller,
        mockRes
    } =
        createCtcTestContext(
            ComplementaryTaskCategoryService,
            ActivateComplementaryTaskCategoryController
        );

    it("should activate a category", async () => {

        const domain = {
            code: "CTC001",
            activate: () => {}
        };

        repoMock.findByCode.mockResolvedValue(domain);
        repoMock.save.mockResolvedValue(domain);
        mapperMock.toDTO.mockReturnValue({ code: "CTC001", isActive: true });

        const req = { params: { code: "CTC001" } };
        const res = mockRes();

        controller.req = req as any;
        controller.res = res as any;

        await controller["executeImpl"]();

        expect(repoMock.findByCode).toHaveBeenCalledWith("CTC001");
        expect(repoMock.save).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should return 400 if category does not exist", async () => {

        repoMock.findByCode.mockResolvedValue(null);

        const req = { params: { code: "CTC999" } };
        const res = mockRes();

        controller.req = req as any;
        controller.res = res as any;

        await controller["executeImpl"]();

        expect(res.status).toHaveBeenCalledWith(400);
    });
});