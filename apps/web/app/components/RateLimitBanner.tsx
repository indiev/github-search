"use client";

import { useEffect, useState } from "react";

import {
  useAppDispatch,
  useAppSelector,
  retryCleared,
  retryCancelled,
  selectRateLimit,
} from "@repo/store";
import Alert from "@repo/ui/primitives/Alert";
import Button from "@repo/ui/primitives/Button";
import Snackbar from "@repo/ui/primitives/Snackbar";

interface RateLimitBannerProps {
  onManualRetry: () => void;
}

export default function RateLimitBanner({
  onManualRetry,
}: RateLimitBannerProps) {
  const dispatch = useAppDispatch();
  const rate = useAppSelector(selectRateLimit);
  const [remainingSeconds, setRemainingSeconds] = useState(() => {
    if (!rate.pendingRetryAt) return 0;
    const pendingTs = new Date(rate.pendingRetryAt).getTime();
    const diffMs = pendingTs - Date.now();
    const initial = Math.max(0, Math.round(diffMs / 1000));
    return initial;
  });

  useEffect(() => {
    if (!rate.pendingRetryAt) {
      setRemainingSeconds(0);
      return;
    }

    const pendingTs = new Date(rate.pendingRetryAt).getTime();
    const diffMs = pendingTs - Date.now();
    const initial = Math.max(0, Math.round(diffMs / 1000));
    setRemainingSeconds(initial);

    const id = setInterval(() => {
      setRemainingSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(id);
  }, [rate.pendingRetryAt]);

  const diffSec = remainingSeconds;

  const countdownText =
    diffSec > 0 ? `${diffSec}초 후 자동 재시도` : "지금 재시도할 수 있습니다";

  const handleManualRetry = () => {
    dispatch(retryCleared());
    onManualRetry();
  };

  const handleCancelRetry = () => {
    dispatch(retryCancelled());
  };

  const isQuotaExhausted = rate.remaining === 0;
  const isSecondaryLimit =
    !isQuotaExhausted && (rate.isLimited || !!rate.pendingRetryAt);

  const title = isQuotaExhausted
    ? "기본 쿼터(30회)를 모두 사용했습니다."
    : "일시적인 요청 제한(Secondary Rate Limit)입니다.";

  const description = isSecondaryLimit
    ? "짧은 시간 내 너무 많은 요청이 발생하여 잠시 대기합니다."
    : `쿼터는 ${new Date(rate.resetAt || "").toLocaleTimeString()}에 초기화됩니다.`;

  const isOpen = isQuotaExhausted || isSecondaryLimit;

  return (
    <Snackbar
      open={isOpen}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert severity="error">
        <div className="flex w-full flex-col items-start justify-between gap-4 md:flex-row md:items-center md:gap-6">
          <div className="flex-1">
            <div className="font-semibold">{title}</div>
            <div className="text-sm opacity-80">
              {description}
              <br />
              {countdownText} · 남은 쿼터: {rate.remaining ?? 0} /{" "}
              {rate.limit ?? "?"} (리소스: {rate.resource})
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {diffSec > 0 && (
              <Button
                size="small"
                variant="outlined"
                onClick={handleCancelRetry}
              >
                자동 재시도 취소
              </Button>
            )}
            <Button
              size="small"
              variant="contained"
              disabled={diffSec > 0}
              onClick={handleManualRetry}
            >
              지금 다시 시도
            </Button>
          </div>
        </div>
      </Alert>
    </Snackbar>
  );
}
