describe("Profile Screen v2 - Tabs & Timeline", () => {
  beforeEach(() => {
    // Set up test data with multiple timeline entries
    cy.window().then((win) => {
      // Mock localStorage with test data
      const testData = {
        user: {
          id: "1",
          name: "Test User",
          gender: "male",
          height: 180,
          birthDate: "1990-06-12",
        },
        metrics: [
          {
            id: "1",
            weight: 80,
            bodyFatPercentage: 15.5,
            date: new Date("2025-06-09").toISOString(),
          },
          {
            id: "2",
            weight: 81,
            bodyFatPercentage: 16.0,
            date: new Date("2025-06-12").toISOString(),
          },
        ],
      };

      win.localStorage.setItem(
        "logyourbody-user",
        JSON.stringify(testData.user),
      );
      win.localStorage.setItem(
        "logyourbody-metrics",
        JSON.stringify(testData.metrics),
      );
    });

    cy.visit("/");
  });

  describe("Tab Navigation", () => {
    it("should display Avatar and Photo tabs", () => {
      cy.get('[role="tablist"]').should("be.visible");
      cy.get('[role="tab"]').should("have.length", 2);
      cy.get('[role="tab"]').first().should("contain.text", "Avatar");
      cy.get('[role="tab"]').last().should("contain.text", "Photo");
    });

    it("should start with Avatar tab selected", () => {
      cy.get('[role="tab"]')
        .first()
        .should("have.attr", "aria-selected", "true");
      cy.get('[role="tab"]')
        .last()
        .should("have.attr", "aria-selected", "false");
    });

    it("should switch to Photo tab when clicked", () => {
      cy.get('[role="tab"]').last().click();
      cy.get('[role="tab"]')
        .last()
        .should("have.attr", "aria-selected", "true");
      cy.get('[role="tab"]')
        .first()
        .should("have.attr", "aria-selected", "false");
    });

    it("should switch back to Avatar tab", () => {
      // Go to Photo tab first
      cy.get('[role="tab"]').last().click();

      // Then back to Avatar
      cy.get('[role="tab"]').first().click();
      cy.get('[role="tab"]')
        .first()
        .should("have.attr", "aria-selected", "true");
    });

    it("should support keyboard navigation", () => {
      cy.get('[role="tab"]').first().focus();
      cy.get('[role="tab"]').first().type("{rightarrow}");
      cy.get('[role="tab"]')
        .last()
        .should("have.attr", "aria-selected", "true");

      cy.get('[role="tab"]').last().type("{leftarrow}");
      cy.get('[role="tab"]')
        .first()
        .should("have.attr", "aria-selected", "true");
    });
  });

  describe("Timeline Slider", () => {
    it("should display timeline with correct entry count", () => {
      cy.get('[aria-label*="Timeline slider"]').should("be.visible");
      cy.contains("Entry 1 of 2").should("be.visible");
    });

    it("should show date range labels", () => {
      cy.contains("Jun 9, 2025").should("be.visible");
      cy.contains("Jun 12, 2025").should("be.visible");
    });

    it("should change entry when slider is moved", () => {
      // Move slider to second entry
      cy.get('[role="slider"]').click();
      cy.get('[role="slider"]').type("{rightarrow}");

      // Check that entry count updated
      cy.contains("Entry 2 of 2").should("be.visible");
    });

    it("should persist selected entry when navigating back and forward", () => {
      // Move to entry 2
      cy.get('[role="slider"]').click();
      cy.get('[role="slider"]').type("{rightarrow}");
      cy.contains("Entry 2 of 2").should("be.visible");

      // Switch tabs and back
      cy.get('[role="tab"]').last().click();
      cy.get('[role="tab"]').first().click();

      // Entry should still be 2
      cy.contains("Entry 2 of 2").should("be.visible");
    });

    it("should update stats when timeline changes", () => {
      // Check initial weight (entry 1)
      cy.contains("176").should("be.visible"); // 80kg = ~176lbs

      // Move to entry 2
      cy.get('[role="slider"]').click();
      cy.get('[role="slider"]').type("{rightarrow}");

      // Weight should update
      cy.contains("179").should("be.visible"); // 81kg = ~179lbs
    });

    it("should have proper accessibility labels", () => {
      cy.get('[role="slider"]').should("have.attr", "aria-label");
      cy.get('[role="slider"]').should("have.attr", "aria-valuetext");
      cy.get('[role="slider"]')
        .invoke("attr", "aria-label")
        .should("contain", "Timeline slider");
    });
  });

  describe("Stats Grid Layout", () => {
    it("should display all 4 stats in grid", () => {
      cy.get('[aria-label*="Body fat percentage"]').should("be.visible");
      cy.get('[aria-label*="Weight"]').should("be.visible");
      cy.get('[aria-label*="Fat Free Mass Index"]').should("be.visible");
      cy.get('[aria-label*="Lean body mass"]').should("be.visible");
    });

    it("should show units aligned with values", () => {
      // Body fat should show percentage
      cy.contains("15.5").should("be.visible");
      cy.contains("%").should("be.visible");

      // Weight should include units in formatted string
      cy.contains("176 lbs").should("be.visible");
    });

    it("should use centered grid layout on mobile", () => {
      cy.viewport("iphone-se2");
      cy.get('[class*="justify-center"]').should("exist");
    });
  });

  describe("Avatar Overlay", () => {
    it("should display body fat percentage above avatar", () => {
      // Switch to Avatar tab to ensure we see the overlay
      cy.get('[role="tab"]').first().click();

      // Check for body fat overlay
      cy.contains("15.5% body fat").should("be.visible");
    });

    it("should not overlap with avatar legs", () => {
      cy.get('[role="tab"]').first().click();

      // The overlay should be positioned at the top
      cy.contains("15.5% body fat").should("be.visible");

      // Avatar SVG should be visible below
      cy.get('svg[role="img"]').should("be.visible");
    });
  });

  describe("Age Calculation", () => {
    it("should display calculated age correctly", () => {
      // Based on birthDate 1990-06-12 and current date, should be ~35
      cy.contains("Age").should("be.visible");
      cy.contains("35").should("be.visible");
    });

    it("should not show age when birthDate is missing", () => {
      // Update user without birthDate
      cy.window().then((win) => {
        const user = {
          id: "1",
          name: "Test User",
          gender: "male",
          height: 180,
        };
        win.localStorage.setItem("logyourbody-user", JSON.stringify(user));
        cy.reload();
      });

      // Age should be hidden
      cy.get('[aria-label*="Age not available"]').should("exist");
    });
  });

  describe("Performance & Accessibility", () => {
    it("should complete tab switch in under 300ms", () => {
      const start = Date.now();
      cy.get('[role="tab"]').last().click();
      cy.get('[role="tab"]')
        .last()
        .should("have.attr", "aria-selected", "true")
        .then(() => {
          const duration = Date.now() - start;
          expect(duration).to.be.lessThan(300);
        });
    });

    it("should complete timeline navigation in under 200ms", () => {
      const start = Date.now();
      cy.get('[role="slider"]').click();
      cy.get('[role="slider"]').type("{rightarrow}");
      cy.contains("Entry 2 of 2")
        .should("be.visible")
        .then(() => {
          const duration = Date.now() - start;
          expect(duration).to.be.lessThan(200);
        });
    });

    it("should have proper focus management", () => {
      // Tab navigation should maintain focus
      cy.get('[role="tab"]').first().focus();
      cy.get('[role="tab"]').first().should("have.focus");

      cy.get('[role="tab"]').first().type("{rightarrow}");
      cy.get('[role="tab"]').last().should("have.focus");
    });

    it("should announce changes to screen readers", () => {
      // Check for aria-live regions
      cy.get('[aria-live="polite"]').should("exist");

      // Move timeline and check for announcements
      cy.get('[role="slider"]').click();
      cy.get('[role="slider"]').type("{rightarrow}");
      cy.get('[aria-live="polite"]').should("contain.text", "Entry 2 of 2");
    });
  });

  describe("Responsive Design", () => {
    it("should work on iPhone SE", () => {
      cy.viewport("iphone-se2");

      // Tabs should be visible and functional
      cy.get('[role="tablist"]').should("be.visible");
      cy.get('[role="tab"]').last().click();
      cy.get('[role="tab"]')
        .last()
        .should("have.attr", "aria-selected", "true");

      // Timeline should be functional
      cy.get('[role="slider"]').should("be.visible");
      cy.contains("Entry 1 of 2").should("be.visible");
    });

    it("should work on iPhone 15 Pro Max", () => {
      cy.viewport(430, 932); // iPhone 15 Pro Max

      // All components should be visible and functional
      cy.get('[role="tablist"]').should("be.visible");
      cy.get('[role="slider"]').should("be.visible");
      cy.contains("15.5% body fat").should("be.visible");
    });

    it("should handle safe area on notched devices", () => {
      cy.viewport(430, 932);

      // Check that content is not cut off by notch
      cy.get('[role="tablist"]').should("be.visible");
      cy.get('[class*="pt-safe-top"]').should("exist");
    });
  });

  describe("End-to-End Flow", () => {
    it("should complete full interaction flow in under 10 seconds", () => {
      const start = Date.now();

      // 1. Switch to Photo tab
      cy.get('[role="tab"]').last().click();

      // 2. Switch back to Avatar tab
      cy.get('[role="tab"]').first().click();

      // 3. Move timeline slider
      cy.get('[role="slider"]').click();
      cy.get('[role="slider"]').type("{rightarrow}");

      // 4. Verify final state
      cy.contains("Entry 2 of 2")
        .should("be.visible")
        .then(() => {
          const duration = Date.now() - start;
          expect(duration).to.be.lessThan(10000);
        });
    });
  });
});
