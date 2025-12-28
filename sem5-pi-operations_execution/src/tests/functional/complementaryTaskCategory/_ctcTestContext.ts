import { vi } from "vitest";
import ComplementaryTaskCategoryService from "../../../services/complementaryTaskCategoryService";
import ComplementaryTaskCategoryMap from "../../../mappers/ComplementaryTaskCategoryMap";

export function createCtcTestContext(
    ServiceClass = ComplementaryTaskCategoryService,
    ControllerClass: any
) {

    const repoMock = {
        save: vi.fn(),
        findByCode: vi.fn(),
        findById: vi.fn(),
        findByName: vi.fn(),
        findByDescription: vi.fn(),
        findByCategory: vi.fn(),
        findAll: vi.fn(),
        getTotalCategories: vi.fn()
    };

    const mapperMock = {
        toDTO: vi.fn()
    };

    const loggerMock = {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn()
    };

    const service = new ServiceClass(
        repoMock as any,
        mapperMock as unknown as ComplementaryTaskCategoryMap,
        loggerMock as any
    );

    const controller = new ControllerClass(
        service as any,
        loggerMock as any
    );

    const mockReq = (data: any = {}) => ({
        params: {},
        query: {},
        body: {},
        ...data
    });

    const mockRes = () => ({
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
    });

    return {
        repoMock,
        mapperMock,
        loggerMock,
        service,
        controller,
        mockReq,
        mockRes
    };
}