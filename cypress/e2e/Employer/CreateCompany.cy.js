describe("Company Create", () => {
  const baseUrl = "https://employer.veloxlabs.net";
  beforeEach(() => {
    cy.visit(`${baseUrl}/login`);
  });
  it("Should handle any company create", () => {
    //create new company
    cy.get(
      ".MuiGrid-spacing-xs-1 > :nth-child(1) > .MuiStack-root > a",
    ).click();
    cy.contains("Sign up").should("be.visible");
    cy.get(
      ".MuiBox-root > :nth-child(1) > :nth-child(1) > .MuiStack-root > a",
    ).click();
  });
});
