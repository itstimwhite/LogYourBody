describe('Profile Settings', () => {
  beforeEach(() => {
    // Mock authentication
    cy.window().then((win) => {
      win.localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-token',
        user: {
          id: 'test-user-id',
          email: 'test@example.com'
        }
      }))
    })
    
    // Visit profile settings page
    cy.visit('/settings/profile')
  })

  it('loads and displays profile data', () => {
    // Check that profile fields are visible
    cy.get('label').contains('Full Name').should('be.visible')
    cy.get('label').contains('Username').should('be.visible')
    cy.get('label').contains('Bio').should('be.visible')
    cy.get('label').contains('Gender').should('be.visible')
    cy.get('label').contains('Date of Birth').should('be.visible')
    cy.get('label').contains('Height').should('be.visible')
    cy.get('label').contains('Activity Level').should('be.visible')
  })

  it('saves profile changes automatically', () => {
    // Type in full name field
    cy.get('input[id="fullName"]').clear().type('John Doe')
    
    // Wait for auto-save (debounced)
    cy.wait(1500)
    
    // Check for saved indicator
    cy.contains('Saved').should('be.visible')
  })

  it('handles date of birth selection', () => {
    // Click on DOB Set button
    cy.contains('Date of Birth').parent().find('button').contains('Set').click()
    
    // Modal should open
    cy.contains('Set Date of Birth').should('be.visible')
    
    // Save the date
    cy.get('button').contains('Save').click()
    
    // Modal should close
    cy.contains('Set Date of Birth').should('not.exist')
    
    // Date should be displayed
    cy.contains(/\w+ \d+, \d{4}/).should('be.visible')
  })

  it('handles height selection with unit conversion', () => {
    // Click on Height Set button
    cy.contains('Height').parent().find('button').contains('Set').click()
    
    // Modal should open
    cy.contains('Set Height').should('be.visible')
    
    // Check metric is selected by default
    cy.get('button[data-state="on"]').contains('Metric (cm)').should('exist')
    
    // Switch to imperial
    cy.get('button').contains('Imperial (ft/in)').click()
    
    // Save the height
    cy.get('button').contains('Save').click()
    
    // Modal should close
    cy.contains('Set Height').should('not.exist')
    
    // Height should be displayed in feet/inches format
    cy.contains(/\d+'\d+"/).should('be.visible')
  })

  it('handles gender selection', () => {
    // Check default selection
    cy.get('button[data-state="on"]').contains('Male').should('exist')
    
    // Switch to female
    cy.get('button').contains('Female').click()
    
    // Wait for auto-save
    cy.wait(1500)
    
    // Check that female is now selected
    cy.get('button[data-state="on"]').contains('Female').should('exist')
  })

  it('handles activity level selection', () => {
    // Click on activity level dropdown
    cy.get('[role="combobox"]').click()
    
    // Select a different activity level
    cy.contains('Very Active (6-7 days/week)').click()
    
    // Wait for auto-save
    cy.wait(1500)
    
    // Check that the new value is displayed
    cy.get('[role="combobox"]').should('contain', 'Very Active')
  })

  it('shows error message on save failure', () => {
    // Intercept API call and make it fail
    cy.intercept('PUT', '**/profiles/*', {
      statusCode: 500,
      body: { error: 'Server error' }
    }).as('updateProfile')
    
    // Make a change
    cy.get('input[id="fullName"]').clear().type('Error Test')
    
    // Wait for the failed request
    cy.wait('@updateProfile')
    
    // Check for error toast
    cy.contains('Failed to save changes').should('be.visible')
  })

  it('calculates and displays age from date of birth', () => {
    // Set a specific date of birth
    cy.contains('Date of Birth').parent().find('button').contains('Set').click()
    
    // The date picker should be visible
    cy.contains('Set Date of Birth').should('be.visible')
    
    // Save the date
    cy.get('button').contains('Save').click()
    
    // Age should be calculated and displayed
    cy.contains(/\(\d+ years old\)/).should('be.visible')
  })
})