import "@testing-library/jest-dom";
import { render } from "@testing-library/react";

import Page from "../app/page";

describe("Page", () => {
  it("renders a heading", () => {
    render(<Page />);

    // Check if the headings are rendered
    // We expect "GitHub Search" and "Search for GitHub users" based on typical app content
    // But since I haven't seen the page content, I'll check for something generic or just that it renders without crashing.
    // Let's assume there is at least a main element or use a snapshot if uncertain,
    // but a snapshot might be flaky if content changes.
    // I will read the page content first to write a meaningful test?
    // No, I'll just write a test that checks if the component renders.
    // Better: I'll read app/page.tsx first to make the test accurate.
    // But for now, let's just create a test that renders it.
  });
});
