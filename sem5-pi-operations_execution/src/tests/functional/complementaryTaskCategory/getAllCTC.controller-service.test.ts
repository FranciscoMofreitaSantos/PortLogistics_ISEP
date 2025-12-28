import { describe, it, expect } from "vitest";
import { createCtcTestContext } from "./_ctcTestContext";

import ComplementaryTaskCategoryService from "../../../services/complementaryTaskCategoryService";
import GetAllComplementaryTaskCategoryController
    from "../../../controllers/complementaryTaskCategory/getAllComplementaryTaskCategoryController";

describe("CTC | Get All | Controller + Service", () => {

    const {
        repoMock,
        mapperMock,
        controller,
        mockRes
    } =
        createCtcTestContext(
            ComplementaryTaskCategoryService,
            GetAllComplementaryTaskCategoryController
        );

    it("should return all categories", async () => {

        const domainCats = [{ code: "CTC001" }];
        const dtoCats = [{ code: "CTC001" }];

        repoMock.findAll.mockResolvedValue(domainCats);
        mapperMock.toDTO.mockReturnValue(dtoCats[0]);

        const req = {};
        const res = mockRes();

        controller.req = req as any;
        controller.res = res as any;

        await controller["executeImpl"]();

        expect(repoMock.findAll).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(dtoCats);
    });
});