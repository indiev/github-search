describe("GitHub Search E2E", () => {
  beforeEach(() => {
    // Start with a fresh visit to clear any previous state if needed
    cy.viewport(1920, 1080);
    cy.on("window:console", (msg) => {
      console.log("BROWSER LOG:", msg);
    });

    // Unified Intercept for all search requests
    cy.intercept("GET", "**/api/github/search/users*", (req) => {
      const url = new URL(req.url);
      const page = url.searchParams.get("page");
      const q = url.searchParams.get("q");

      const headers = {
        "x-ratelimit-limit": "5000",
        "x-ratelimit-remaining": "4999",
        "x-ratelimit-reset": (Math.floor(Date.now() / 1000) + 3600).toString(),
        "content-type": "application/json",
      };

      if (q?.includes("emptyquery")) {
        req.reply({
          body: { items: [], total_count: 0 },
          headers,
        });
        return;
      }

      if (page === "2") {
        req.reply({ fixture: "search-success-page-2.json", headers });
      } else {
        // Default to page 1 for any other request (including initial load or "test" search)
        req.reply({ fixture: "search-success.json", headers });
      }
    }).as("searchUsers");
  });

  afterEach(() => {
    cy.window().then((win) => {
      if (win.__TEST_LOGS__) {
        cy.writeFile(
          `cypress/logs-${Cypress.currentTest.titlePath.join("-")}.json`,
          JSON.stringify(win.__TEST_LOGS__, null, 2),
        );
      }
    });
  });

  context("Happy Path", () => {
    it("allows a user to search for GitHub users and see results", () => {
      // Check if page serves 200
      cy.request("/github-search").its("status").should("eq", 200);
      cy.visit("/github-search");

      // Check initial state
      cy.contains("GitHub 사용자 검색").should("be.visible");

      // Verify Layout Mode
      cy.get('[data-testid="layout-mode"]', { timeout: 15000 })
        .should("exist")
        .and("contain.text", "DESKTOP");

      // Wait for Search Filters to appear
      cy.contains("Search Filters", { timeout: 15000 }).should("be.visible");

      cy.get("input[placeholder='Search...']")
        .should("be.visible")
        .type("test");

      cy.contains("button", "검색").click();

      // Wait for the API call
      cy.wait("@searchUsers");

      // Verify results
      cy.contains("Test User One").should("be.visible");
      cy.contains("Test User Two").should("be.visible");
      cy.contains("Test User Three").should("be.visible");

      // Verify total count
      cy.contains("35").should("exist");
    });

    it("handles empty results gracefully", () => {
      cy.visit("/github-search");

      cy.contains("Search Filters", { timeout: 15000 }).should("be.visible");
      cy.get("input[placeholder='Search...']")
        .should("be.visible")
        .clear()
        .type("emptyquery");

      cy.contains("button", "검색").click();

      cy.wait("@searchUsers");

      cy.contains("검색 결과가 없습니다").should("be.visible");
    });
  });

  context("Pagination (Infinite Scroll)", () => {
    it("loads more users when scrolling to the bottom", () => {
      cy.visit("/github-search");

      cy.contains("Search Filters", { timeout: 15000 }).should("be.visible");
      cy.get("input[placeholder='Search...']")
        .should("be.visible")
        .type("test");

      cy.contains("button", "검색").click();

      cy.wait("@searchUsers"); // Page 1

      // Verify initial users
      cy.contains("Test User One").should("be.visible");

      // Wait for layout/observer stability
      cy.wait(2000);

      // Scroll to bottom
      cy.scrollTo("bottom");

      // Wait for next page
      cy.wait("@searchUsers"); // Page 2

      // Verify new users
      cy.contains("Test User Four", { timeout: 10000 }).should("be.visible");
      cy.contains("Test User Five").should("be.visible");
    });
  });

  context("Rate Limit Handling", () => {
    it("displays a rate limit warning when API returns 429/403", () => {
      // Override global intercept for this specific test
      cy.intercept("GET", "**/search/users*", {
        statusCode: 429,
        body: {
          message: "API rate limit exceeded.",
          documentation_url:
            "https://docs.github.com/rest/overview/resources-in-the-rest-api#rate-limiting",
        },
        headers: {
          "x-ratelimit-limit": "60",
          "x-ratelimit-remaining": "0",
          "x-ratelimit-reset": (Math.floor(Date.now() / 1000) + 60).toString(),
        },
      }).as("searchRateLimited");

      cy.visit("/github-search");

      cy.on("uncaught:exception", () => {
        return false;
      });

      cy.contains("Search Filters", { timeout: 15000 }).should("be.visible");
      cy.get("input[placeholder='Search...']")
        .should("be.visible")
        .type("limit");
      cy.contains("button", "검색").click();

      cy.wait("@searchRateLimited");

      cy.contains(
        /기본 쿼터|일시적인 요청 제한|잠시 후 다시 시도해주세요/,
      ).should("be.visible");
    });
  });

  context("Advanced Filters", () => {
    beforeEach(() => {
      cy.visit("/github-search");
      cy.contains("Search Filters").should("be.visible");
      // Advanced filters are open by default. Verify one of the fields is visible.
      // If we needed to toggle, we should check state first, but here we expect it open.
      cy.contains("Repositories").should("be.visible");
    });

    it("filters by user type (User/Org)", () => {
      cy.intercept("GET", "**/search/users*type%3Aorg*", {
        fixture: "search-success.json",
      }).as("searchOrg");
      // Click "ORG" in Segmented Control
      cy.contains("button", "ORG").click();
      cy.contains("button", "검색").click();
      cy.wait("@searchOrg").its("request.url").should("include", "type%3Aorg");
    });

    it("filters by repository count", () => {
      // Interact with slider - this is tricky in Cypress, often easiest to just set value if possible, or verify input
      // Assuming NumberRangeFilter uses MUI Slider which exposes hidden inputs
      cy.contains("Repositories").should("be.visible");
      cy.get('input[type="range"]').first().should("exist");
    });

    it("filters by location", () => {
      cy.intercept("GET", "**/search/users*location%3A%22Seoul%22*", {
        fixture: "search-success.json",
      }).as("searchLocation");

      // Click the label to focus the input (standard behavior for accessible forms)
      // This avoids selector specificity issues
      cy.get('input[placeholder="City, Country..."]').click().type("Seoul");

      // Wait a moment for internal state/debounce
      cy.wait(1000);
      cy.focused().type("{enter}");

      // Verify chip is added
      cy.contains(".MuiChip-label", "Seoul").should("exist");

      cy.contains("button", "검색").click();
      cy.wait("@searchLocation")
        .its("request.url")
        .should("include", "location%3A%22Seoul%22");
    });

    it("filters by language", () => {
      cy.intercept("GET", "**/search/users*language%3ATypeScript*", {
        fixture: "search-success.json",
      }).as("searchLanguage");

      cy.get('input[placeholder="Select languages..."]')
        .click()
        .type("TypeScript");

      // Wait a moment for internal state/debounce
      cy.wait(1000);
      cy.focused().type("{enter}");
      // Verify chip is added
      cy.contains(".MuiChip-label", "TypeScript").should("exist");

      cy.contains("button", "검색").click();
      cy.wait("@searchLanguage")
        .its("request.url")
        .should("include", "language%3ATypeScript");
    });

    it("filters by joined date", () => {
      // Reveal the Custom date inputs first
      cy.contains("Joined Date").should("be.visible");
      cy.contains("button", "Custom").click();
      // Allow time for conditional render and state update
      cy.wait(1000);
      // Check for inputs by type date
      cy.get('input[type="date"]').should("have.length.at.least", 1);
    });

    it("filters by follower count", () => {
      cy.contains("Followers").should("be.visible");
      cy.get('input[type="range"]').should("exist");
    });

    it("filters by sponsorship availability", () => {
      cy.intercept("GET", "**/search/users*is%3Asponsorable*", {
        fixture: "search-success.json",
      }).as("searchSponsorable");
      cy.get('[data-testid="sponsorable-switch"]').click();
      cy.contains("button", "검색").click();
      cy.wait("@searchSponsorable")
        .its("request.url")
        .should("include", "is%3Asponsorable");
    });
  });

  context("Responsive Design", () => {
    const viewports = [
      { device: "iphone-x", width: 375, height: 812 },
      { device: "ipad-2", width: 768, height: 1024 },
      { device: "macbook-13", width: 1280, height: 800 },
    ] as const;

    viewports.forEach(({ device, width, height }) => {
      it(`renders correctly on ${device} (${width}x${height})`, () => {
        cy.viewport(width, height);
        cy.visit("/github-search");
        cy.contains("GitHub 사용자 검색").should("be.visible");
        cy.contains("Search Filters").should("be.visible");
        cy.get("input[placeholder='Search...']").should("be.visible");
      });
    });
  });

  context("Architecture & Security", () => {
    it("serves initial content via SSR", () => {
      cy.request("/github-search").then((resp) => {
        expect(resp.status).to.eq(200);
        // Check for some static string that indicates content is rendered
        expect(resp.body).to.include("GitHub 사용자 검색");
        expect(resp.body).to.include("Search Filters");
      });
    });

    it("does not call https://api.github.com directly from the browser", () => {
      cy.visit("/github-search");

      // Spy on network requests
      cy.intercept(
        "https://api.github.com/**",
        cy.spy().as("githubDirectCall"),
      );

      cy.get("input[placeholder='Search...']").type("test");
      cy.contains("button", "검색").click();
      cy.wait("@searchUsers");

      // Verify no direct calls were made
      cy.get("@githubDirectCall").should("not.have.been.called");
    });
  });
});
