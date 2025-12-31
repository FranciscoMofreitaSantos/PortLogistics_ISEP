// cypress/e2e/operationPlansHistory.cy.ts
/// <reference types="cypress" />

describe("Operation Plans – History (E2E)", () => {
    const HISTORY_PATH = "/operationLog";

    const historyPlans = [
        {
            domainId: "plan-1",
            planDate: "2025-12-30T00:00:00.000Z",
            algorithm: "greedy",
            author: "planner@test.com",
            status: "ok",
            total_delay: 3,
            operations: [
                {
                    vvnId: "VVN-A",
                    vessel: "Atlantic Trader",
                    dock: "Dock 1",
                    startTime: 0,
                    endTime: 5,
                    realArrivalTime: 0,
                    realDepartureTime: 6,
                    departureDelay: 1,
                    crane: "MCRAN-0001",
                    staffAssignments: [{ staffMemberName: "Alice" }],
                },
            ],
        },
        {
            domainId: "plan-2",
            planDate: "2025-12-29T00:00:00.000Z",
            algorithm: "smart",
            author: "system@test.com",
            status: "warning",
            total_delay: 0,
            operations: [
                {
                    vvnId: "VVN-C",
                    vessel: "Baltic Star",
                    dock: "Dock 3",
                    startTime: 1,
                    endTime: 4,
                    realArrivalTime: 1,
                    realDepartureTime: 4,
                    departureDelay: 0,
                    crane: "MCRAN-0003",
                    staffAssignments: [{ staffMemberName: "Chris" }],
                },
            ],
        },
    ];

    function seedAuth(win: Window) {
        // Opcional, mas ajuda a garantir autor != "Unknown" se a app ler do localStorage.
        const payload = JSON.stringify({
            state: {
                user: { email: "e2e@test.com" },
                token: "FAKE_TOKEN",
            },
            version: 0,
        });

        // tenta várias keys comuns (não quebra nada se não forem usadas)
        win.localStorage.setItem("app-store", payload);
        win.localStorage.setItem("appStore", payload);
        win.localStorage.setItem("useAppStore", payload);
        win.localStorage.setItem("zustand", payload);
    }

    beforeEach(() => {
        // Privacy Policy (a tua app chama isto no layout)
        cy.intercept("GET", "**/api/PrivacyPolicy/currentPrivacyPolicy", {
            statusCode: 200,
            body: { id: "pp1", title: "PP", content: "x", version: "1.0" },
        }).as("getPrivacyPolicy");

        // GET histórico: SchedulingService.getHistoryPlans -> /api/operation-plans?...
        cy.intercept("GET", /\/api\/operation-plans(\?.*)?$/i, (req) => {
            const u = new URL(req.url);

            const vessel = (u.searchParams.get("vessel") || "").toLowerCase().trim();
            const startDate = u.searchParams.get("startDate");
            const endDate = u.searchParams.get("endDate");

            let out = [...historyPlans];

            if (vessel) {
                out = out.filter((p) =>
                    (p.operations || []).some((op: any) =>
                        String(op.vessel || "").toLowerCase().includes(vessel)
                    )
                );
            }

            if (startDate) {
                const startTs = new Date(startDate).getTime();
                out = out.filter((p) => new Date(p.planDate).getTime() >= startTs);
            }

            if (endDate) {
                const endTs = new Date(endDate).getTime();
                out = out.filter((p) => new Date(p.planDate).getTime() <= endTs);
            }

            req.reply({ statusCode: 200, body: out });
        }).as("getHistory");

        // PATCH /vvn
        cy.intercept("PATCH", /\/api\/operation-plans\/vvn$/i, (req) => {
            req.reply({ statusCode: 200, body: { warnings: [] } });
        }).as("patchVvn");

        // PATCH /batch
        cy.intercept("PATCH", /\/api\/operation-plans\/batch$/i, (req) => {
            req.reply({ statusCode: 200, body: { warnings: [] } });
        }).as("patchBatch");

        cy.visit(HISTORY_PATH, {
            onBeforeLoad(win) {
                seedAuth(win);
            },
        });

        cy.wait("@getHistory", { timeout: 20000 });
    });

    it("abre página e mostra tabela com planos", () => {
        cy.contains(/Histórico de Planos/i).should("exist");

        cy.get("table").should("exist");
        cy.contains("table", "greedy").should("exist");
        cy.contains("table", "smart").should("exist");

        cy.contains("button", "Editar").should("exist");
    });

    it("abre detalhes ao clicar numa linha (collapse) e mostra operações", () => {
        cy.contains("table tbody tr", "greedy").click({ force: true });

        cy.contains(/Execução Real Estimada/i).should("exist");
        cy.contains("VVN-A").should("exist");
        cy.contains("Atlantic Trader").should("exist");
    });
    

    it("abre modal Editar, altera e guarda VVN atual (PATCH /vvn)", () => {
        cy.contains("table tbody tr", "greedy").within(() => {
            cy.contains("button", "Editar").click({ force: true });
        });

        // Modal Mantine com classNames custom
        cy.get(".opUpdateModal__content").should("be.visible");
        cy.contains(/Atualizar Operation Plan/i).should("exist");

        // motivo obrigatório
        cy.get("textarea[placeholder^='Ex: Ajuste']").type(
            "Ajuste de planeamento para remover conflito"
        );

        // força dirty: muda startTime (1º NumberInput)
        cy.get(".opUpdateModal__numberInput input").first().clear().type("2");

        cy.contains("button", /Guardar VVN atual/i).click();
        cy.wait("@patchVvn");

        cy.contains(/Sucesso/i).should("exist");
    });

    it("abre modal Editar, altera e guarda em batch (PATCH /batch)", () => {
        cy.contains("table tbody tr", "greedy").within(() => {
            cy.contains("button", "Editar").click({ force: true });
        });

        cy.get(".opUpdateModal__content").should("be.visible");

        cy.get("textarea[placeholder^='Ex: Ajuste']").type(
            "Batch update por motivo de consistência"
        );

        // dirty: muda crane na 1ª linha editável
        cy.get(".opUpdateModal__textInput input")
            .filter((_i, el) => (el as HTMLInputElement).placeholder?.includes("MCRAN"))
            .first()
            .clear()
            .type("MCRAN-0099");

        cy.contains("button", /Guardar tudo/i).click();
        cy.wait("@patchBatch");

        cy.contains(/Sucesso/i).should("exist");
    });
});
