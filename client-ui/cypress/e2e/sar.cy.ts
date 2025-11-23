const API_SAR = "http://localhost:5008/api/ShippingAgentRepresentative";
const SAR_PAGE_URL = "/sar"; // ajusta se a tua rota for diferente

describe("SAR – E2E", () => {
    /**
     * Antes de cada teste:
     *  - mock da lista de SARs
     *  - visitar a página de SAR
     */
    beforeEach(() => {
        cy.fixture("sars.json").then((sars) => {
            cy.intercept("GET", API_SAR, {
                statusCode: 200,
                body: sars,
            }).as("getSARs");
        });

        cy.visit(SAR_PAGE_URL);
        cy.wait("@getSARs");
    });

    it("opens the SAR page and shows the list from the API", () => {
        // header básico (assumindo que reutiliza as mesmas classes dos vessel types)
        cy.get(".vt-title-area").should("exist");
        cy.get(".vt-title").should("exist");
        cy.get(".vt-sub").should("exist");

        // tabela e nº de linhas
        cy.get(".vt-table").should("exist");
        cy.get(".vt-table tbody tr").should("have.length", 2);

        // verifica que alguns nomes da fixture aparecem
        cy.get(".vt-table").within(() => {
            cy.contains("Alice Martins").should("exist");
            cy.contains("Bruno Esteves").should("exist");
        });
    });

    it("searches by email using the API and filters the table", () => {
        // mock da pesquisa por email (modo default = "email")
        cy.intercept("GET", `${API_SAR}/email/*`, {
            statusCode: 200,
            body: {
                id: "1",
                name: "Alice Martins",
                citizenId: { passportNumber: "P123456" },
                nationality: "Portugal",
                email: { address: "alice.martins@example.com" },
                phoneNumber: { number: "912345678" },
                sao: "SAO-01",
                notifs: [],
                status: "activated",
            },
        }).as("searchByEmail");

        // garante que a tabela inicial carregou (pelo menos 1 linha)
        cy.get(".vt-table tbody tr").its("length").should("be.gte", 1);

        // escreve no input e dispara a pesquisa
        cy.get("input.vt-search").clear().type("alice.martins@example.com");
        cy.get(".vt-search-btn").click();

        // aguarda chamada à API
        cy.wait("@searchByEmail");

        // agora, garante que:
        // 1) há apenas 1 linha visível
        cy.get(".vt-table tbody tr").should("have.length", 1);

        // 2) essa linha contém o email pesquisado
        cy.contains(".vt-table tbody tr", "alice.martins@example.com").should("exist");
    });

    it("opens the slide details when clicking a row and shows SAR info", () => {
        // clica especificamente na linha que contém 'Alice Martins'
        cy.contains(".vt-table tbody tr", "Alice Martins").click();

        // slide deve aparecer
        cy.get(".vt-slide").should("exist");

        // verifica alguns campos de detalhe (compatíveis com a fixture)
        cy.get(".vt-slide").within(() => {
            cy.contains("Alice Martins").should("exist");
            cy.contains("alice.martins@example.com").should("exist");
            cy.contains("SAO-01").should("exist"); // sao
        });

        // botão de fechar funciona
        cy.get(".vt-slide-close").click();
        cy.get(".vt-slide").should("not.exist");
    });

    it("opens the create SAR modal from the header and performs POST", () => {
        cy.intercept(
            {
            method: "POST",
            url: /\/api\/ShippingAgentRepresentative\/?$/,
            },
            (req) => {
            expect(req.body).to.include({
                name: "New SAR",
                status: "activated",
            });

            req.reply({
                statusCode: 201,
                body: {
                id: "3",
                name: "New SAR",
                citizenId: { passportNumber: "P000000" },
                nationality: "Portugal",
                email: { address: "newsar@example.com" },
                phoneNumber: { number: "900000000" },
                sao: "SAO-NEW",
                notifs: [],
                status: "activated",
                },
            });
            }
        ).as("createSAR");

        // intercept correto para o service real
        cy.intercept("GET", "/api/ShippingAgentOrganization", {
            statusCode: 200,
            body: [
            {
                shippingOrganizationCode: { value: "SAO-NEW" },
                legalName: "SAO-NEW",
            },
            ],
        }).as("getSAOs");

        cy.get(".vt-create-btn-top").click();

        // esperar explicitamente pelas opções do dropdown
        cy.wait("@getSAOs");

        cy.get(".vt-modal").within(() => {
            cy.get("input.vt-input").eq(0)
            .clear().type("New SAR"); // name

            cy.get("input.vt-input").eq(1)
            .clear().type("P000000"); // citizenId

            // nationality
            cy.get("select.vt-input").eq(0).select("Portugal");

            // SAO
            cy.get("select.vt-input").eq(1).select("SAO-NEW");

            cy.get("input.vt-input").eq(2)
            .clear().type("newsar@example.com");

            cy.get("input.vt-input").eq(3)
            .clear().type("900000000");

            // status (já é activated por default, mas se quisesses:)
            cy.get("select.vt-input").eq(2).select("activated");

            cy.get(".vt-btn-save").click();
        });

        cy.wait("@createSAR");
        cy.get(".vt-modal").should("not.exist");
    });

    it("opens the edit SAR modal from the slide and performs PATCH", () => {
        // escolhe a segunda linha da tabela (por ex., Bruno Esteves)
        cy.get(".vt-table tbody tr").eq(1).click();
        cy.get(".vt-slide").should("exist");

        // intercept do PATCH (update por email)
        cy.intercept("PATCH", `${API_SAR}/update/*`, (req) => {
            expect(req.body).to.have.property("status", "deactivated");
            req.reply({
                statusCode: 200,
                body: {
                    id: "2",
                    name: "Bruno Esteves",
                    citizenId: { passportNumber: "P987654" },
                    nationality: "ES",
                    email: { address: "bruno.esteves@example.com" },
                    phoneNumber: { number: "934567890" },
                    sao: "SAO-02",
                    notifs: [],
                    status: "deactivated",
                },
            });
        }).as("updateSAR");

        // abre modal de edição
        cy.get(".vt-btn-edit").click();
        cy.get(".vt-modal").should("exist");

        // altera o status (e/ou outros campos) e guarda
        cy.get(".vt-modal").within(() => {
            // exemplo: alterar status para "deactivated"
            // aqui o campo é um <select>, por isso usamos .select()
            cy.get(".vt-input").eq(2) // ajusta se necessário, mas mantendo o select
                .select("deactivated");

            cy.get(".vt-btn-save").click();
        });

        cy.wait("@updateSAR");
        cy.get(".vt-modal").should("not.exist");
    });

    it("opens the delete SAR modal from the slide and performs DELETE", () => {
        // seleciona a primeira linha (id = "1" na fixture)
        cy.get(".vt-table tbody tr").first().click();
        cy.get(".vt-slide").should("exist");

        // abre modal de delete
        cy.get(".vt-btn-delete").click();
        cy.get(".vt-modal-delete").should("exist");

        // intercept do DELETE
        cy.intercept("DELETE", `${API_SAR}/*`, (req) => {
            // confirma que está a apagar o id certo (por ex., 1)
            expect(req.url).to.match(/\/api\/ShippingAgentRepresentative\/1$/);
            req.reply({ statusCode: 204 });
        }).as("deleteSAR");

        // confirma delete
        cy.get(".vt-modal-delete").within(() => {
            cy.get(".vt-btn-delete").click();
        });

        cy.wait("@deleteSAR");
        cy.get(".vt-modal-delete").should("not.exist");
    });
});
