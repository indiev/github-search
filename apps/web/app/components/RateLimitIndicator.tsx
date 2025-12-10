"use client";

import { useAppSelector, selectRateLimit } from "@repo/store";
import Chip from "@repo/ui/primitives/Chip";
import Tooltip from "@repo/ui/primitives/Tooltip";

export default function RateLimitIndicator() {
  const rate = useAppSelector(selectRateLimit);

  // Don't show if we haven't fetched anything yet (limit is null)
  if (!rate.limit) return null;

  const remaining = rate.remaining ?? 0;
  const ratio = remaining / rate.limit;
  const color: "default" | "warning" | "error" =
    ratio <= 0.2 ? "error" : ratio <= 0.5 ? "warning" : "default";

  const resetText = rate.resetAt
    ? new Date(rate.resetAt).toLocaleTimeString()
    : "-";

  return (
    <Tooltip title={`리셋 시각: ${resetText}`}>
      <Chip
        size="small"
        label={`Search quota ${remaining}/${rate.limit}`}
        color={color === "default" ? undefined : color}
        variant="outlined"
        className="ml-3"
      />
    </Tooltip>
  );
}
