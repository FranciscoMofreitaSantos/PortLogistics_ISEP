import { vi } from "vitest";
import { Response } from "express";

const loggerMock = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
};

const repoMock = {
    save: vi.fn(),
    findAll: vi.fn(),
    exists: vi.fn(),
    findById: vi.fn(),

    getPlans: vi.fn(),
    findByVesselAndDate: vi.fn(),
    search: vi.fn(),
};

const mapperMock = {
    toDTO: vi.fn(),
    toDomain: vi.fn(),
    toPersistence: vi.fn(),
};

const mockRes = () => {
    const res: Partial<Response> = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    res.send = vi.fn().mockReturnValue(res);
    return res as Response;
};

export function createOpTestContext(ServiceClass: any, ControllerClass: any) {
    vi.clearAllMocks();

    const service = new ServiceClass(
        repoMock,
        loggerMock,
        mapperMock
    );

    const controller = new ControllerClass(
        service
    );

    return {
        repoMock,
        mapperMock,
        loggerMock,
        service,
        controller,
        mockRes,
    };
}