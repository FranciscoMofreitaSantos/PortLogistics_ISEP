// src/features/scheduling/testes/OperationPlanUpdateModal.test.tsx
import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import OperationPlanUpdateModal from "../components/OperationPlanUpdateModal"; // ajusta se necessário
import { SchedulingService } from "../services/SchedulingService";

// ---------------------------
// Mantine (evitar portal/transitions nos testes)
// ---------------------------
vi.mock("@mantine/core", async () => {
    const actual: any = await vi.importActual("@mantine/core");
    return {
        ...actual,
        Modal: (props: any) => (
            <actual.Modal
                {...props}
                withinPortal={false}
                transitionProps={{ duration: 0 }}
                overlayProps={{ ...props.overlayProps, blur: 0 }}
            />
        ),
        Select: (props: any) => <actual.Select {...props} withinPortal={false} />,
        ScrollArea: (props: any) => <actual.ScrollArea {...props} type="never" />,
    };
});

import { MantineProvider } from "@mantine/core";

// ---------------------------
// JSDOM helpers (Mantine)
// ---------------------------
class RO {
    observe() {}
    unobserve() {}
    disconnect() {}
}
(globalThis as any).ResizeObserver = (globalThis as any).ResizeObserver || RO;

(globalThis as any).matchMedia =
    (globalThis as any).matchMedia ||
    ((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
    }));

// ---------------------------
// Mock Zustand store
// ---------------------------
vi.mock("../../../app/store", () => ({
    useAppStore: (selector: any) =>
        selector({
            user: { email: "jorge@example.com" },
        }),
}));

// ---------------------------
// Mock SchedulingService
// ---------------------------
vi.mock("../services/SchedulingService", () => ({
    SchedulingService: {
        updateOperationPlanForVvn: vi.fn(),
        updateOperationPlanBatch: vi.fn(),
    },
}));

type AnyPlan = any;

const makePlan = (): AnyPlan => ({
    domainId: "plan-1",
    planDate: "2025-12-31",
    author: "system",
    algorithm: "algo",
    total_delay: 0,
    status: "draft",
    operations: [
        {
            vvnId: "VVN-A",
            vessel: "Vessel A",
            dock: "Dock 1",
            startTime: 0,
            endTime: 5,
            loadingDuration: 1,
            unloadingDuration: 1,
            crane: "MCRAN-0001",
            staffAssignments: [{ staffMemberName: "Alice", intervalStart: "0", intervalEnd: "5" }],
            craneCountUsed: 1,
            totalCranesOnDock: 2,
            optimizedOperationDuration: 5,
            realArrivalTime: 0,
            realDepartureTime: 6,
            departureDelay: 1,
            theoreticalRequiredCranes: 1,
            resourceSuggestion: "ok",
        },
        {
            vvnId: "VVN-B",
            vessel: "Vessel B",
            dock: "Dock 2",
            startTime: 6,
            endTime: 10,
            loadingDuration: 1,
            unloadingDuration: 1,
            crane: "MCRAN-0002",
            staffAssignments: [{ staffMemberName: "Bob", intervalStart: "6", intervalEnd: "10" }],
            craneCountUsed: 1,
            totalCranesOnDock: 2,
            optimizedOperationDuration: 4,
            realArrivalTime: 6,
            realDepartureTime: 12,
            departureDelay: 2,
            theoreticalRequiredCranes: 1,
            resourceSuggestion: "ok",
        },
    ],
});

function renderModal(plan: AnyPlan | null, extra?: Partial<React.ComponentProps<typeof OperationPlanUpdateModal>>) {
    const props: React.ComponentProps<typeof OperationPlanUpdateModal> = {
        opened: true,
        onClose: vi.fn(),
        plan,
        defaultVvnId: "VVN-A",
        token: "token-123",
        onUpdated: vi.fn(),
        ...extra,
    };

    return render(
        <MantineProvider>
            <OperationPlanUpdateModal {...props} />
        </MantineProvider>
    );
}

function setReason(text: string) {
    const reason = screen.getByLabelText(/Motivo da alteração/i);
    fireEvent.change(reason, { target: { value: text } });
}

function getRowByVessel(vesselName: string) {
    const vesselCell = screen.getByText(vesselName);
    const row = vesselCell.closest("tr");
    expect(row).toBeTruthy();
    return row as HTMLTableRowElement;
}

/**
 * Na row editável, os textboxes tipicamente aparecem por ordem:
 * [startTime NumberInput, endTime NumberInput, crane TextInput, staff TextInput(disabled)]
 */
function editStartTimeForVessel(vesselName: string, newValue: string) {
    const row = getRowByVessel(vesselName);
    const tb = within(row).getAllByRole("textbox");
    const startInput = tb[0] as HTMLInputElement;

    fireEvent.change(startInput, { target: { value: newValue } });
    fireEvent.input(startInput, { target: { value: newValue } });
    fireEvent.blur(startInput);
}



