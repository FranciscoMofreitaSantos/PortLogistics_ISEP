// cypress/e2e/storageAreas.cy.ts

const API_STORAGE_AREAS = "**/api/storageAreas";

describe("Storage Areas – E2E", () => {
    beforeEach(() => {
        // Lista de Storage Areas (fixture controlada pelo teste)
        cy.fixture("storageAreas.json").then((areas) => {
            cy.intercept("GET", API_STORAGE_AREAS, {
                statusCode: 200,
                body: areas,
            }).as("getStorageAreas");
        });

        // Grid da área selecionada (qualquer ID → devolve o mesmo grid fake)
        cy.intercept("GET", "**/api/storageAreas/*/grid", {
            statusCode: 200,
            body: {
                maxBays: 2,
                maxRows: 1,
                maxTiers: 1,
                slots: [
                    { bay: 0, row: 0, tier: 0, iso: "MSCU1234567" }, // célula ocupada
                ],
            },
        }).as("getStorageAreaGrid");

        // Info de contentor numa célula específica
        cy.intercept("GET", "**/api/storageAreas/*/container*", {
            statusCode: 200,
            body: {
                id: "C-1",
                isoCode: "MSCU1234567",
                description: "Test container",
                type: "General",
                status: "Full",
                weightKg: 12000,
            },
        }).as("getContainerAtPosition");

        cy.visit("/storage-areas");
        cy.wait("@getStorageAreas");
        cy.wait("@getStorageAreaGrid");
    });

    it("abre a página de storage areas e mostra lista + painel principal", () => {
        // wrapper principal
        cy.get(".sa-wrapper").should("exist");

        // header
        cy.get(".vt-title-area").should("exist");
        cy.get(".vt-title").should("exist");
        cy.get(".sa-search").should("exist");

        // strip/lista lateral
        cy.get(".sa-strip").should("exist");
        cy.get(".sa-card-mini").its("length").should("be.gte", 1);

        // painel principal
        cy.get(".sa-main").should("exist");
        cy.get(".sa-kpis").should("exist");
        cy.get(".sa-visual").should("exist");
    });

    it("selecionar uma storage area na strip atualiza o painel principal com info e KPIs", () => {
        // clicar num item específico (ajusta o nome ao teu fixture)
        cy.contains(".sa-card-mini-name", "Yard A").click();

        // KPIs / cards principais
        cy.get(".sa-kpis").within(() => {
            // card tipo
            cy.get(".sa-card").eq(0).within(() => {
                cy.get(".sa-card-title").should("exist");
                cy.get(".sa-card-value").should("exist");
            });

            // card capacidade + barra de progresso
            cy.get(".sa-card").eq(1).within(() => {
                cy.get(".sa-card-title").should("exist");
                cy.get(".sa-card-value").should("exist");
                cy.get(".sa-progress").should("exist");
                cy.get(".sa-progress-fill").should("exist");
            });

            // dimensões (strings fixas: Bays · Rows · Tiers)
            cy.get(".sa-card").eq(2).should("contain.text", "Bays");
            cy.get(".sa-card").eq(2).should("contain.text", "Rows");
            cy.get(".sa-card").eq(2).should("contain.text", "Tiers");
        });

        // recursos físicos (se existirem no fixture)
        cy.get(".sa-card.sa-card--resources").within(() => {
            cy.get(".sa-card-title").should("exist");
            cy.get(".sa-chips").then(($chips) => {
                if ($chips.find(".sa-chip").length > 0) {
                    cy.get(".sa-chip").its("length").should("be.gte", 1);
                }
            });
        });

        // grid de ocupação (tiers)
        cy.get(".sa-visual").should("exist");
        cy.get(".sa-slice").should("have.length.at.least", 1);
        cy.get(".sa-cell").should("have.length.at.least", 1);
    });

    it("botão de View distances abre o modal de distâncias a docks", () => {
        // garantir que uma área está selecionada
        cy.contains(".sa-card-mini-name", "Yard A").click();

        // botão de distâncias (card de docks)
        cy.get(".sa-card.sa-card--button")
            .find(".sa-btn-primary")
            .click();

        // modal de distâncias
        cy.get(".sa-dock-modal").should("exist");
        cy.get(".sa-dock-title").should("exist");

        // lista de docks e distâncias
        cy.get(".sa-dock-body").within(() => {
            cy.get(".sa-dock-row").its("length").should("be.gte", 1);

            cy.get(".sa-dock-row").first().within(() => {
                cy.get(".sa-dock-label").should("exist");
                cy.get(".sa-dock-bar").should("exist");
                cy.get(".sa-dock-fill").should("exist");
                cy.get(".sa-dock-value").should("exist");
            });
        });

        // fechar modal (botão X)
        cy.get(".sa-dock-close").click();
        cy.get(".sa-dock-modal").should("not.exist");
    });

    it("ao clicar numa célula ocupada abre o modal de info do contentor", () => {
        // garantir seleção
        cy.contains(".sa-card-mini-name", "Yard A").click();

        // célula ocupada (definida no intercept do grid)
        cy.get(".sa-cell.filled").should("have.length.at.least", 1);
        cy.get(".sa-cell.filled").first().click();

        // esperar pela API do contentor
        cy.wait("@getContainerAtPosition");

        // modal de container
        cy.get(".sa-container-modal").should("exist");

        // título
        cy.get(".sa-dock-title").should("exist");

        // spinner desaparece e aparecem os dados
        cy.get(".sa-modal-body-modern").within(() => {
            cy.get(".sa-spinner-lg").should("not.exist");
            cy.get(".sa-info-grid").should("exist");
            cy.get(".sa-info-card").its("length").should("be.gte", 3);
        });

        // fechar modal
        cy.get(".sa-dock-close").click();
        cy.get(".sa-container-modal").should("not.exist");
    });

    it("botão de criar navega para /storage-areas/new e cria uma nova storage area (POST)", () => {
        // intercept do POST de criação (robusto, sem prender nos maxBays/Rows/Tiers)
        cy.intercept("POST", API_STORAGE_AREAS, (req) => {
            const body = req.body as any;

            // textos que o teste controla
            expect(body).to.include({
                name: "Yard C",
                description: "New area",
                type: "Yard",
            });

            // campos numéricos existem e são > 0
            expect(body).to.have.property("maxBays");
            expect(body.maxBays).to.be.a("number").and.to.be.greaterThan(0);

            expect(body).to.have.property("maxRows");
            expect(body.maxRows).to.be.a("number").and.to.be.greaterThan(0);

            expect(body).to.have.property("maxTiers");
            expect(body.maxTiers).to.be.a("number").and.to.be.greaterThan(0);

            // distâncias a docks — aqui sim, valor exato
            expect(body.distancesToDocks).to.deep.equal([
                { dockCode: "D1", distance: 100 },
            ]);

            req.reply({
                statusCode: 201,
                body: {
                    id: "C1",
                    name: body.name,
                    description: body.description,
                    type: body.type,
                    maxBays: body.maxBays,
                    maxRows: body.maxRows,
                    maxTiers: body.maxTiers,
                    maxCapacityTeu: 100,
                    currentCapacityTeu: 0,
                    physicalResources: body.physicalResources ?? [],
                    distancesToDocks: body.distancesToDocks,
                },
            });
        }).as("createStorageArea");

        // botão Create no header
        cy.get(".vt-create-btn-top").click();

        // deve ir para /storage-areas/new
        cy.url().should("include", "/storage-areas/new");

        // form de criação
        cy.get(".sa-create-page").should("exist");
        cy.get(".sa-create-body").should("exist");

        // SECÇÃO GERAL (nome, descrição, tipo, dimensões)
        cy.get(".sa-create-body .sa-section").eq(0).within(() => {
            // name
            cy.get(".sa-input")
                .eq(0)
                .clear()
                .type("Yard C");

            // description
            cy.get(".sa-textarea")
                .clear()
                .type("New area");

            // type
            cy.get("select.sa-select").select("Yard");

            // bays / rows / tiers
            cy.get(".sa-grid-3 .sa-input").eq(0)
                .clear()
                .type("2"); // bays
            cy.get(".sa-grid-3 .sa-input").eq(1)
                .clear()
                .type("2"); // rows
            cy.get(".sa-grid-3 .sa-input").eq(2)
                .clear()
                .type("1"); // tiers
        });

        // SECÇÃO RECURSOS / DOCKS
        cy.get(".sa-create-body .sa-section").eq(1).within(() => {
            // dock code (2.º input desta secção: o 1.º é o de recurso)
            cy.get(".sa-input").eq(1)
                .clear()
                .type("D1");

            // distância (3.º input desta secção)
            cy.get(".sa-input").eq(2)
                .clear()
                .type("100");

            // botão "+" para adicionar dock
            cy.get(".sa-chip-btn").last().click();

            // deve haver pelo menos uma distância listada
            cy.get(".sa-box .sa-chip")
                .should("contain.text", "D1")
                .and("contain.text", "100");
        });

        // botão final de criar
        cy.get(".sa-create-actions .sa-btn-save").click();

        cy.wait("@createStorageArea");

        // deve voltar à página de storage-areas
        cy.url().should("include", "/storage-areas");
    });
});
