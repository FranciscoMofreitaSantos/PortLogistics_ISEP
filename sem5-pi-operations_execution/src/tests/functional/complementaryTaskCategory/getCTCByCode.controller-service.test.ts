import { describe, it, expect } from "vitest";
import { createCtcTestContext } from "./_ctcTestContext";
import ComplementaryTaskCategoryService from "../../../services/complementaryTaskCategoryService";
import GetCTCByCodeController from "../../../controllers/complementaryTaskCategory/getCTCByCodeController";

describe("CTC | Get By Code | Controller + Service", () => {

    const {
        repoMock,
        mapperMock,
        controller,
        mockRes
    } =
        createCtcTestContext(
            ComplementaryTaskCategoryService,
            GetCTCByCodeController
        );

    it("should return category by code", async () => {

        const domain = { code: "CTC001" };

        repoMock.findByCode.mockResolvedValue(domain);
        mapperMock.toDTO.mockReturnValue({ code: "CTC001" });

        const req = { params: { code: "CTC001" } };
        const res = mockRes();

        controller.req = req as any;
        controller.res = res as any;

        await controller["executeImpl"]();

        expect(repoMock.findByCode).toHaveBeenCalledWith("CTC001");
        expect(res.status).toHaveBeenCalledWith(200);
    });
});