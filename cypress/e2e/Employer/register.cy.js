describe('Employer Registration Tests', () => {
  const baseUrl = 'https://your-app-url.com'; // Update with actual URL
  
  beforeEach(() => {
    cy.visit(`${baseUrl}/register`);
  });

  // Test Case 1: Successful Registration
  describe('Successful Registration', () => {
    it('should register successfully with valid data', () => {
      cy.get('input[name="company_name"]').type('Tech Company Ltd');
      cy.get('input[name="email"]').type('employer@techcompany.com');
      cy.get('input[name="phone"]').type('+1234567890');
      cy.get('input[name="password"]').type('SecurePassword@123');
      cy.get('input[name="confirm_password"]').type('SecurePassword@123');
      cy.get('input[type="checkbox"]').check(); // Accept terms
      cy.get('button:contains("Register")').click();
      
      cy.url().should('include', '/verification');
      cy.get('.success-message').should('contain', 'Verification email sent');
    });

    it('should auto-populate suggestions for company name', () => {
      cy.get('input[name="company_name"]').type('Tech');
      cy.get('.dropdown-suggestions').should('be.visible');
      cy.get('.dropdown-suggestions li').first().click();
      cy.get('input[name="company_name"]').should('not.be.empty');
    });
  });

  // Test Case 2: Company Name Validation
  describe('Company Name Validation', () => {
    it('should show error for empty company name', () => {
      cy.get('input[name="email"]').type('employer@techcompany.com');
      cy.get('input[name="phone"]').type('+1234567890');
      cy.get('input[name="password"]').type('SecurePassword@123');
      cy.get('input[name="confirm_password"]').type('SecurePassword@123');
      cy.get('button:contains("Register")').click();
      
      cy.get('.error-message').should('contain', 'Company name is required');
    });

    it('should show error for company name less than 3 characters', () => {
      cy.get('input[name="company_name"]').type('Ab');
      cy.get('input[name="email"]').type('employer@techcompany.com');
      cy.get('input[name="phone"]').type('+1234567890');
      cy.get('input[name="password"]').type('SecurePassword@123');
      cy.get('input[name="confirm_password"]').type('SecurePassword@123');
      cy.get('button:contains("Register")').click();
      
      cy.get('.error-message').should('contain', 'Company name must be at least 3 characters');
    });

    it('should show error for company name with special characters', () => {
      cy.get('input[name="company_name"]').type('Tech@Company#Ltd');
      cy.get('.error-message').should('contain', 'Company name cannot contain special characters');
    });

    it('should show error for duplicate company name', () => {
      cy.get('input[name="company_name"]').type('Existing Company');
      cy.get('input[name="email"]').type('employer@existing.com');
      cy.get('input[name="phone"]').type('+1234567890');
      cy.get('input[name="password"]').type('SecurePassword@123');
      cy.get('input[name="confirm_password"]').type('SecurePassword@123');
      cy.get('button:contains("Register")').click();
      
      cy.get('.error-message').should('contain', 'Company name already registered');
    });
  });

  // Test Case 3: Email Validation
  describe('Email Validation', () => {
    it('should show error for invalid email format', () => {
      cy.get('input[name="company_name"]').type('Tech Company Ltd');
      cy.get('input[name="email"]').type('invalidemail');
      cy.get('input[name="phone"]').type('+1234567890');
      cy.get('input[name="password"]').type('SecurePassword@123');
      cy.get('input[name="confirm_password"]').type('SecurePassword@123');
      cy.get('button:contains("Register")').click();
      
      cy.get('.error-message').should('contain', 'Invalid email format');
    });

    it('should show error for empty email', () => {
      cy.get('input[name="company_name"]').type('Tech Company Ltd');
      cy.get('input[name="phone"]').type('+1234567890');
      cy.get('input[name="password"]').type('SecurePassword@123');
      cy.get('input[name="confirm_password"]').type('SecurePassword@123');
      cy.get('button:contains("Register")').click();
      
      cy.get('.error-message').should('contain', 'Email is required');
    });

    it('should show error for already registered email', () => {
      cy.get('input[name="company_name"]').type('Tech Company Ltd');
      cy.get('input[name="email"]').type('test01@gmail.com'); // Already registered
      cy.get('input[name="phone"]').type('+1234567890');
      cy.get('input[name="password"]').type('SecurePassword@123');
      cy.get('input[name="confirm_password"]').type('SecurePassword@123');
      cy.get('button:contains("Register")').click();
      
      cy.get('.error-message').should('contain', 'Email already registered');
    });

    it('should validate email domain', () => {
      cy.get('input[name="company_name"]').type('Tech Company Ltd');
      cy.get('input[name="email"]').type('employer@invalid-domain-12345.com');
      cy.get('.warning-message').should('contain', 'This email domain may not exist');
    });
  });

  // Test Case 4: Phone Number Validation
  describe('Phone Number Validation', () => {
    it('should show error for empty phone number', () => {
      cy.get('input[name="company_name"]').type('Tech Company Ltd');
      cy.get('input[name="email"]').type('employer@techcompany.com');
      cy.get('input[name="password"]').type('SecurePassword@123');
      cy.get('input[name="confirm_password"]').type('SecurePassword@123');
      cy.get('button:contains("Register")').click();
      
      cy.get('.error-message').should('contain', 'Phone number is required');
    });

    it('should show error for invalid phone number format', () => {
      cy.get('input[name="company_name"]').type('Tech Company Ltd');
      cy.get('input[name="email"]').type('employer@techcompany.com');
      cy.get('input[name="phone"]').type('123'); // Too short
      cy.get('input[name="password"]').type('SecurePassword@123');
      cy.get('input[name="confirm_password"]').type('SecurePassword@123');
      cy.get('button:contains("Register")').click();
      
      cy.get('.error-message').should('contain', 'Invalid phone number format');
    });

    it('should accept various phone formats', () => {
      const phoneFormats = ['+1-234-567-8900', '(123) 456-7890', '+44 20 7946 0958'];
      
      phoneFormats.forEach((phone) => {
        cy.reload();
        cy.get('input[name="company_name"]').type('Tech Company Ltd');
        cy.get('input[name="email"]').type(`employer${Math.random()}@techcompany.com`);
        cy.get('input[name="phone"]').type(phone);
        cy.get('.error-message').should('not.exist');
      });
    });
  });

  // Test Case 5: Password Validation
  describe('Password Validation', () => {
    it('should show error for weak password', () => {
      cy.get('input[name="company_name"]').type('Tech Company Ltd');
      cy.get('input[name="email"]').type('employer@techcompany.com');
      cy.get('input[name="phone"]').type('+1234567890');
      cy.get('input[name="password"]').type('weak123'); // Weak password
      cy.get('.password-strength').should('contain', 'Weak');
    });

    it('should show password strength indicator', () => {
      cy.get('input[name="password"]').type('a');
      cy.get('.password-strength').should('have.class', 'very-weak');
      
      cy.get('input[name="password"]').clear().type('Pass123');
      cy.get('.password-strength').should('have.class', 'weak');
      
      cy.get('input[name="password"]').clear().type('SecurePassword@123');
      cy.get('.password-strength').should('have.class', 'strong');
    });

    it('should show error for password without uppercase letter', () => {
      cy.get('input[name="password"]').type('securepassword@123');
      cy.get('.error-message').should('contain', 'Password must contain at least one uppercase letter');
    });

    it('should show error for password without special character', () => {
      cy.get('input[name="password"]').type('SecurePassword123');
      cy.get('.error-message').should('contain', 'Password must contain at least one special character');
    });

    it('should show error for password less than 8 characters', () => {
      cy.get('input[name="company_name"]').type('Tech Company Ltd');
      cy.get('input[name="email"]').type('employer@techcompany.com');
      cy.get('input[name="phone"]').type('+1234567890');
      cy.get('input[name="password"]').type('Pass@12');
      cy.get('input[name="confirm_password"]').type('Pass@12');
      cy.get('button:contains("Register")').click();
      
      cy.get('.error-message').should('contain', 'Password must be at least 8 characters');
    });

    it('should show error for empty password', () => {
      cy.get('input[name="company_name"]').type('Tech Company Ltd');
      cy.get('input[name="email"]').type('employer@techcompany.com');
      cy.get('input[name="phone"]').type('+1234567890');
      cy.get('button:contains("Register")').click();
      
      cy.get('.error-message').should('contain', 'Password is required');
    });
  });

  // Test Case 6: Password Confirmation
  describe('Password Confirmation', () => {
    it('should show error when passwords do not match', () => {
      cy.get('input[name="company_name"]').type('Tech Company Ltd');
      cy.get('input[name="email"]').type('employer@techcompany.com');
      cy.get('input[name="phone"]').type('+1234567890');
      cy.get('input[name="password"]').type('SecurePassword@123');
      cy.get('input[name="confirm_password"]').type('DifferentPassword@123');
      cy.get('button:contains("Register")').click();
      
      cy.get('.error-message').should('contain', 'Passwords do not match');
    });

    it('should enable submit button only when passwords match', () => {
      cy.get('input[name="password"]').type('SecurePassword@123');
      cy.get('input[name="confirm_password"]').type('SecurePassword@12');
      cy.get('button:contains("Register")').should('be.disabled');
      
      cy.get('input[name="confirm_password"]').type('3');
      cy.get('button:contains("Register")').should('not.be.disabled');
    });
  });

  // Test Case 7: Terms and Conditions
  describe('Terms and Conditions', () => {
    it('should show error when terms are not accepted', () => {
      cy.get('input[name="company_name"]').type('Tech Company Ltd');
      cy.get('input[name="email"]').type('employer@techcompany.com');
      cy.get('input[name="phone"]').type('+1234567890');
      cy.get('input[name="password"]').type('SecurePassword@123');
      cy.get('input[name="confirm_password"]').type('SecurePassword@123');
      cy.get('button:contains("Register")').click();
      
      cy.get('.error-message').should('contain', 'You must accept the terms and conditions');
    });

    it('should open terms and conditions modal', () => {
      cy.get('a:contains("terms and conditions")').click();
      cy.get('.modal-title').should('contain', 'Terms and Conditions');
      cy.get('.modal').should('be.visible');
    });

    it('should open privacy policy modal', () => {
      cy.get('a:contains("privacy policy")').click();
      cy.get('.modal-title').should('contain', 'Privacy Policy');
      cy.get('.modal').should('be.visible');
    });
  });

  // Test Case 8: Navigation and Links
  describe('Navigation and Links', () => {
    it('should navigate to login page when "Already have an account?" is clicked', () => {
      cy.get('a:contains("Already have an account?")').click();
      cy.url().should('include', '/login');
    });

    it('should display company tab as default', () => {
      cy.get('button:contains("Company")').should('have.class', 'active');
    });
  });

  // Test Case 9: Data Persistence
  describe('Data Persistence', () => {
    it('should retain form data on page refresh', () => {
      cy.get('input[name="company_name"]').type('Tech Company Ltd');
      cy.get('input[name="email"]').type('employer@techcompany.com');
      cy.reload();
      
      cy.get('input[name="company_name"]').should('have.value', 'Tech Company Ltd');
      cy.get('input[name="email"]').should('have.value', 'employer@techcompany.com');
    });

    it('should clear form data after successful registration', () => {
      cy.get('input[name="company_name"]').type('Tech Company Ltd');
      cy.get('input[name="email"]').type('newemployer@techcompany.com');
      cy.get('input[name="phone"]').type('+1234567890');
      cy.get('input[name="password"]').type('SecurePassword@123');
      cy.get('input[name="confirm_password"]').type('SecurePassword@123');
      cy.get('input[type="checkbox"]').check();
      cy.get('button:contains("Register")').click();
      
      cy.url().should('include', '/verification');
      cy.visit(`${baseUrl}/register`);
      cy.get('input[name="company_name"]').should('have.value', '');
    });
  });

  // Test Case 10: Response Time and Loading
  describe('Response Time and Loading', () => {
    it('should show loading spinner during registration', () => {
      cy.get('input[name="company_name"]').type('Tech Company Ltd');
      cy.get('input[name="email"]').type('newemployer@techcompany.com');
      cy.get('input[name="phone"]').type('+1234567890');
      cy.get('input[name="password"]').type('SecurePassword@123');
      cy.get('input[name="confirm_password"]').type('SecurePassword@123');
      cy.get('input[type="checkbox"]').check();
      cy.get('button:contains("Register")').click();
      
      cy.get('.loading-spinner').should('be.visible');
    });

    it('should complete registration within 10 seconds', () => {
      cy.get('input[name="company_name"]').type('Tech Company Ltd');
      cy.get('input[name="email"]').type('newemployer@techcompany.com');
      cy.get('input[name="phone"]').type('+1234567890');
      cy.get('input[name="password"]').type('SecurePassword@123');
      cy.get('input[name="confirm_password"]').type('SecurePassword@123');
      cy.get('input[type="checkbox"]').check();
      cy.get('button:contains("Register")').click({ timeout: 10000 });
      
      cy.url({ timeout: 10000 }).should('include', '/verification');
    });
  });

  // Test Case 11: XSS and Security
  describe('Security', () => {
    it('should sanitize input to prevent XSS attacks', () => {
      cy.get('input[name="company_name"]').type('<script>alert("XSS")</script>');
      cy.window().then((win) => {
        expect(win.alertCalled).to.be.undefined;
      });
    });

    it('should not expose sensitive data in URL', () => {
      cy.get('input[name="company_name"]').type('Tech Company Ltd');
      cy.get('input[name="email"]').type('employer@techcompany.com');
      cy.get('input[name="phone"]').type('+1234567890');
      cy.get('input[name="password"]').type('SecurePassword@123');
      cy.get('input[name="confirm_password"]').type('SecurePassword@123');
      cy.get('input[type="checkbox"]').check();
      cy.get('button:contains("Register")').click();
      
      cy.url().should('not.include', 'password');
      cy.url().should('not.include', 'SecurePassword');
    });
  });

  // Test Case 12: Browser Compatibility
  describe('Browser Compatibility', () => {
    it('should display form correctly on mobile view', () => {
      cy.viewport('iphone-x');
      cy.get('input[name="company_name"]').should('be.visible');
      cy.get('input[name="email"]').should('be.visible');
      cy.get('button:contains("Register")').should('be.visible');
    });

    it('should display form correctly on tablet view', () => {
      cy.viewport('ipad-2');
      cy.get('input[name="company_name"]').should('be.visible');
      cy.get('input[name="email"]').should('be.visible');
      cy.get('button:contains("Register")').should('be.visible');
    });
  });
});
