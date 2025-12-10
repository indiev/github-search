"use client";

import {
  type PropsWithChildren,
  type ReactNode,
  useEffect,
  useRef,
} from "react";

import Box from "../primitives/Box";
import Button from "../primitives/Button";
import CircularProgress from "../primitives/CircularProgress";
import Typography from "../primitives/Typography";

export interface InfiniteScrollContainerProps extends PropsWithChildren {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  loader?: ReactNode;
  endMessage?: ReactNode;
  loadMoreLabel?: string;
  className?: string;
}

export default function InfiniteScrollContainer({
  children,
  hasMore,
  isLoading,
  onLoadMore,
  loader,
  endMessage,
  loadMoreLabel = "Load more",
  className,
}: InfiniteScrollContainerProps) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasMore) {
      return;
    }

    const sentinel = sentinelRef.current;
    if (!sentinel) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting && !isLoading) {
          onLoadMore();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, onLoadMore, isLoading]);

  return (
    <Box className={`flex flex-col gap-4 ${className ?? ""}`}>
      {children}
      <div ref={sentinelRef} aria-hidden className="h-4 w-full" />
      {isLoading
        ? (loader ?? (
            <Box className="flex justify-center py-4">
              <CircularProgress />
            </Box>
          ))
        : null}
      {!hasMore && !isLoading
        ? (endMessage ?? (
            <Typography
              variant="body2"
              color="text.secondary"
              className="text-center"
            >
              더 이상 결과가 없습니다.
            </Typography>
          ))
        : null}
      <Box className="flex justify-center py-2">
        <Button
          variant="outlined"
          disabled={!hasMore || isLoading}
          onClick={onLoadMore}
        >
          {isLoading ? "Loading" : loadMoreLabel}
        </Button>
      </Box>
    </Box>
  );
}
