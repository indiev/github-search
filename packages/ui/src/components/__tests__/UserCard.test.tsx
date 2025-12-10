import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";

import UIProvider from "../../providers/UIProvider";
import UserCard from "../UserCard";

import type { ReactNode } from "react";

function renderWithUI(children: ReactNode) {
  return render(<UIProvider>{children}</UIProvider>);
}

describe("UserCard", () => {
  it("renders key user details", () => {
    renderWithUI(
      <UserCard
        user={{
          login: "octocat",
          name: "Octo Cat",
          type: "User",
          sponsorable: true,
          stats: { repositories: 10, followers: 2000, joined: "2020-01-01" },
          languages: ["TypeScript", "Go"],
          location: "Seoul",
          bio: "OSS maintainer",
          avatarUrl: "https://avatars.githubusercontent.com/u/1?v=4",
        }}
      />,
    );

    expect(screen.getByRole("link", { name: "octocat" })).toBeInTheDocument();
    expect(screen.getByText("Octo Cat")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("Go")).toBeInTheDocument();
    expect(screen.getByText(/repos/i)).toBeInTheDocument();
  });
});
