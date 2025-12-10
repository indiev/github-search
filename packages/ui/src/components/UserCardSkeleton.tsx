"use client";

import Box from "../primitives/Box";
import Card from "../primitives/Card";
import Skeleton from "../primitives/Skeleton";

export default function UserCardSkeleton() {
  return (
    <Card className="rounded-2xl border border-black/5 bg-[var(--color-background-paper)] p-5 dark:border-white/10">
      <Box className="flex items-start gap-3">
        <Skeleton variant="circular" width={48} height={48} />
        <Box className="flex-1 space-y-3">
          <Skeleton variant="text" height={24} width="50%" />
          <Skeleton variant="text" height={16} width="70%" />
          <Skeleton variant="text" height={14} width="60%" />
          <Skeleton variant="rectangular" height={20} />
        </Box>
      </Box>
    </Card>
  );
}
