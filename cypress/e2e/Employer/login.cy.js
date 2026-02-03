describe("Employer Login Tests", () => {
  const baseUrl = "employer.veloxlabs.net"; // Update with actual URL

  beforeEach(() => {
    cy.visit(`${baseUrl}/login`);
  });

  // Test Case 1: Successful Login
  describe("Successful Login", () => {
    it("should login successfully with valid credentials", () => {
      cy.get('[name="phone"]').type("test01@gmail.com");
      cy.get('input[type="password"]').type("Hajir@123");
      cy.get('button:contains("Login")').click();

      cy.url().should("include", "/dashboard");
    });
  });

  // Test Case 2: Invalid Email or phone Format
  describe("Invalid Email or phone Format", () => {
    it("should show error for invalid email format", () => {
      cy.get('[name="phone"]').type("invalidemail");
      cy.get('input[type="password"]').type("Hajir@123");
      cy.get('button:contains("Login")').click();

      cy.get("#standard-weight-helper-text-phone-login").should(
        "contain",
        "Either a valid phone number or email is required",
      );
    });

    it("should not allow login without email or Phone", () => {
      cy.get('input[type="password"]').type("Hajir@123");
      cy.get('button:contains("Login")').click();

      cy.get("#standard-weight-helper-text-phone-login").should(
        "contain",
        "Phone or Email is required",
      );
    });
  });

  // Test Case 3: Invalid Password
  describe("Invalid Password", () => {
    it("should show error for incorrect password", () => {
      cy.get('[name="phone"]').type("test01@gmail.com");
      cy.get('input[type="password"]').type("WrongPassword@123");
      cy.get('button:contains("Login")').click();

      cy.get("#notistack-snackbar").should(
        "contain",
        "Phone No/Email or password is incorrect.",
      );
    });

    it("should not allow login without password", () => {
      cy.get('[name="phone"]').type("test01@gmail.com");
      cy.get('button:contains("Login")').click();

      cy.get("#standard-weight-helper-text-password-login").should(
        "contain",
        "Password is required",
      );
    });
  });

  // Test Case 4: User  Not Registered
  describe("User Not Registered", () => {
    it("should show error for non-existent account", () => {
      cy.get('[name="phone"]').type("nonexistent@gmail.com");
      cy.get('input[type="password"]').type("Hajir@123");
      cy.get('button:contains("Login")').click();

      cy.get("#notistack-snackbar").should("contain", "User not registered.");
    });
  });

  // Test Case 5: Session and Security
  describe("Session and Security", () => {
    it("should prevent SQL injection attempts", () => {
      cy.get('[name="phone"]').type("' OR '1'='1");
      cy.get('input[type="password"]').type("Hajir@123");
      cy.get('button:contains("Login")').click();
      cy.get("#standard-weight-helper-text-phone-login").should(
        "contain",
        "Either a valid phone number or email is required",
      );
    });
    it("should hide password when eye icon is clicked", () => {
      cy.get('input[name="password"]')
        .as("pwd")
        .should("exist")
        .clear()
        .type("Hajir@123");
      cy.get(".MuiInputAdornment-root > .MuiButtonBase-root").click();
      cy.get("@pwd")
        .should("have.attr", "type", "text")
        .and("have.value", "Hajir@123");
    });
  });

  // Test Case 6:Response Time
  describe(" Response Time", () => {
    it("should complete login within 5 seconds", () => {
      cy.get('[name="phone"]').type("test01@gmail.com");
      cy.get('input[type="password"]').type("Hajir@123");
      cy.get('button:contains("Login")').click({ timeout: 5000 });

      cy.url({ timeout: 5000 }).should("include", "/dashboard");
    });
  });
});

describe("Company Dynamic Flow Test", () => {
  it("Should handle any company scenario automatically", () => {
    // Login
    cy.login("hajirqa123@gmail.com", "Hajir@123");

    cy.wait(9000);

    // Handle dynamic company flow
    cy.handleCompanyFlow();
  });
});
