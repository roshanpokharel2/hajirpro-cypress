describe('Employer Registration', () => {
  beforeEach(() => {
    cy.visit('/employer/register')
  })

  it('should complete employer registration with OTP using Phone Number', () => {
    // Generate random 10-digit phone number
    const phoneNumber = '98' + Math.floor(Math.random() * 10000000).toString().padStart(8, '0')
    cy.log('Generated Phone Number:', phoneNumber)

    // Step 1: Enter phone/email and send OTP
    cy.get('input[placeholder="Enter a valid phone number or email"]')
      .type(phoneNumber)
    cy.contains('Send OTP').click()
      cy.wait(5000) // give backend time to store OTP

    // Step 2: Fetch latest OTP from API
    cy.request({
      method: 'POST',
      url: 'https://staging.veloxlabs.net/api/v2/get-latest-otp',
      body: {
        identifier: phoneNumber
      },
    //  failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(200)
      const otp = response.body.data.otp
      cy.log('Fetched OTP:', otp)

      // Step 3: Enter OTP in UI
      cy.get('input.MuiInputBase-input.MuiOutlinedInput-input').eq(0).type(otp)
    })
    //Verify OTP
      cy.get(':nth-child(2) > div > .MuiButtonBase-root').click()
    // Step 4: Fill password
    cy.get('input[placeholder="Enter password"]').type('Roshan@123')
    cy.get('input[placeholder="Confirm password"]').type('Roshan@123')

    // Step 5: Submit registration
    cy.contains('Submit Password').click()
  })

  it('should complete employer registration with OTP using Email', () => {
    // Generate random email
    const email = 'employer' + Math.floor(Math.random() * 1000000) + '@test.com'
    cy.log('Generated Email:', email)

    // Step 1: Enter phone/email and send OTP
    cy.get('input[placeholder="Enter a valid phone number or email"]')
      .type(email)
    cy.contains('Send OTP').click()
      cy.wait(5000) // give backend time to store OTP

    // Step 2: Fetch latest OTP from API
    cy.request({
      method: 'POST',
      url: 'https://staging.veloxlabs.net/api/v2/get-latest-otp',
      body: {
        identifier: email
      },
    //  failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(200)
      const otp = response.body.data.otp
      cy.log('Fetched OTP:', otp)

      // Step 3: Enter OTP in UI
      cy.get('input.MuiInputBase-input.MuiOutlinedInput-input').eq(0).type(otp)
    })
    //Verify OTP
      cy.get(':nth-child(2) > div > .MuiButtonBase-root').click()
    // Step 4: Fill password
    cy.get('input[placeholder="Enter password"]').type('Roshan@123')
    cy.get('input[placeholder="Confirm password"]').type('Roshan@123')

    // Step 5: Submit registration
    cy.contains('Submit Password').click()
  })

  it('should fail registration with invalid phone number format', () => {
    const invalidPhone = '123'
    cy.log('Using Invalid Phone:', invalidPhone)

    // Step 1: Enter invalid phone and send OTP
    cy.get('input[placeholder="Enter a valid phone number or email"]')
      .type(invalidPhone)
    cy.contains('Send OTP').click()
    cy.get('.MuiFormHelperText-root').should('be.visible')
      
   })

  it('should fail registration with invalid email format', () => {
    const invalidEmail = 'invalidemail'
    cy.log('Using Invalid Email:', invalidEmail)

    // Step 1: Enter invalid email and send OTP
    cy.get('input[placeholder="Enter a valid phone number or email"]')
      .type(invalidEmail)
    cy.contains('Send OTP').click()
    cy.get('.MuiFormHelperText-root').should('be.visible')
      //cy.wait(5000)

  })

  it('should fail registration with non-existent phone number', () => {
    const fakePhone = '9999999999'
    cy.log('Using Non-existent Phone:', fakePhone)

    // Step 1: Enter non-existent phone and send OTP
    cy.get('input[placeholder="Enter a valid phone number or email"]')
      .type(fakePhone)
    cy.contains('Send OTP').click()
      //cy.wait(5000)
cy.get('.MuiFormHelperText-root').should('be.visible')
    
  })

})