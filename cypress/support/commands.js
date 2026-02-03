import "cypress-file-upload";
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
Cypress.Commands.add("login", (email, password) => {
  cy.visit("https://employer.veloxlabs.net/login");
  cy.title().should("eq", "Hajir Pro");

  cy.get("#phone-login").type(email);

  cy.get("#password-login").type(password);

  cy.get("button[type='submit']").click();
});
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
/// <reference types="cypress" />
/// <reference types="cypress-xpath" />

Cypress.Commands.add("handleCompanyFlow", () => {
  cy.get("body").then(($body) => {
    // Case 1: Proceed To Pay exists → Do Payment Flow
    if ($body.find("button:contains('Proceed To Pay')").length > 0) {
      cy.log(" Proceed To Pay found → Starting billing process");

      cy.get(".MuiDialogActions-root > .MuiButton-contained").click();
      cy.contains("Billing Cycle").scrollIntoView().should("be.visible");
      cy.contains("Monthly").click();
      cy.log(" Monthly billing selected");
      cy.contains("Billing Summary").should("be.visible");
      for (let i = 0; i < 10; i++) {
        cy.wait(1000);
        cy.get(
          ".mui-1b9wse7 > :nth-child(2) > .MuiStack-root > .MuiFormControl-root > .MuiInputBase-root > .MuiInputAdornment-positionEnd > .MuiButtonBase-root",
        ).click();
      }
      cy.contains("Manual").click();
      cy.get(".MuiDialogActions-root > .MuiButton-contained").click();
      cy.contains("Payment initiated successfully").should("be.visible");

      cy.wait(5000);
      cy.get(
        ".mui-19ikub9 > .MuiDialog-container > .MuiPaper-root > form > .MuiDialogActions-root > .MuiButton-outlined",
      ).click();
      cy.wait(1000);
      cy.get(".MuiDialogActions-root > .MuiButton-contained").click();
      cy.get(
        ".mui-19ikub9 > .MuiDialog-container > .MuiPaper-root > form > .MuiDialogActions-root > .MuiButton-contained",
      ).click();
      cy.wait(2000);
      cy.get('input[type="file"]').attachFile("payment.png");
      cy.wait(2000);
      cy.get(".mui-8fawdx > .MuiButtonBase-root").click();
      cy.wait(3000);
      cy.get('input[type="file"]').attachFile("payment.png");
      cy.get(
        ".mui-19ikub9 > .MuiDialog-container > .MuiPaper-root > form > .MuiDialogActions-root > .MuiButton-contained",
      ).click();
    }

    //  Case 2: On Boarding Process popup exists → Close it
    else if ($body.text().includes("Your Company is in Review...")) {
      cy.log(" Onboarding popup found → Closing it");

      cy.get(".MuiPaper-root > .MuiIconButton-root").click();
      cy.get(".MuiStack-root.mui-72xfu5").click();
      cy.wait(2000);
      cy.contains("My Plans").should("be.visible").click();

      cy.contains("Current Plan").scrollIntoView().should("be.visible");
      cy.contains("button", /Upgrade|Renew|Proceed To Order/)
        .scrollIntoView()
        .should("be.visible")
        .click();
      cy.wait(2000);

      cy.get(".MuiPaper-root > .MuiIconButton-sizeMedium").click();
      cy.contains("button", /Upgrade|Renew|Proceed To Order/)
        .scrollIntoView()
        .should("be.visible")
        .click();
      cy.contains("Billing Cycle").scrollIntoView().should("be.visible");
      cy.contains("Monthly").click();
      cy.contains("Billing Summary").scrollIntoView().should("be.visible");

      // Click Proceed To Order first
      cy.get(".mui-1tsvqjq > .MuiButtonBase-root").click();

      //  Wait for backend toast message
      cy.wait(1000);

      // Check if system shows seat requirement error
      cy.get("body").then(($body) => {
        if ($body.text().includes("Please select at least")) {
          cy.log("⚠ Not enough seats → Reading required seat count...");

          cy.contains("Please select at least")
            .invoke("text")
            .then((msg) => {
              //  Extract number from message
              const requiredSeats = parseInt(msg.match(/\d+/)[0]);

              cy.log(" Required Seats: " + requiredSeats);

              // Click + button requiredSeats times
              for (let i = 0; i < requiredSeats; i++) {
                cy.get(".mui-efd5gz > .MuiBox-root > :nth-child(3)").click();
              }

              cy.log(" Seats updated successfully");

              //  Click Proceed To Order again after updating seats
              cy.get(".mui-1tsvqjq > .MuiButtonBase-root").click({
                force: true,
              });
            });
        } else {
          cy.log("Seats already sufficient. No update needed.");
        }
        cy.contains("Payment Gateway").should("be.visible");
        cy.get(".mui-747o1y").click();
        cy.get(".MuiDialogActions-root > .MuiButtonBase-root").click();
        cy.contains("Payment initiated successfully").should("be.visible");
        cy.get('input[type="file"]').attachFile("payment.png");
      });
    }

    //  Case 3: Dashboard only → Nothing required
    else if ($body.text().includes("Employer Dashboard")) {
      cy.get(".MuiStack-root.mui-72xfu5").click();
      cy.wait(2000);

      cy.contains("My Plans").should("be.visible").click();

      cy.contains("Current Plan").scrollIntoView().should("be.visible");
      cy.contains("button", /Upgrade|Renew|Proceed To Order/)
        .scrollIntoView()
        .should("be.visible")
        .click();
      cy.wait(2000);

      cy.get(".MuiPaper-root > .MuiIconButton-sizeMedium").click();
      cy.contains("button", /Upgrade|Renew|Proceed To Order/)
        .scrollIntoView()
        .should("be.visible")
        .click();
      cy.contains("Billing Cycle").scrollIntoView().should("be.visible");
      cy.contains("Monthly").click();
      cy.contains("Billing Summary").scrollIntoView().should("be.visible");

      // Click Proceed To Order first
      cy.get(".mui-1tsvqjq > .MuiButtonBase-root").click();

      //  Wait for backend toast message
      cy.wait(1000);

      // Check if system shows seat requirement error
      cy.get("body").then(($body) => {
        if ($body.text().includes("Please select at least")) {
          cy.log("⚠ Not enough seats → Reading required seat count...");

          cy.contains("Please select at least")
            .invoke("text")
            .then((msg) => {
              //  Extract number from message
              const requiredSeats = parseInt(msg.match(/\d+/)[0]);

              cy.log(" Required Seats: " + requiredSeats);

              // Click + button requiredSeats times
              for (let i = 0; i < requiredSeats; i++) {
                cy.get(".mui-efd5gz > .MuiBox-root > :nth-child(3)").click();
              }

              cy.log(" Seats updated successfully");

              //  Click Proceed To Order again after updating seats
              cy.get(".mui-1tsvqjq > .MuiButtonBase-root").click({
                force: true,
              });
            });
        } else {
          cy.log("Seats already sufficient. No update needed.");
        }
      });
    }

    // Unknown condition
    else {
      cy.log("⚠ No matching condition found");
    }
  });
});
///login
