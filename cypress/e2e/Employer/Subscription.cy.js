import { runLoginTests } from "../reuse/loginSuite";
runLoginTests();

describe("Company Dynamic Flow Test", () => {
  it("Should handle any company scenario automatically", () => {
    // Login
    cy.login("hajirqa123@gmail.com", "Hajir@123");

    cy.wait(9000);

    // Handle dynamic company flow
    cy.handleCompanyFlow();
  });
});
