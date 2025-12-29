import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import IncidentTable from "../components/IncidentTable";
import type { Incident } from "../domain/incident";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({ t: (k: string) => k }),
}));

const makeIncident = (code: string, overrides: Partial<Incident> = {}): Incident => ({
    code,
    incidentTypeCode: "T-1",
    vveList: [],
    startTime: new Date("2025-01-01T10:00:00.000Z").toISOString(),
    endTime: null,
    duration: null,
    severity: "Minor",
    impactMode: "Specific",
    description: "",
    createdByUser: "u@x.com",
    upcomingWindowStartTime: null,
    upcomingWindowEndTime: null,
    ...overrides,
});

describe("IncidentTable", () => {
    it("mostra 'noData' quando items está vazio", () => {
        render(
            <IncidentTable items={[]} selectedCode={null} onSelect={vi.fn()} onEdit={vi.fn()} />
        );
        expect(screen.getByText("incident.noData")).toBeTruthy();
    });

    it("clicar numa row chama onSelect", () => {
        const onSelect = vi.fn();
        const items = [makeIncident("INC-1")];

        render(
            <IncidentTable items={items} selectedCode={null} onSelect={onSelect} onEdit={vi.fn()} />
        );

        fireEvent.click(screen.getByText("INC-1"));
        expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ code: "INC-1" }));
    });

    it("botão edit aparece apenas quando incidente está ativo (endTime null)", () => {
        const active = makeIncident("INC-A", { endTime: null });
        const resolved = makeIncident("INC-R", { endTime: new Date().toISOString() });

        const onEdit = vi.fn();
        render(
            <IncidentTable items={[active, resolved]} selectedCode={null} onSelect={vi.fn()} onEdit={onEdit} />
        );

        expect(screen.getByText("actions.edit")).toBeTruthy();
        // Para o resolved não há segundo botão edit
        expect(screen.getAllByText("actions.edit")).toHaveLength(1);
    });

    it("clicar em Edit não dispara onSelect (stopPropagation) e chama onEdit", () => {
        const onSelect = vi.fn();
        const onEdit = vi.fn();
        const items = [makeIncident("INC-1")];

        render(
            <IncidentTable items={items} selectedCode={null} onSelect={onSelect} onEdit={onEdit} />
        );

        fireEvent.click(screen.getByText("actions.edit"));

        expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ code: "INC-1" }));
        expect(onSelect).not.toHaveBeenCalled();
    });
});
