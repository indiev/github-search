import UserCardSkeleton from "@repo/ui/components/UserCardSkeleton";
import AppShell from "@repo/ui/layouts/AppShell";
import PageHeader from "@repo/ui/layouts/PageHeader";
import SidebarLayout from "@repo/ui/layouts/SidebarLayout";
import Box from "@repo/ui/primitives/Box";

function FilterPanelSkeleton() {
  return (
    <Box className="w-full space-y-6">
      <Box className="h-12 w-full animate-pulse rounded-lg bg-black/5 dark:bg-white/5" />
      <Box className="h-px w-full bg-black/5 dark:bg-white/5" />
      <Box className="space-y-4">
        <Box className="h-8 w-2/3 animate-pulse rounded bg-black/5 dark:bg-white/5" />
        <Box className="h-32 w-full animate-pulse rounded bg-black/5 dark:bg-white/5" />
      </Box>
      <Box className="h-px w-full bg-black/5 dark:bg-white/5" />
      <Box className="space-y-4">
        <Box className="h-8 w-1/2 animate-pulse rounded bg-black/5 dark:bg-white/5" />
        <Box className="h-48 w-full animate-pulse rounded bg-black/5 dark:bg-white/5" />
      </Box>
    </Box>
  );
}

export default function Loading() {
  return (
    <AppShell
      maxWidthClassName="max-w-7xl"
      header={
        <PageHeader
          title="GitHub 사용자 검색"
          description="필터와 정렬만으로 다양한 GitHub 계정을 탐색할 수 있습니다."
          status={
            <Box className="h-8 w-40 animate-pulse rounded-full bg-black/5 dark:bg-white/5" />
          }
        />
      }
    >
      <SidebarLayout
        sidebar={<FilterPanelSkeleton />}
        drawerTitle="필터"
        toggleLabel="필터 열기"
      >
        <Box className="space-y-6">
          {/* Filter Summary Bar Skeleton */}
          <Box className="flex gap-2">
            <Box className="h-8 w-24 animate-pulse rounded-full bg-black/5 dark:bg-white/5" />
            <Box className="h-8 w-24 animate-pulse rounded-full bg-black/5 dark:bg-white/5" />
            <Box className="h-8 w-24 animate-pulse rounded-full bg-black/5 dark:bg-white/5" />
          </Box>

          {/* Sort Bar Skeleton */}
          <Box className="flex justify-between">
            <Box className="h-6 w-32 animate-pulse rounded bg-black/5 dark:bg-white/5" />
            <Box className="h-10 w-40 animate-pulse rounded bg-black/5 dark:bg-white/5" />
          </Box>

          <Box className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <UserCardSkeleton key={i} />
            ))}
          </Box>
        </Box>
      </SidebarLayout>
    </AppShell>
  );
}
