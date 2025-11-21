const API_VESSEL = "http://localhost:5008/api/Vessel";
const API_VESSEL_TYPE = "http://localhost:5008/api/VesselType";

describe("Vessels – E2E", () => {
    /**
     * Antes de cada teste:
     *  - mock da lista de vessels
     *  - mock da lista de vessel types (para o nome do tipo)
     *  - visitar /vessels
     */
    beforeEach(() => {
        cy.fixture("vessels.json").then((vessels) => {
            cy.intercept("GET", API_VESSEL, {
                statusCode: 200,
                body: vessels,
            }).as("getVessels");
        });

        cy.fixture("vesselTypes.json").then((types) => {
            cy.intercept("GET", API_VESSEL_TYPE, {
                statusCode: 200,
                body: types,
            }).as("getVesselTypes");
        });

        cy.visit("/vessels");
        cy.wait("@getVessels");
        cy.wait("@getVesselTypes");
    });

    it("abre a página e mostra cards de vessels com dados vindos da API", () => {
        // header básico
        cy.get(".vt-title-area").should("exist");
        cy.get(".vt-title").should("exist");
        cy.get(".vt-sub").should("exist");

        // grid de cards
        cy.get(".vt-card-grid").should("exist");

        // deve ter 2 cards
        cy.get(".vt-card").should("have.length", 2);

        // verificar o conteúdo dentro do grid
        cy.get(".vt-card-grid").within(() => {
            cy.contains("Ever Pride").should("exist");
            cy.contains("MSC Helena").should("exist");
            cy.contains("Evergreen").should("exist");
            cy.contains("MSC").should("exist");
        });
    });


    it("faz pesquisa LOCAL pelo nome e filtra os cards", () => {
        // garante que a grid inicial carregou (pelo menos 1 card)
        cy.get(".vt-card").its("length").should("be.gte", 1);

        // escreve no input e dispara a pesquisa
        cy.get("input.vt-search").type("ever");
        cy.get(".vt-search-btn").click();

        // agora, garante que:
        // 1) continua a haver pelo menos 1 card
        cy.get(".vt-card").its("length").should("be.gte", 1);

        // 2) TODAS os cards visíveis correspondem ao filtro "ever" (nome, owner ou IMO)
        cy.get(".vt-card").each(($card) => {
            cy.wrap($card)
                .invoke("text")
                .then((text) => {
                    const lower = text.toLowerCase();
                    expect(
                        lower.includes("ever pride".toLowerCase()) ||
                        lower.includes("evergreen".toLowerCase()) ||
                        lower.includes("1234567")
                    ).to.be.true;
                });
        });

        // garante que o "Ever Pride" aparece
        cy.contains(".vt-card", "Ever Pride").should("exist");
        // e o MSC Helena desaparece
        cy.contains(".vt-card", "MSC Helena").should("not.exist");
    });

    it("ao clicar num card abre o slide de detalhes com os campos certos", () => {
        cy.contains(".vt-card", "Ever Pride").click();

        cy.get(".vt-slide").within(() => {
            // título do slide
            cy.contains("Ever Pride").should("exist");

            // valor do owner
            cy.contains("Evergreen").should("exist");

            // IMO label + valor (estes são estáveis)
            cy.contains("IMO").should("exist");      // ou "IMO:"
            cy.contains("1234567").should("exist");
        });
    });


    it("botão de criação no header abre o modal de criação e faz POST", () => {
        // intercept do POST
        cy.intercept("POST", API_VESSEL, (req) => {
            expect(req.body).to.include({
                imoNumber: "7777777",
                name: "New Vessel",
                owner: "NYK",
                vesselTypeName: "Panamax",
            });

            req.reply({
                statusCode: 201,
                body: {
                    id: "3",
                    imoNumber: "7777777",
                    name: "New Vessel",
                    owner: "NYK",
                    vesselTypeId: "1",
                },
            });
        }).as("createVessel");

        // abre modal (primeiro botão .vt-create-btn-top é o de ADD)
        cy.get(".vt-create-btn-top").first().click();
        cy.get(".vt-modal").should("exist");

        // preenche campos
        cy.get(".vt-modal").within(() => {
            // imo
            cy.get(".vt-input").eq(0)
                .type("{selectAll}{backspace}7777777");
            // name
            cy.get(".vt-input").eq(1)
                .type("{selectAll}{backspace}New Vessel");
            // owner
            cy.get(".vt-input").eq(2)
                .type("{selectAll}{backspace}NYK");

            // select do tipo
            cy.get("select.vt-input--vesseltype")
                .select("Panamax");

            cy.get(".vt-btn-save").click();
        });

        // API chamada
        cy.wait("@createVessel");

        // modal fechado
        cy.get(".vt-modal").should("not.exist");
    });

    it("a partir do slide de detalhes abre o modal de edição e faz PATCH por IMO", () => {
        // intercept do PATCH
        cy.intercept("PATCH", `${API_VESSEL}/imo/*`, (req) => {
            expect(req.url).to.match(/\/api\/Vessel\/imo\/1234567$/);
            expect(req.body).to.have.property("name", "Ever Pride Updated");
            expect(req.body).to.have.property("owner", "Evergreen Ltd");

            req.reply({
                statusCode: 200,
                body: {
                    id: "1",
                    imoNumber: "1234567",
                    name: "Ever Pride Updated",
                    owner: "Evergreen Ltd",
                    vesselTypeId: "1",
                },
            });
        }).as("updateVessel");

        // abre slide
        cy.contains(".vt-card", "Ever Pride").click();
        cy.get(".vt-slide").should("exist");

        // clica em Edit
        cy.contains(".vt-slide .vt-btn-edit", "Edit").click();

        // modal de edição
        cy.get(".vt-modal").should("exist");

        cy.get(".vt-modal").within(() => {
            cy.get(".vt-input").eq(0)
                .type("{selectAll}{backspace}Ever Pride Updated");
            cy.get(".vt-input").eq(1)
                .type("{selectAll}{backspace}Evergreen Ltd");

            cy.get(".vt-btn-save").click();
        });

        cy.wait("@updateVessel");
        cy.get(".vt-modal").should("not.exist");
    });

    it("a partir do slide de detalhes abre o modal de delete e faz DELETE", () => {
        // intercept do DELETE
        cy.intercept("DELETE", `${API_VESSEL}/*`, (req) => {
            // confirma que está a apagar o id certo (1)
            expect(req.url).to.match(/\/api\/Vessel\/1$/);
            req.reply({ statusCode: 204 });
        }).as("deleteVessel");

        // abre slide para Ever Pride
        cy.contains(".vt-card", "Ever Pride").click();
        cy.get(".vt-slide").should("exist");

        // abre modal de delete
        cy.get(".vt-slide .vt-btn-delete").click();
        cy.get(".vt-modal-delete").should("exist");

        // confirma delete
        cy.get(".vt-modal-delete").within(() => {
            cy.get(".vt-btn-delete").click();
        });

        cy.wait("@deleteVessel");
        cy.get(".vt-modal-delete").should("not.exist");
    });

    it("botão de Statistics no header abre o modal de stats", () => {
        // segundo botão .vt-create-btn-top é o de stats (📊)
        cy.get(".vt-create-btn-top").eq(1).click();

        // modal de stats
        cy.get(".vt-modal-stats").should("exist");
        cy.get(".vt-modal-title").should("exist");



        // botão de fechar (usa .vt-btn-cancel dentro do modal stats)
        cy.get(".vt-modal-stats .vt-btn-cancel").click();
        cy.get(".vt-modal-stats").should("not.exist");
    });
});
