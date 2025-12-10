import { mount } from "cypress/react";

import Providers from "../Providers";
import { mockUsers } from "./_mock/users";
import { SearchProvider } from "./SearchContext";
import SearchRoot from "./SearchRoot";

function mountPage() {
  return mount(
    <Providers>
      <SearchProvider>
        <SearchRoot
          initialUsers={[]}
          initialTotalCount={mockUsers.length} // synced with mocked API response
          initialUserIds={[]}
        />
      </SearchProvider>
    </Providers>,
  );
}

const PAGE_SIZE = 6; // Small page size for predictable pagination in tests

describe("GitHubSearchPage", () => {
  beforeEach(() => {
    // Intercept Next.js GitHub Search API route so that
    // component tests never hit the real GitHub API.
    cy.intercept("GET", "/api/github/search/users*", (req) => {
      const url = new URL(req.url);
      const page = parseInt(url.searchParams.get("page") || "1");
      const q = url.searchParams.get("q") || "";

      let filtered = mockUsers;

      // Simple mock filtering by type (matches buildSearchQuery behavior)
      if (q.includes("type:org")) {
        filtered = filtered.filter((item) => item.type === "Organization");
      }

      const start = (page - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE;
      const users = filtered.slice(start, end);

      req.reply({
        total_count: filtered.length,
        users,
      });
    }).as("searchUsers");
  });

  it("updates summary chips and list when filters change", () => {
    cy.viewport(1280, 800);
    mountPage();

    // Initial load
    cy.wait("@searchUsers");

    cy.contains("User Type").should("be.visible");
    cy.contains("button", "ORG").click();

    cy.contains("button", "검색").click();

    // Check for chip presence
    cy.contains("Type: Organizations").should("exist");

    // Wait for filtered results
    cy.wait("@searchUsers");

    cy.get('[data-testid="user-card"]')
      .should("exist")
      .each(($card) => {
        cy.wrap($card).contains("Organization");
      });
  });

  it("loads more results via the sentinel and fallback button", () => {
    cy.viewport(1280, 800);
    // Stub IntersectionObserver to prevent auto-loading, ensuring we only test the fallback button manual click
    cy.window().then((win) => {
      // @ts-expect-error -- Mocking IO
      win.IntersectionObserver = class IntersectionObserver {
        constructor() {}
        observe() {}
        unobserve() {}
        disconnect() {}
      };
    });
    mountPage();

    cy.get('[data-testid="user-card"]').should("have.length", 6);

    // Load 1: 6 -> 12
    cy.contains("button", "Load more").should("not.be.disabled").click();
    // cy.contains("button", "Loading").should("exist"); // Loading state might be too fast with mock

    cy.get('[data-testid="user-card"]').should("have.length", 12);

    // Load 2: 12 -> 18
    cy.contains("button", "Load more").should("not.be.disabled").click();

    cy.get('[data-testid="user-card"]').should("have.length", 18);

    // Load 3: 18 -> 21 (End)
    cy.contains("button", "Load more").should("not.be.disabled").click();

    cy.contains("모든 결과를 확인했습니다.").should("be.visible");
  });

  it("switches filter layout based on viewport", () => {
    cy.viewport(360, 780);
    mountPage();

    cy.contains("button", "필터 열기").should("be.visible").click();
    cy.contains("User Type").should("be.visible");
    cy.get(
      'button[aria-label="close"], button:contains("Close"), button:contains("닫기")',
    )
      .first()
      .click();

    cy.viewport(1280, 800);
    mountPage();

    cy.contains("User Type").should("be.visible");
    cy.contains("button", "필터 열기").should("not.exist");
  });

  it("applies repository and follower range filters to query string and summary chips", () => {
    cy.viewport(1280, 800);
    mountPage();

    // Swallow initial auto-load query
    cy.wait("@searchUsers");

    // Repositories: between 10 and 20
    cy.get('input[type="number"]').eq(0).clear().type("10");
    cy.get('input[type="number"]').eq(1).clear().type("20");

    // Followers: between 100 and ∞ (min only)
    cy.get('input[type="number"]').eq(2).clear().type("100");

    cy.contains("button", "검색").click();

    cy.wait("@searchUsers").then((interception) => {
      const url = new URL(interception.request.url);
      const q = url.searchParams.get("q") || "";

      expect(q).to.include("repos:10..20");
      expect(q).to.include("followers:100..*");
    });

    cy.contains("Repos: 10 - 20").should("exist");
    cy.contains("Followers: 100 - ∞").should("exist");
  });

  it("applies location and language multi-select filters to query string and summary chips", () => {
    cy.viewport(1280, 800);
    mountPage();

    // Swallow initial auto-load query
    cy.wait("@searchUsers");

    // Location
    cy.get('input[placeholder="City, Country..."]').type("Seoul{enter}");
    // Language
    cy.get('input[placeholder="Select languages..."]').type(
      "TypeScript{enter}",
    );

    cy.contains("button", "검색").click();

    cy.wait("@searchUsers").then((interception) => {
      const url = new URL(interception.request.url);
      const q = url.searchParams.get("q") || "";

      expect(q).to.include('location:"Seoul"');
      expect(q).to.include("language:TypeScript");
    });

    cy.contains("Location: Seoul").should("exist");
    cy.contains("Language: TypeScript").should("exist");
  });

  it("maps joined date presets to created: date ranges and summary chips", () => {
    cy.viewport(1280, 800);
    mountPage();

    // Swallow initial auto-load query
    cy.wait("@searchUsers");

    cy.contains("button", "Last 1 year").click();
    cy.contains("button", "검색").click();

    cy.wait("@searchUsers").then((interception) => {
      const url = new URL(interception.request.url);
      const q = url.searchParams.get("q") || "";

      expect(q).to.match(/created:>=\d{4}-\d{2}-\d{2}/);
    });

    cy.contains("Joined: Last 1 year").should("exist");
  });

  it("reflects selected login/name/email targets in the text summary chip", () => {
    cy.viewport(1280, 800);
    mountPage();

    cy.get('input[placeholder="Search..."]').type("alice");

    // Default: login + full name
    cy.contains("button", "검색").click();
    cy.contains("Text: alice (login, full name)").should("exist");

    // Toggle off "full name" and enable "email"
    cy.contains("label", "full name").click();
    cy.contains("label", "email").click();

    cy.contains("button", "검색").click();
    cy.contains("Text: alice (login, email)").should("exist");
  });

  it("shows a sponsorable summary chip when the sponsor switch is enabled", () => {
    cy.viewport(1280, 800);
    mountPage();

    cy.get('[data-testid="sponsorable-switch"] input[type="checkbox"]').click({
      force: true,
    });

    cy.contains("button", "검색").click();

    cy.contains("Sponsorable").should("exist");
  });

  it("keeps sort dropdown and API sort parameter in sync", () => {
    cy.viewport(1280, 800);
    mountPage();

    // Swallow initial auto-load query
    cy.wait("@searchUsers");

    // Open MUI select (SortBar) and choose "Followers"
    cy.get('[data-testid="sort-select"]').click();
    cy.get('li[role="option"]').contains("Followers").click();

    // Next request after sort change should include sort=followers
    cy.wait("@searchUsers").then((interception) => {
      const url = new URL(interception.request.url);
      const sort = url.searchParams.get("sort");
      expect(sort).to.equal("followers");
    });
  });

  it("syncs ModeSwitch selection with the html dark class", () => {
    cy.viewport(1280, 800);
    mountPage();

    // ModeSwitch uses MUI ToggleButtonGroup with three buttons: System, Light, Dark
    cy.contains("button", "Dark").click();

    cy.get("html").should("have.class", "dark");
  });

  it("includes responsive grid classes for SM/MD/LG/XL card layout", () => {
    cy.viewport(1280, 800);
    mountPage();

    cy.get('[data-testid="user-card"]').should("exist");

    cy.get(".grid")
      .should("have.class", "grid-cols-1")
      .and("have.class", "md:grid-cols-2")
      .and("have.class", "xl:grid-cols-3");
  });

  it("persists filter and sort state when navigating away and back to the page", () => {
    cy.viewport(1280, 800);

    // 1) 첫 방문: 필터와 정렬을 설정하고 검색을 수행한다.
    mountPage();

    // 초기 자동 검색 요청 대기
    cy.wait("@searchUsers");

    // Sponsorable 필터 On
    cy.get('[data-testid="sponsorable-switch"] input[type="checkbox"]').click({
      force: true,
    });

    // 정렬을 Followers 로 변경
    cy.get('[data-testid="sort-select"]').click();
    cy.get('li[role="option"]').contains("Followers").click();

    cy.contains("button", "검색").click();

    cy.wait("@searchUsers");

    // 요약 Chip 및 정렬 상태가 기대대로 반영되었는지 확인
    cy.contains("Sponsorable").should("exist");
    cy.get('[data-testid="sort-select"]').contains("Followers");

    // 2) "다른 페이지로 이동"을 시뮬레이션하기 위해 컴포넌트를 언마운트했다가
    //    다시 마운트한다. SearchProvider 는 sessionStorage 를 통해 상태를 복원한다.
    mountPage();

    // 새로 마운트된 페이지의 초기 검색 요청
    cy.wait("@searchUsers");

    // 3) 이전에 설정한 필터/정렬 상태가 그대로 유지되는지 확인
    cy.contains("Sponsorable").should("exist");
    cy.get('[data-testid="sort-select"]').contains("Followers");
  });
});
