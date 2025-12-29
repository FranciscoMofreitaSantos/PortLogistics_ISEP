import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import toast from "react-hot-toast";

import IncidentUpsertModal from "../components/IncidentUpsertModal";
import * as incidentService from "../services/incidentService";
import * as incidentTypeService from "../../incidentTypes/services/incidentTypeService";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({ t: (k: string) => k }),
}));

vi.mock("react-hot-toast", () => ({
    default: { error: vi.fn(), success: vi.fn() },
}));

vi.mock("../services/incidentService", () => ({
    createIncident: vi.fn(),
    updateIncident: vi.fn(),
    getAllVVEs: vi.fn(),
}));

vi.mock("../../incidentTypes/services/incidentTypeService", () => ({
    getAllIncidentTypes: vi.fn(),
}));

// Mock do store
vi.mock("../../../app/store", () => ({
    useAppStore: {
        getState: () => ({ user: { email: "sar@test.com" } }),
    },
}));

const incidentTypes = [
    { code: "IT-1", name: "Type 1" },
    { code: "IT-2", name: "Type 2" },
] as any[];

describe("IncidentUpsertModal", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        vi.mocked(incidentService.getAllVVEs).mockResolvedValue(["VVE-1", "VVE-2"]);
        vi.mocked(incidentTypeService.getAllIncidentTypes).mockResolvedValue(incidentTypes);

        vi.mocked(incidentService.createIncident).mockResolvedValue({
            code: "INC-X",
            incidentTypeCode: "IT-1",
            vveList: ["VVE-1"],
            startTime: new Date().toISOString(),
            endTime: null,
            duration: null,
            severity: "Minor",
            impactMode: "Specific",
            description: "desc",
            createdByUser: "sar@test.com",
            upcomingWindowStartTime: null,
            upcomingWindowEndTime: null,
        } as any);

        vi.mocked(incidentService.updateIncident).mockResolvedValue({
            code: "INC-1",
            incidentTypeCode: "IT-2",
            vveList: [],
            startTime: new Date().toISOString(),
            endTime: null,
            duration: null,
            severity: "Major",
            impactMode: "AllOnGoing",
            description: "updated",
            createdByUser: "sar@test.com",
            upcomingWindowStartTime: null,
            upcomingWindowEndTime: null,
        } as any);
    });

    it("não renderiza se isOpen for false", () => {
        render(
            <IncidentUpsertModal
                isOpen={false}
                mode="create"
                onClose={vi.fn()}
                onSaved={vi.fn()}
            />
        );
        expect(screen.queryByText("incident.modal.createTitle")).toBeNull();
    });

    it("no modo create: carrega VVEs e IncidentTypes ao abrir", async () => {
        render(
            <IncidentUpsertModal
                isOpen={true}
                mode="create"
                onClose={vi.fn()}
                onSaved={vi.fn()}
            />
        );

        await waitFor(() => {
            expect(incidentService.getAllVVEs).toHaveBeenCalled();
            expect(incidentTypeService.getAllIncidentTypes).toHaveBeenCalled();
        });
    });

    it("create: valida obrigatórios e impede submit", async () => {
        render(
            <IncidentUpsertModal
                isOpen={true}
                mode="create"
                onClose={vi.fn()}
                onSaved={vi.fn()}
            />
        );

        // Clicar create sem preencher
        fireEvent.click(screen.getByText("actions.create"));

        await waitFor(() => {
            // primeiro erro que dispara no validate é codeRequired
            expect(toast.error).toHaveBeenCalledWith("incident.errors.codeRequired");
            expect(incidentService.createIncident).not.toHaveBeenCalled();
        });
    });

    it("create: submete com sucesso (Specific + VVE selecionada + incident type selecionado)", async () => {
        const onSaved = vi.fn();
        const onClose = vi.fn();

        render(
            <IncidentUpsertModal
                isOpen={true}
                mode="create"
                onClose={onClose}
                onSaved={onSaved}
            />
        );

        // code
        fireEvent.change(screen.getByPlaceholderText("Ex: INC-2025-00001"), {
            target: { value: "INC-X" },
        });

        // description
        fireEvent.change(screen.getByPlaceholderText("incident.form.descriptionPH"), {
            target: { value: "desc" },
        });

        // selecionar incident type (clicar item IT-1 na lista)
        await screen.findByText("IT-1");
        fireEvent.click(screen.getByText("IT-1"));

        // VVE: garantir que está em Specific (default) e selecionar VVE-1
        await screen.findByText("VVE-1");
        fireEvent.click(screen.getByText("VVE-1"));

        fireEvent.click(screen.getByText("actions.create"));

        await waitFor(() => {
            expect(incidentService.createIncident).toHaveBeenCalled();
            expect(toast.success).toHaveBeenCalledWith("incident.success.created");
            expect(onSaved).toHaveBeenCalled();
            expect(onClose).toHaveBeenCalled();
        });
    });

    it("edit: preenche a partir do resource e chama updateIncident", async () => {
        const onSaved = vi.fn();
        const onClose = vi.fn();

        const resource = {
            code: "INC-1",
            incidentTypeCode: "IT-1",
            vveList: [],
            startTime: new Date("2025-01-01T10:00:00.000Z").toISOString(),
            endTime: null,
            duration: null,
            severity: "Major",
            impactMode: "AllOnGoing",
            description: "old",
            createdByUser: "sar@test.com",
            upcomingWindowStartTime: null,
            upcomingWindowEndTime: null,
        } as any;

        render(
            <IncidentUpsertModal
                isOpen={true}
                mode="edit"
                resource={resource}
                onClose={onClose}
                onSaved={onSaved}
            />
        );

        // No edit, o code input está disabled com valor do resource
        expect(screen.getByDisplayValue("INC-1")).toBeTruthy();

        // mudar description
        fireEvent.change(screen.getByPlaceholderText("incident.form.descriptionPH"), {
            target: { value: "updated" },
        });

        fireEvent.click(screen.getByText("actions.save"));

        await waitFor(() => {
            expect(incidentService.updateIncident).toHaveBeenCalledWith(
                "INC-1",
                expect.objectContaining({
                    description: "updated",
                })
            );
            expect(toast.success).toHaveBeenCalledWith("incident.success.updated");
            expect(onSaved).toHaveBeenCalled();
            expect(onClose).toHaveBeenCalled();
        });
    });
});
