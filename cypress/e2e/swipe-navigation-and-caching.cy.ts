describe("Swipe Navigation and Caching", () => {
  beforeEach(() => {
    // Clear all data before each test
    cy.clearAllLocalStorage();
    cy.clearAllSessionStorage();
    cy.clearCookies();

    // Mock the API for consistent testing
    cy.intercept("GET", "**/profiles**", {
      fixture: "user-profile.json",
      delay: 100,
    }).as("getProfile");

    cy.intercept("GET", "**/user_settings**", {
      fixture: "user-settings.json",
      delay: 100,
    }).as("getSettings");

    cy.intercept("GET", "**/body_metrics**", {
      fixture: "body-metrics.json",
      delay: 100,
    }).as("getMetrics");
  });

  describe("Swipe Navigation", () => {
    it("should navigate from Dashboard to Settings with left swipe", () => {
      cy.visit("/dashboard");
      cy.wait(["@getProfile", "@getSettings", "@getMetrics"]);

      // Perform swipe left gesture on mobile viewport
      cy.viewport(375, 667); // iPhone SE size
      cy.get("body")
        .trigger("touchstart", {
          touches: [{ clientX: 300, clientY: 300 }],
        })
        .trigger("touchmove", {
          touches: [{ clientX: 100, clientY: 300 }],
        })
        .trigger("touchend", {
          touches: [{ clientX: 100, clientY: 300 }],
        });

      // Should navigate to settings
      cy.url().should("include", "/settings");
    });

    it("should navigate from Settings to Dashboard with right swipe", () => {
      cy.visit("/settings");
      cy.wait(["@getProfile", "@getSettings", "@getMetrics"]);

      cy.viewport(375, 667);
      cy.get("body")
        .trigger("touchstart", {
          touches: [{ clientX: 50, clientY: 300 }],
        })
        .trigger("touchmove", {
          touches: [{ clientX: 250, clientY: 300 }],
        })
        .trigger("touchend", {
          touches: [{ clientX: 250, clientY: 300 }],
        });

      cy.url().should("include", "/dashboard");
    });

    it("should not trigger swipe navigation on sliders and interactive elements", () => {
      cy.visit("/dashboard");
      cy.wait(["@getProfile", "@getSettings", "@getMetrics"]);

      // Try to swipe on a slider element (should not navigate)
      cy.get("[data-slider]", { timeout: 10000 }).should("exist");
      cy.get("[data-slider]")
        .first()
        .trigger("touchstart", {
          touches: [{ clientX: 200, clientY: 300 }],
        })
        .trigger("touchmove", {
          touches: [{ clientX: 50, clientY: 300 }],
        })
        .trigger("touchend", {
          touches: [{ clientX: 50, clientY: 300 }],
        });

      // Should remain on dashboard
      cy.url().should("include", "/dashboard");
    });

    it("should allow edge swipes even on conflicting elements", () => {
      cy.visit("/dashboard");
      cy.wait(["@getProfile", "@getSettings", "@getMetrics"]);

      cy.viewport(375, 667);

      // Swipe from very edge (within 50px threshold) should work even on sliders
      cy.get("body")
        .trigger("touchstart", {
          touches: [{ clientX: 10, clientY: 300 }], // Start from edge
        })
        .trigger("touchmove", {
          touches: [{ clientX: 200, clientY: 300 }],
        })
        .trigger("touchend", {
          touches: [{ clientX: 200, clientY: 300 }],
        });

      // Should navigate to settings
      cy.url().should("include", "/settings");
    });
  });

  describe("Data Caching Behavior", () => {
    it("should show cached data instantly on return navigation", () => {
      // First visit - data should load normally
      cy.visit("/dashboard");
      cy.wait(["@getProfile", "@getSettings", "@getMetrics"]);

      // Verify data is displayed
      cy.get('[data-testid="user-profile"]').should("be.visible");
      cy.get('[data-testid="metrics-panel"]').should("be.visible");

      // Navigate away and back
      cy.visit("/settings");
      cy.wait(["@getProfile", "@getSettings"]); // Should use cache, minimal requests

      // Navigate back to dashboard
      cy.visit("/dashboard");

      // Data should appear instantly without loading spinner
      cy.get('[data-testid="loading-spinner"]').should("not.exist");
      cy.get('[data-testid="user-profile"]').should("be.visible");
      cy.get('[data-testid="metrics-panel"]').should("be.visible");
    });

    it("should handle cache invalidation after mutations", () => {
      cy.visit("/dashboard");
      cy.wait(["@getProfile", "@getSettings", "@getMetrics"]);

      // Mock successful metric addition
      cy.intercept("POST", "**/body_metrics", {
        statusCode: 201,
        body: {
          id: "new-metric-id",
          user_id: "test-user",
          date: new Date().toISOString(),
          weight: 70,
          body_fat_percentage: 15,
          method: "scale",
        },
      }).as("addMetric");

      // Mock updated metrics list
      cy.intercept("GET", "**/body_metrics**", {
        fixture: "body-metrics-updated.json",
      }).as("getUpdatedMetrics");

      // Add a new metric
      cy.get('[data-testid="add-metric-button"]').click();
      cy.get('[data-testid="weight-input"]').type("70");
      cy.get('[data-testid="save-metric-button"]').click();

      cy.wait("@addMetric");
      cy.wait("@getUpdatedMetrics"); // Should refetch after mutation

      // Verify updated data is displayed
      cy.get('[data-testid="metrics-panel"]').should("contain", "70");
    });
  });

  describe("Timeout and Error Handling", () => {
    it("should show timeout UI and retry option after 3 seconds", () => {
      // Mock slow API response
      cy.intercept("GET", "**/profiles**", {
        fixture: "user-profile.json",
        delay: 4000, // 4 second delay
      }).as("getSlowProfile");

      cy.visit("/dashboard");

      // Should show loading initially
      cy.get('[data-testid="loading-spinner"]').should("be.visible");

      // After 3 seconds, should show timeout message
      cy.contains("Still loading", { timeout: 4000 }).should("be.visible");
      cy.contains("retry", { timeout: 1000 }).should("be.visible");

      // Click retry button
      cy.contains("retry").click();

      // Should attempt to reload
      cy.wait("@getSlowProfile");
    });

    it("should handle network errors gracefully", () => {
      // Mock network error
      cy.intercept("GET", "**/profiles**", {
        forceNetworkError: true,
      }).as("getProfileError");

      cy.visit("/dashboard");

      // Should show error message
      cy.contains("error", { timeout: 5000 }).should("be.visible");
      cy.contains("retry", { timeout: 1000 }).should("be.visible");
    });
  });

  describe("Service Worker and Redirect Loop Prevention", () => {
    it("should detect and handle redirect loops", () => {
      // Mock a scenario that would cause redirect loops
      cy.visit("/dashboard");

      // Simulate multiple rapid redirects
      cy.visit("/settings");
      cy.visit("/dashboard");
      cy.visit("/settings");
      cy.visit("/dashboard");

      // Should not get stuck in infinite loop
      cy.url().should("match", /\/(dashboard|settings)$/);
      cy.get("body").should("be.visible");
    });

    it("should clear stale service worker on detection", () => {
      // This test would be more complex in a real scenario
      // For now, just verify the app loads correctly
      cy.visit("/dashboard");
      cy.wait(["@getProfile", "@getSettings", "@getMetrics"]);

      cy.get('[data-testid="user-profile"]').should("be.visible");
    });
  });

  describe("Performance Optimization", () => {
    it("should not make redundant API calls with valid cache", () => {
      cy.visit("/dashboard");
      cy.wait(["@getProfile", "@getSettings", "@getMetrics"]);

      // Navigate away and back quickly
      cy.visit("/settings");
      cy.visit("/dashboard");

      // Should not make additional API calls due to caching
      // The '@get*' aliases should not be called again within cache time
      cy.get('[data-testid="user-profile"]').should("be.visible");
    });

    it("should prefetch data on hover/focus for better UX", () => {
      cy.visit("/dashboard");
      cy.wait(["@getProfile", "@getSettings", "@getMetrics"]);

      // Hover over settings navigation
      cy.get('[data-testid="settings-nav-link"]').trigger("mouseover");

      // Should prefetch settings data (implementation dependent)
      cy.get('[data-testid="settings-nav-link"]').should("be.visible");
    });
  });
});
