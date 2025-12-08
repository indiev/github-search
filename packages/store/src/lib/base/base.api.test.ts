import { describe, expect, it } from "@jest/globals";

import { baseAPI } from "./base.api";

describe("baseAPI", () => {
  it("exposes a stable configuration", () => {
    expect(baseAPI.reducerPath).toBe("api");
    expect(typeof baseAPI.reducer).toBe("function");
    expect(typeof baseAPI.middleware).toBe("function");
  });

  it("allows injecting endpoints for feature slices", () => {
    const enhancedApi = baseAPI.injectEndpoints({
      endpoints: (build) => ({
        example: build.query<number, void>({
          query: () => "health-check",
        }),
      }),
    });

    expect(enhancedApi.endpoints.example).toBeDefined();
  });
});
