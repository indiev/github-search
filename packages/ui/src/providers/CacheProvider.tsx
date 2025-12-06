import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { type PropsWithChildren } from "react";

export default function CacheProvider(props: PropsWithChildren) {
  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      {props.children}
    </AppRouterCacheProvider>
  );
}
