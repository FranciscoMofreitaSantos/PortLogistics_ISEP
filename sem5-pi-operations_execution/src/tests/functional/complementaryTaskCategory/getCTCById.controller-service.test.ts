import { describe, it, expect } from "vitest";
import { createCtcTestContext } from "./_ctcTestContext";

import ComplementaryTaskCategoryService from "../../../services/complementaryTaskCategoryService";
import GetCTCByIdController
    from "../../../controllers/complementaryTaskCategory/getCTCByIdController";

describe("CTC | Get By ID | Controller + Service", () => {

    const {
        repoMock,
        mapperMock,
        controller,
        mockRes
    } =
        createCtcTestContext(
            ComplementaryTaskCategoryService,
            GetCTCByIdController
        );

    it("should return category by id", async () => {

        const domain = { code: "CTC001" };
        const dto = { code: "CTC001" };

        repoMock.findById.mockResolvedValue(domain);
        mapperMock.toDTO.mockReturnValue(dto);

        const req = { params: { id: "abc-123" } };
        const res = mockRes();

        controller.req = req as any;
        controller.res = res as any;

        await controller["executeImpl"]();

        expect(repoMock.findById).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(dto);
    });

    it("should return 400 when id missing", async () => {

        const req = { params: {} };
        const res = mockRes();

        controller.req = req as any;
        controller.res = res as any;

        await controller["executeImpl"]();

        expect(res.status).toHaveBeenCalledWith(400);
    });
});