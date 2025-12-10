import { NextResponse, type NextRequest } from "next/server";

import { GitHubAPIError } from "../../../../../lib/api-client";
import { searchUsers } from "../../../../../lib/user-repository";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q");
  const page = url.searchParams.get("page") || "1";
  const per_page = url.searchParams.get("per_page") || "30";
  const sort = url.searchParams.get("sort") || undefined;
  const order = url.searchParams.get("order") || undefined;

  if (!q) {
    return NextResponse.json(
      { error: "Query parameter 'q' is required" },
      { status: 400 },
    );
  }

  try {
    const result = await searchUsers({
      q,
      page: parseInt(page, 10),
      per_page: parseInt(per_page, 10),
      sort,
      order,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("GitHub API Error:", error);

    if (error instanceof GitHubAPIError) {
      return NextResponse.json(
        {
          error: "GITHUB_API_ERROR",
          message: error.message,
          data: error.data,
          rateLimit: error.rateLimit,
        },
        { status: error.status },
      );
    }

    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 },
    );
  }
}
