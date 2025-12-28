import { describe, it, expect } from "vitest";
import { createCtcTestContext } from "./_ctcTestContext";
import ComplementaryTaskCategoryService from "../../../services/complementaryTaskCategoryService";
import DeactivateComplementaryTaskCategoryController from "../../../controllers/complementaryTaskCategory/deactivateComplementaryTaskCategoryController";

describe("CTC | Deactivate | Controller + Service", () => {

    const {
        repoMock,
        mapperMock,
        controller,
        mockRes
    } =
        createCtcTestContext(
            ComplementaryTaskCategoryService,
            DeactivateComplementaryTaskCategoryController
        );

    it("should deactivate a category", async () => {

        const domain = {
            code: "CTC001",
            deactivate: () => {}
        };

        repoMock.findByCode.mockResolvedValue(domain);
        repoMock.save.mockResolvedValue(domain);
        mapperMock.toDTO.mockReturnValue({ code: "CTC001", isActive: false });

        const req = { params: { code: "CTC001" } };
        const res = mockRes();

        controller.req = req as any;
        controller.res = res as any;

        await controller["executeImpl"]();

        expect(repoMock.findByCode).toHaveBeenCalledWith("CTC001");
        expect(repoMock.save).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
    });
});