import "server-only";

export const GITHUB_API_BASE = "https://api.github.com";

export interface RateLimit {
  limit: number;
  remaining: number;
  reset: number;
  used: number;
}

export class GitHubAPIError extends Error {
  status: number;
  rateLimit?: RateLimit;
  data: unknown;

  constructor(
    message: string,
    status: number,
    data: unknown,
    rateLimit?: RateLimit,
  ) {
    super(message);
    this.name = "GitHubAPIError";
    this.status = status;
    this.data = data;
    this.rateLimit = rateLimit;
  }
}

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export function parseRateLimitHeaders(headers: Headers): RateLimit | undefined {
  const limit = headers.get("x-ratelimit-limit");
  const remaining = headers.get("x-ratelimit-remaining");
  const reset = headers.get("x-ratelimit-reset");
  const used = headers.get("x-ratelimit-used");

  if (limit && remaining && reset) {
    return {
      limit: parseInt(limit, 10),
      remaining: parseInt(remaining, 10),
      reset: parseInt(reset, 10),
      used: used ? parseInt(used, 10) : 0,
    };
  }
  return undefined;
}

export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = 3,
  initialDelay = 1000,
): Promise<Response> {
  const MAX_WAIT_MS = 10000; // Max wait time of 10 seconds

  for (let i = 0; i < retries; i++) {
    const response = await fetch(url, options);

    if (response.ok) {
      return response;
    }

    // 429 (Too Many Requests) -> expose rich error immediately without retrying
    if (response.status === 429) {
      const rateLimit = parseRateLimitHeaders(response.headers);
      const errorData = await response.json().catch(() => ({}));
      throw new GitHubAPIError(
        `GitHub API fetch failed: ${response.status}`,
        response.status,
        errorData,
        rateLimit,
      );
    }

    if (response.status === 403) {
      const rateLimit = parseRateLimitHeaders(response.headers);
      const retryAfter = response.headers.get("retry-after");

      if (retryAfter) {
        const waitMs = parseInt(retryAfter, 10) * 1000;
        // If wait time is too long or we are out of retries, throw
        if (waitMs > MAX_WAIT_MS || i === retries - 1) {
          const errorData = await response.json().catch(() => ({}));
          console.log(errorData);
          throw new GitHubAPIError(
            `GitHub API fetch failed: ${response.status}`,
            response.status,
            errorData,
            rateLimit,
          );
        }

        console.warn(
          `Rate limit hit. Waiting ${waitMs}ms before retry ${i + 1}/${retries}`,
        );
        await sleep(waitMs);
        continue;
      }

      let waitMs = initialDelay * Math.pow(2, i); // Exponential backoff

      if (rateLimit && typeof rateLimit.reset === "number") {
        const resetMs = rateLimit.reset * 1000;
        const nowMs = Date.now();

        if (resetMs > nowMs) {
          // Reset is in the future: wait until reset, capped by MAX_WAIT_MS
          waitMs = resetMs - nowMs;
        } else {
          // Reset is in the past. If it is far in the past, treat as a fatal error
          const timeSinceReset = nowMs - resetMs;
          if (timeSinceReset > MAX_WAIT_MS || i === retries - 1) {
            const errorData = await response.json().catch(() => ({}));
            throw new GitHubAPIError(
              `GitHub API fetch failed: ${response.status}`,
              response.status,
              errorData,
              rateLimit,
            );
          }
        }
      }

      // If wait time is too long or we are out of retries, throw
      if (waitMs > MAX_WAIT_MS || i === retries - 1) {
        const errorData = await response.json().catch(() => ({}));
        console.log(errorData);
        throw new GitHubAPIError(
          `GitHub API fetch failed: ${response.status}`,
          response.status,
          errorData,
          rateLimit,
        );
      }

      console.warn(
        `Rate limit hit. Waiting ${waitMs}ms before retry ${i + 1}/${retries}`,
      );
      await sleep(waitMs);
      continue;
    }

    // For other errors, throw immediately
    const errorData = await response.json().catch(() => ({}));
    throw new GitHubAPIError(
      `GitHub API fetch failed: ${response.status}`,
      response.status,
      errorData,
      parseRateLimitHeaders(response.headers),
    );
  }

  throw new Error("Unreachable");
}
