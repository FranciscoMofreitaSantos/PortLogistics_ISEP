const API_BASE = "**/api/Qualifications";

describe("Qualifications – E2E", () => {
    beforeEach(() => {
        cy.fixture("qualifications.json").then((qualifications) => {
            cy.intercept("GET", API_BASE, {
                statusCode: 200,
                body: qualifications,
            }).as("getQualifications");
        });

        cy.visit("/qualifications");
        cy.wait("@getQualifications");
    });

    it("1. Abre a página e mostra a tabela com os dados iniciais", () => {
        cy.get(".qual-title-area").should("exist");
        cy.get(".qual-title").should("exist");
        cy.get(".qual-sub").should("exist");

        cy.get(".qual-table").should("exist");
        cy.get(".qual-table tbody tr").should("have.length", 3);

        cy.contains("QLF-001").should("exist");
        cy.contains("Sistema de Gestão de Segurança").should("exist");
    });

    it("2. Ao clicar numa linha, abre o slide de detalhes e fecha", () => {
        cy.contains(".qual-row", "QLF-003").click();

        cy.get(".qual-slide").should("exist");

        cy.get(".qual-slide h3").should("contain.text", "QLF-003");
        cy.get(".qual-slide").should("contain.text", "Segurança de Navios e Instalações Portuárias");

        cy.get(".qual-slide-close").click();
        cy.get(".qual-slide").should("not.exist");
    });

    it("3. Faz pesquisa por código, exibe o resultado no card e abre detalhes", () => {
        const searchCode = "Q-NEW";
        const mockResult = { id: "4", code: searchCode, name: "Resultado da Busca" };

        cy.intercept("GET", `${API_BASE}/code/${searchCode}`, {
            statusCode: 200,
            body: mockResult,
        }).as("searchByCode");

        cy.get(".qual-search-buttons button").eq(1).click();

        cy.get(".qual-search-box").should("exist");

        cy.get(".qual-search-input")
            .type(searchCode);

        cy.get(".qual-search-btn").click();

        cy.wait("@searchByCode");

        cy.get(".qual-search-result").should("exist");
        cy.get(".qual-result-card").should("contain.text", searchCode);
        cy.get(".qual-result-card").should("contain.text", "Resultado da Busca");

        cy.get(".qual-result-actions .qual-btn-edit").click();
        cy.get(".qual-slide").should("exist");
    });

    it("4. Botão de criação abre o modal, preenche e faz POST", () => {
        const newQualification = { code: "PR-33", name: "Training in Port Procedures" };

        cy.intercept("POST", API_BASE, (req) => {
            expect(req.body).to.deep.equal(newQualification);
            req.reply({
                statusCode: 201,
                body: { id: "4", ...newQualification },
            });
        }).as("createQualification");

        cy.get(".qual-create-btn-top").click();
        cy.get(".qual-edit-modal").should("exist");

        cy.get(".qual-edit-modal").within(() => {
            cy.get(".qual-form-group input").eq(0)
                .type(newQualification.code);

            cy.get(".qual-form-group input").eq(1)
                .type(newQualification.name);

            cy.get(".qual-btn-save").click();
        });

        cy.wait("@createQualification");

        cy.get(".qual-edit-modal").should("not.exist");

        cy.contains(".qual-table tbody tr", "Training in Port Procedures").should("exist");
    });

    it("5. Edição a partir do slide abre modal e faz PATCH com novos dados", () => {
        const qualificationId = "1";
        const updatedName = "Sistema de Qualidade Atualizado";
        const updatedCode = "QLF-001-UPD";
        const updateData = { name: updatedName, code: updatedCode };

        cy.contains(".qual-row", "QLF-001").click();
        cy.get(".qual-slide").should("exist");

        cy.intercept("PATCH", `${API_BASE}/${qualificationId}`, (req) => {
            expect(req.body).to.deep.equal(updateData);
            req.reply({
                statusCode: 200,
                body: { id: qualificationId, ...updateData },
            });
        }).as("updateQualification");

        cy.get(".qual-slide .qual-btn-edit").click();

        cy.get(".qual-edit-modal").should("exist");

        cy.get(".qual-edit-modal").within(() => {
            cy.contains(".qual-edit-current", "QLF-001").should("exist");

            cy.get(".qual-form-group input").eq(0)
                .clear()
                .type(updatedCode);

            cy.get(".qual-form-group input").eq(1)
                .clear()
                .type(updatedName);

            cy.get(".qual-btn-save").click();
        });

        cy.wait("@updateQualification");

        cy.get(".qual-edit-modal").should("not.exist");
        cy.get(".qual-slide").should("contain.text", updatedName);
    });
});