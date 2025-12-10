import { mount } from "cypress/react";

import UserCard, { type UserCardData } from "./UserCard";

describe("<UserCard />", () => {
  const mockUser: UserCardData = {
    login: "testuser",
    avatarUrl: "https://example.com/avatar.png",
    type: "User",
    sponsorable: true,
    stats: {
      repositories: 10,
      followers: 20,
      joined: "2023-01-01T00:00:00Z",
    },
    location: "Seoul, Korea",
    languages: ["TypeScript", "Rust"],
    bio: "Test Bio",
    url: "https://github.com/testuser",
    name: "Test User",
  };

  it("renders user details correctly", () => {
    mount(<UserCard user={mockUser} />);

    cy.contains("testuser").should("be.visible");
    cy.contains("Test User").should("be.visible");
    cy.contains("Test Bio").should("be.visible");
    cy.contains("Seoul, Korea").should("be.visible");
    cy.contains("TypeScript").should("be.visible");
    cy.contains("Rust").should("be.visible");
    cy.contains("10 repos").should("be.visible");
    cy.contains("20 followers").should("be.visible");
    cy.contains("Joined 2023년 1월 1일").should("be.visible");
  });

  it("handles interactions", () => {
    const onLoginClick = cy.stub().as("onLoginClick");
    mount(<UserCard user={mockUser} onLoginClick={onLoginClick} />);

    cy.contains("testuser").click();
    cy.get("@onLoginClick").should("have.been.calledWith", "testuser");
  });
});
