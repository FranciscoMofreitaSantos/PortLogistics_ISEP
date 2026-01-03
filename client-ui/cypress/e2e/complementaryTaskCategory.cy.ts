describe("Complementary Task Categories – E2E", () => {

    const authHeader = {
        "x-user-email": "cypress.supervisor@test.com"
    };

    const ctc = [
        {
            id: "1",
            code: "CTC001",
            name: "Carga Geral",
            description: "Categoria complementar de carga geral",
            category: "GENERAL",
            defaultDuration: 60,
            isActive: true
        },
        {
            id: "2",
            code: "CTC002",
            name: "Operações Técnicas",
            description: "Apoio técnico complementar",
            category: "TECH",
            defaultDuration: 45,
            isActive: false
        }
    ];

    beforeEach(() => {

        //
        // 🔹 Ensure ALL requests include user header
        //
        cy.intercept(
            { method: "GET", url: /\/api\/complementary-task-categories.*/i },
            req => {
                req.headers = { ...req.headers, ...authHeader };
                req.reply({ statusCode: 200, body: ctc });
            }
        ).as("getCTC");

        cy.intercept(
            { method: "POST", url: /\/api\/complementary-task-categories$/i },
            req => {
                req.headers = { ...req.headers, ...authHeader };
                req.reply({
                    statusCode: 201,
                    body: { id: "99", ...req.body }
                });
            }
        ).as("createCTC");

        cy.intercept(
            { method: "PUT", url: /\/api\/complementary-task-categories\/.+$/i },
            req => {
                req.headers = { ...req.headers, ...authHeader };
                req.reply({
                    statusCode: 200,
                    body: { ...ctc[0], ...req.body }
                });
            }
        ).as("updateCTC");

        cy.intercept(
            { method: "PATCH", url: /\/api\/complementary-task-categories\/.+\/deactivate$/i },
            req => {
                req.headers = { ...req.headers, ...authHeader };
                req.reply({ statusCode: 200 });
            }
        ).as("deactivateCTC");

        cy.intercept(
            { method: "PATCH", url: /\/api\/complementary-task-categories\/.+\/activate$/i },
            req => {
                req.headers = { ...req.headers, ...authHeader };
                req.reply({ statusCode: 200 });
            }
        ).as("activateCTC");

        //
        // 🔹 Visit page
        //
        cy.visit("/ctc");
        cy.wait("@getCTC");
    });

    it("1️⃣ Loads page and displays table rows", () => {

        cy.get("table tbody tr").should("have.length", 2);

        cy.contains("td", "CTC001").should("exist");
        cy.contains("td", "CTC002").should("exist");
    });

    it("2️⃣ Creates a new complementary task category", () => {

        cy.get("button.create-ctc-button").click();

        cy.get(".ctc-type-card").first().click();

        cy.get("#ctc-create-code").type("CTC999");
        cy.get("#ctc-create-name").type("Cypress Category");
        cy.get("#ctc-create-description").type("Created via automated test");
        cy.get("#ctc-create-duration").type("30");

        cy.get(".ctc-submit-button").click();

        cy.wait("@createCTC");
    });

    it("3️⃣ Edits an existing category", () => {

        cy.contains("tr", "CTC001")
            .find(".pr-edit-button")
            .click();

        cy.contains("label", /name|nome/i)
            .parent()
            .find("input")
            .clear()
            .type("Edited Category");

        cy.contains(/save|guardar|salvar/i).click();

        cy.wait("@updateCTC");
    });

    it("4️⃣ Activates and deactivates categories", () => {

        cy.contains("tr", "CTC001")
            .find(".pr-deactivate-button")
            .click();

        cy.wait("@deactivateCTC");

        cy.contains("tr", "CTC002")
            .find(".pr-activate-button")
            .click();

        cy.wait("@activateCTC");
    });

});