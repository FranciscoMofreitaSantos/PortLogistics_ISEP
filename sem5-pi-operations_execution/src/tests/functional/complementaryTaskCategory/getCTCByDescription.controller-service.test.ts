import { describe, it, expect } from "vitest";
import { createCtcTestContext } from "./_ctcTestContext";

import ComplementaryTaskCategoryService from "../../../services/complementaryTaskCategoryService";
import GetCTCByDescriptionController
    from "../../../controllers/complementaryTaskCategory/getCTCByDescriptionController";

describe("CTC | Get By Description | Controller + Service", () => {

    const {
        repoMock,
        mapperMock,
        controller,
        mockRes
    } =
        createCtcTestContext(
            ComplementaryTaskCategoryService,
            GetCTCByDescriptionController
        );

    it("should return categories by description", async () => {

        const domainCats = [{ code: "CTC001" }];
        const dtoCats = [{ code: "CTC001" }];

        repoMock.findByDescription.mockResolvedValue(domainCats);
        mapperMock.toDTO.mockReturnValue(dtoCats[0]);

        const req = { query: { description: "Cleaning" } };
        const res = mockRes();

        controller.req = req as any;
        controller.res = res as any;

        await controller["executeImpl"]();

        expect(repoMock.findByDescription).toHaveBeenCalledWith("Cleaning");
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(dtoCats);
    });
});