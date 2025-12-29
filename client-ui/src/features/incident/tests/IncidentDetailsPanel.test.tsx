import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import toast from "react-hot-toast";

import IncidentDetailsPanel from "../components/IncidentDetailsPanel";
import * as incidentService from "../services/incidentService";
import type { Incident } from "../domain/incident";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({ t: (k: string, _?: any) => k }),
}));

vi.mock("react-hot-toast", () => ({
    default: { error: vi.fn(), success: vi.fn() },
}));

vi.mock("../services/incidentService", () => ({
    resolveIncident: vi.fn(),
    deleteIncident: vi.fn(),
    updateListsVVEs: vi.fn(),
}));

const baseIncident: Incident = {
    code: "INC-1",
    incidentTypeCode: "T-1",
    vveList: ["VVE-1", "VVE-2"],
    startTime: new Date("2025-01-01T10:00:00.000Z").toISOString(),
    endTime: null,
    duration: null,
    severity: "Minor",
    impactMode: "Specific",
    description: "desc",
    createdByUser: "a@b.com",
    upcomingWindowStartTime: null,
    upcomingWindowEndTime: null,
};

describe("IncidentDetailsPanel", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(incidentService.resolveIncident).mockResolvedValue({
            ...baseIncident,
            endTime: new Date().toISOString(),
        } as any);
        vi.mocked(incidentService.updateListsVVEs).mockResolvedValue(baseIncident as any);
        vi.mocked(incidentService.deleteIncident).mockResolvedValue(undefined as any);
    });

    it("não renderiza se selected for null", () => {
        render(
            <IncidentDetailsPanel
                selected={null}
                onChanged={vi.fn()}
                onDeleted={vi.fn()}
                onClose={vi.fn()}
            />
        );
        expect(screen.queryByText("incident.details.title")).toBeNull();
    });

    it("renderiza detalhes básicos quando selected existe", () => {
        render(
            <IncidentDetailsPanel
                selected={baseIncident}
                onChanged={vi.fn()}
                onDeleted={vi.fn()}
                onClose={vi.fn()}
            />
        );

        expect(screen.getByText("incident.details.title")).toBeTruthy();
        expect(screen.getByText(baseIncident.code)).toBeTruthy();
        expect(screen.getByText(baseIncident.incidentTypeCode)).toBeTruthy();
        expect(screen.getByText("incident.fields.vves")).toBeTruthy();
        expect(screen.getByText("VVE-1")).toBeTruthy();
        expect(screen.getByText("VVE-2")).toBeTruthy();
    });

    it("clicar Resolve chama resolveIncident e onChanged, e mostra toast success", async () => {
        const onChanged = vi.fn();

        render(
            <IncidentDetailsPanel
                selected={baseIncident}
                onChanged={onChanged}
                onDeleted={vi.fn()}
                onClose={vi.fn()}
            />
        );

        fireEvent.click(screen.getByText("incident.actions.resolve"));

        await waitFor(() => {
            expect(incidentService.resolveIncident).toHaveBeenCalledWith("INC-1");
            expect(toast.success).toHaveBeenCalledWith("incident.success.resolved");
            expect(onChanged).toHaveBeenCalled();
        });
    });

    it("erro no resolve mostra toast.error", async () => {
        vi.mocked(incidentService.resolveIncident).mockRejectedValue(new Error("Resolve fail"));

        render(
            <IncidentDetailsPanel
                selected={baseIncident}
                onChanged={vi.fn()}
                onDeleted={vi.fn()}
                onClose={vi.fn()}
            />
        );

        fireEvent.click(screen.getByText("incident.actions.resolve"));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Resolve fail");
        });
    });

    it("Update Lists só aparece quando impactMode != Specific e !resolved", () => {
        const notSpecific: Incident = { ...baseIncident, impactMode: "AllOnGoing" };

        render(
            <IncidentDetailsPanel
                selected={notSpecific}
                onChanged={vi.fn()}
                onDeleted={vi.fn()}
                onClose={vi.fn()}
            />
        );

        expect(screen.getByText("actions.atualizar")).toBeTruthy();
    });

    it("clicar Atualizar chama updateListsVVEs e onChanged", async () => {
        const onChanged = vi.fn();
        const notSpecific: Incident = { ...baseIncident, impactMode: "Upcoming" };

        render(
            <IncidentDetailsPanel
                selected={notSpecific}
                onChanged={onChanged}
                onDeleted={vi.fn()}
                onClose={vi.fn()}
            />
        );

        fireEvent.click(screen.getByText("actions.atualizar"));

        await waitFor(() => {
            expect(incidentService.updateListsVVEs).toHaveBeenCalledWith("INC-1");
            expect(toast.success).toHaveBeenCalledWith("incident.success.updatedList");
            expect(onChanged).toHaveBeenCalled();
        });
    });

    it("Delete: se confirm for false, não chama deleteIncident", async () => {
        vi.spyOn(window, "confirm").mockReturnValue(false);

        render(
            <IncidentDetailsPanel
                selected={baseIncident}
                onChanged={vi.fn()}
                onDeleted={vi.fn()}
                onClose={vi.fn()}
            />
        );

        fireEvent.click(screen.getByText("actions.delete"));

        expect(incidentService.deleteIncident).not.toHaveBeenCalled();
    });

    it("Delete: se confirm for true, chama deleteIncident e onDeleted", async () => {
        vi.spyOn(window, "confirm").mockReturnValue(true);
        const onDeleted = vi.fn();

        render(
            <IncidentDetailsPanel
                selected={baseIncident}
                onChanged={vi.fn()}
                onDeleted={onDeleted}
                onClose={vi.fn()}
            />
        );

        fireEvent.click(screen.getByText("actions.delete"));

        await waitFor(() => {
            expect(incidentService.deleteIncident).toHaveBeenCalledWith("INC-1");
            expect(toast.success).toHaveBeenCalledWith("incident.success.deleted");
            expect(onDeleted).toHaveBeenCalledWith("INC-1");
        });
    });
});
