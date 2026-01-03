// cypress/e2e/vve.cy.ts
/// <reference types="cypress" />

describe("Vessel Visit Execution (E2E) - Full Suite", () => {
    const VVE_PATH = "/vve";

    const historyVves = [{ id: "vve-1", vvnId: "vvn-100", actualArrivalTime: "2025-01-01T10:00:00Z", status: "IN_PORT", creatorEmail: "admin@port.com" }];

    const pendingVvns = [{ id: "vvn-200", code: "VVN2025001", vesselImo: "IMO9999999", status: "ACCEPTED", volume: 120, crewManifest: true }];

    const mockVessel = { name: "MSC GULSUN", imo: "IMO9999999", flag: "PA" };
    const mockDefaultVessel = { name: "Unknown Ship", imo: "IMO0000000" };

    beforeEach(() => {

        cy.intercept("GET", /\/api\/.*(auth|user|profile).*/i, { statusCode: 401, body: {} }).as("authFail");

        // 2. Histórico (Lista Principal)
        cy.intercept("GET", /\/api\/.*(vve|VesselVisitExecution).*/i, { statusCode: 200, body: historyVves }).as("getHistory");

        // 3. Candidatos (Lista do Wizard)
        cy.intercept("GET", /\/api\/.*accepted.*/i, { statusCode: 200, body: pendingVvns }).as("getCandidates");

        // 4. Navios (Resolver IMO -> Nome)
        cy.intercept("GET", /\/api\/.*imo\/.+$/i, (req) => {
            if (req.url.includes("IMO9999999")) req.reply({ statusCode: 200, body: mockVessel });
            else req.reply({ statusCode: 200, body: mockDefaultVessel });
        }).as("getVessel");

        // 5. Detalhes VVN (Genérico para resolver IDs)
        cy.intercept("GET", /\/api\/.*(VesselVisitNotification).*\/id\/.+/i, {
            statusCode: 200, body: { id: "vvn-gen", vesselImo: "IMO9999999" }
        });

        // 6. POST DE CRIAÇÃO
        cy.intercept("POST", /\/api\/.*(vve|VesselVisitExecution).*/i, (req) => {
            req.reply({
                statusCode: 201,
                body: {
                    id: "new-vve",
                    vvnId: req.body.vvnId,
                    actualArrivalTime: req.body.actualArrivalTime,
                    status: "IN_PORT",
                    creatorEmail: req.body.creatorEmail
                }
            });
        }).as("createVVE");

        cy.visit(VVE_PATH);

        cy.contains(/Atividade do Porto|NO PORTO|IN_PORT/i).should("exist");
    });

    // --- TESTE 1: LISTAGEM ---
    it("deve carregar a página e mostrar histórico de chegadas", () => {
        cy.contains(/Atividade do Porto|Activity/i).should("exist");

        cy.contains("NO PORTO").should("exist");

        cy.contains("MSC GULSUN", { timeout: 10000 }).should("exist");
    });

    // --- TESTE 2: CRIAÇÃO  ---
    it("deve criar registo usando o email padrão do sistema (Wizard)", () => {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const yyyy = today.getFullYear();
        const dateStr = `${dd}/${mm}/${yyyy}`;

        // 1. Wizard
        cy.contains("button", /Registar Nova Chegada/i).click();

        // 2. Selecionar Navio
        cy.contains("div", "IMO9999999", { timeout: 10000 }).should("be.visible");
        cy.contains("div", "IMO9999999").parents('div[class*="mantine-Paper-root"]').click();
        cy.contains("button", /Próximo/i).click();

        // 3. Data e Hora
        cy.contains(/Hora de Chegada/i).should("be.visible");

        // Calendário
        cy.get('input[type="time"]').parents('.mantine-Input-wrapper').parent().find('button').first().click();
        cy.get('button[data-current="true"], button[data-today="true"]').first().click();

        // Hora (00:01)
        cy.get('input[type="time"]').click().clear().type("00:01");

        cy.contains("button", /Próximo/i).click();

        // 4. Confirmação
        cy.contains(/Confirmar Registo/i).should("be.visible");
        cy.contains(dateStr).should("exist");

        // Validação do email default na UI
        cy.contains("test@developer.com").should("exist");

        // 5. Submit
        cy.contains("button", /Confirmar Chegada/i).click();

        // 6. Validar Envio
        cy.wait("@createVVE").then((xhr) => {
            expect(xhr.response?.statusCode).to.eq(201);
            expect(xhr.request.body.creatorEmail).to.equal("test@developer.com");
        });

        cy.contains(/sucesso/i).should("exist");
    });
});