describe("OperationPlanUpdateModal", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("mostra aviso quando não há plano selecionado", () => {
        renderModal(null);

        expect(screen.getByText("Sem plano selecionado")).toBeTruthy();
        expect(screen.getByText(/Selecione um plano/i)).toBeTruthy();
    });

    it("preenche autor a partir do store e mostra operações da VVN inicial", () => {
        const plan = makePlan();
        renderModal(plan);

        const author = screen.getByLabelText("Autor") as HTMLInputElement;
        expect(author.value).toBe("jorge@example.com");

        // defaultVvnId="VVN-A"
        expect(screen.getByText("Vessel A")).toBeTruthy();

        // VVN-B ainda não aparece (só aparece se ficar dirty e entrar como read-only)
        expect(screen.queryByText("Vessel B")).toBeNull();
    });

    it("ativa 'Guardar VVN atual' após edição + motivo e chama updateOperationPlanForVvn", async () => {
        (SchedulingService.updateOperationPlanForVvn as any).mockResolvedValue({
            plan: { ok: true },
            warnings: [],
        });

        const plan = makePlan();
        const onUpdated = vi.fn();
        renderModal(plan, { onUpdated });

        editStartTimeForVessel("Vessel A", "1");
        setReason("Ajuste");

        fireEvent.click(screen.getByText("Guardar VVN atual"));

        await waitFor(() => {
            expect(SchedulingService.updateOperationPlanForVvn).toHaveBeenCalledTimes(1);
        });

        const [payload, token] = (SchedulingService.updateOperationPlanForVvn as any).mock.calls[0];

        expect(token).toBe("token-123");
        expect(payload).toEqual(
            expect.objectContaining({
                planDomainId: "plan-1",
                vvnId: "VVN-A",
                reasonForChange: "Ajuste",
                author: "jorge@example.com",
                operations: expect.any(Array),
            })
        );

        expect(payload.operations[0].startTime).toBe(1);

        await waitFor(() => {
            expect(onUpdated).toHaveBeenCalledTimes(1);
            expect(screen.getByText("Sucesso")).toBeTruthy();
            expect(screen.getByText(/VVN atual guardada com sucesso/i)).toBeTruthy();
            expect(screen.getByText(/Alterações pendentes: 0/i)).toBeTruthy();
        });
    });
    

    it("reverte alterações da VVN atual com 'Repor VVN atual'", async () => {
        const plan = makePlan();
        renderModal(plan);

        editStartTimeForVessel("Vessel A", "3");
        expect(screen.getByText(/Alterações pendentes: 1/i)).toBeTruthy();

        fireEvent.click(screen.getByText("Repor VVN atual"));

        await waitFor(() => {
            expect(screen.getByText(/Alterações pendentes: 0/i)).toBeTruthy();
        });

        // startTime volta ao base (0)
        const row = getRowByVessel("Vessel A");
        const tb = within(row).getAllByRole("textbox");
        expect((tb[0] as HTMLInputElement).value).toBe("0");
    });

    it("deduplica códigos blocking na mensagem de erro", async () => {
        (SchedulingService.updateOperationPlanForVvn as any).mockRejectedValue({
            message: "Plano inválido: CRANE_CAPACITY_EXCEEDED, CRANE_OVERLAP, CRANE_CAPACITY_EXCEEDED",
        });

        const plan = makePlan();
        renderModal(plan);

        editStartTimeForVessel("Vessel A", "1");
        setReason("Ajuste");

        fireEvent.click(screen.getByText("Guardar VVN atual"));

        await waitFor(() => {
            expect(screen.getByText("Erro")).toBeTruthy();
        });

        expect(screen.getByText("Plano inválido: CRANE_CAPACITY_EXCEEDED, CRANE_OVERLAP")).toBeTruthy();
    });

    it("renderiza warnings devolvidos pela API", async () => {
        (SchedulingService.updateOperationPlanForVvn as any).mockResolvedValue({
            plan: { ok: true },
            warnings: [
                { code: "CRANE_OVERLAP", message: "Overlap entre gruas", severity: "warning" },
                { code: "CRANE_CAPACITY_EXCEEDED", message: "Capacidade excedida", severity: "blocking" },
            ],
        });

        const plan = makePlan();
        renderModal(plan);

        editStartTimeForVessel("Vessel A", "1");
        setReason("Ajuste");

        fireEvent.click(screen.getByText("Guardar VVN atual"));

        await waitFor(() => {
            expect(screen.getByText("Avisos de consistência")).toBeTruthy();
            expect(screen.getByText("CRANE_OVERLAP")).toBeTruthy();
            expect(screen.getByText("CRANE_CAPACITY_EXCEEDED")).toBeTruthy();
            expect(screen.getByText(/Overlap entre gruas/i)).toBeTruthy();
            expect(screen.getByText(/Capacidade excedida/i)).toBeTruthy();
        });
    });
});
