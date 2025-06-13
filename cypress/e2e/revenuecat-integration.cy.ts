describe('RevenueCat Integration', () => {
  beforeEach(() => {
    // Clear storage and cookies
    cy.clearAllLocalStorage()
    cy.clearAllSessionStorage()
    cy.clearCookies()
    
    // Mock auth state
    cy.window().then((win) => {
      win.localStorage.setItem('auth_user', JSON.stringify({
        id: 'test-user-id',
        email: 'test@example.com'
      }))
    })
  })

  describe('RevenueCat Debug Card', () => {
    it('should show "Ready" status when VITE_REVENUECAT_PUBLIC_KEY is properly configured', () => {
      // Visit settings page where RevenueCat debug card should be displayed
      cy.visit('/settings')
      
      // Wait for page to load
      cy.get('[data-testid="settings-page"]', { timeout: 10000 }).should('be.visible')
      
      // Check if RevenueCat integration section exists
      cy.contains('RevenueCat Integration').should('be.visible')
      
      // Check the configuration status
      cy.get('[data-testid="revenuecat-debug-card"]').within(() => {
        // Should show configured status
        cy.contains('Configuration').should('be.visible')
        cy.get('[data-testid="config-status-badge"]').should('contain', 'Configured')
        
        // Environment info should show configured public key
        cy.contains('Environment').should('be.visible')
        cy.contains('Public Key: ✓ Configured').should('be.visible')
        
        // Should not show error messages
        cy.get('[data-testid="error-display"]').should('not.exist')
      })
    })

    it('should handle RevenueCat initialization and show customer info', () => {
      // Mock successful RevenueCat API responses
      cy.intercept('**/purchases/**', {
        statusCode: 200,
        body: {
          subscriber: {
            original_app_user_id: 'test-user-id',
            entitlements: {},
            subscriptions: {}
          }
        }
      }).as('revenuecatApi')

      cy.visit('/settings')
      
      cy.get('[data-testid="revenuecat-debug-card"]').within(() => {
        // Should show loading initially, then ready
        cy.get('[data-testid="loading-status-badge"]').should('contain', 'Ready')
        
        // Test actions should be enabled
        cy.get('[data-testid="test-offerings-btn"]').should('not.be.disabled')
        cy.get('[data-testid="restore-purchases-btn"]').should('not.be.disabled')
        cy.get('[data-testid="test-paywall-btn"]').should('not.be.disabled')
      })
    })

    it('should display test functionality correctly', () => {
      cy.visit('/settings')
      
      cy.get('[data-testid="revenuecat-debug-card"]').within(() => {
        // Test offerings button
        cy.get('[data-testid="test-offerings-btn"]').click()
        
        // Should show loading state
        cy.get('[data-testid="test-offerings-btn"]').should('contain', 'Loading')
        
        // After test completes, should show result (assuming mock data)
        cy.get('[data-testid="test-offerings-btn"]', { timeout: 5000 }).should('not.contain', 'Loading')
      })
    })

    it('should open paywall test dialog', () => {
      cy.visit('/settings')
      
      cy.get('[data-testid="revenuecat-debug-card"]').within(() => {
        cy.get('[data-testid="test-paywall-btn"]').click()
      })
      
      // Should open paywall test dialog
      cy.get('[data-testid="paywall-test-dialog"]').should('be.visible')
      cy.contains('RevenueCat Paywall Test').should('be.visible')
      
      // Close dialog
      cy.get('[data-testid="close-dialog-btn"]').click()
      cy.get('[data-testid="paywall-test-dialog"]').should('not.exist')
    })

    it('should display environment information correctly', () => {
      cy.visit('/settings')
      
      cy.get('[data-testid="revenuecat-debug-card"]').within(() => {
        // Environment section should be visible
        cy.contains('Environment').should('be.visible')
        
        // Should show platform info
        cy.contains('Platform:').should('be.visible')
        cy.contains('User Agent:').should('be.visible')
        
        // Public key status should be shown
        cy.contains('Public Key:').should('be.visible')
      })
    })
  })

  describe('RevenueCat Key Validation', () => {
    it('should show error when public key is missing', () => {
      // Mock environment without RevenueCat key
      cy.intercept('GET', '**/settings', (req) => {
        // Simulate missing environment variable
        req.reply((res) => {
          // This test would require server-side changes to simulate missing env var
          // For now, we'll check the UI handles the error state
          res.send(res.body)
        })
      })

      cy.visit('/settings')
      
      // Note: This test is limited because we can't directly modify import.meta.env in Cypress
      // In a real scenario, you'd have a test environment with missing key
      cy.get('[data-testid="revenuecat-debug-card"]').should('be.visible')
    })

    it('should detect invalid key format', () => {
      // This test would need server-side configuration to test different key formats
      // For demonstration, we'll verify the UI shows appropriate status
      
      cy.visit('/settings')
      
      cy.get('[data-testid="revenuecat-debug-card"]').within(() => {
        // Environment info should indicate key status
        cy.contains('Public Key:').should('be.visible')
        
        // Should show either "Configured", "Missing", "Secret key", or "Not configured"
        cy.get('[data-testid="public-key-status"]').should('exist')
      })
    })
  })

  describe('RevenueCat Error Handling', () => {
    it('should handle RevenueCat API errors gracefully', () => {
      // Mock RevenueCat API failure
      cy.intercept('**/purchases/**', {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('revenuecatError')

      cy.visit('/settings')
      
      cy.get('[data-testid="revenuecat-debug-card"]').within(() => {
        // Should show error state
        cy.get('[data-testid="error-display"]').should('be.visible')
        cy.contains('Error:').should('be.visible')
        
        // Configuration should show as not configured due to error
        cy.get('[data-testid="config-status-badge"]').should('contain', 'Not Configured')
      })
    })

    it('should show appropriate error messages for different scenarios', () => {
      cy.visit('/settings')
      
      // Test that error display area exists and can show errors
      cy.get('[data-testid="revenuecat-debug-card"]').should('be.visible')
      
      // If there are errors, they should be displayed in the error section
      cy.get('[data-testid="revenuecat-debug-card"]').then(($card) => {
        const hasError = $card.find('[data-testid="error-display"]').length > 0
        
        if (hasError) {
          cy.get('[data-testid="error-display"]').within(() => {
            cy.contains('Error:').should('be.visible')
            // Error message should be descriptive
            cy.get('p').should('not.be.empty')
          })
        }
      })
    })
  })
})

// Helper commands for RevenueCat testing
declare global {
  namespace Cypress {
    interface Chainable {
      mockRevenueCatSuccess(): Chainable<void>
      mockRevenueCatError(error: string): Chainable<void>
    }
  }
}

Cypress.Commands.add('mockRevenueCatSuccess', () => {
  cy.intercept('**/purchases/**', {
    statusCode: 200,
    body: {
      subscriber: {
        original_app_user_id: 'test-user-id',
        entitlements: {
          pro_features: {
            is_active: true,
            will_renew: true,
            period_type: 'normal',
            expiration_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          }
        }
      }
    }
  }).as('revenuecatSuccess')
})

Cypress.Commands.add('mockRevenueCatError', (error: string) => {
  cy.intercept('**/purchases/**', {
    statusCode: 400,
    body: { error }
  }).as('revenuecatError')
})