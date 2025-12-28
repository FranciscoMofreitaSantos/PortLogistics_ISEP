import { describe, it, expect } from "vitest";
import { createCtcTestContext } from "./_ctcTestContext";

import ComplementaryTaskCategoryService from "../../../services/complementaryTaskCategoryService";
import GetCTCByNameController
    from "../../../controllers/complementaryTaskCategory/getCTCByNameController";

describe("CTC | Get By Name | Controller + Service", () => {

    const {
        repoMock,
        mapperMock,
        controller,
        mockRes
    } =
        createCtcTestContext(
            ComplementaryTaskCategoryService,
            GetCTCByNameController
        );

    it("should return categories by name", async () => {

        const domainCats = [{ code: "CTC001" }];
        const dtoCats = [{ code: "CTC001" }];

        repoMock.findByName.mockResolvedValue(domainCats);
        mapperMock.toDTO.mockReturnValue(dtoCats[0]);

        const req = { query: { name: "Logistics" } };
        const res = mockRes();

        controller.req = req as any;
        controller.res = res as any;

        await controller["executeImpl"]();

        expect(repoMock.findByName).toHaveBeenCalledWith("Logistics");
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(dtoCats);
    });
});