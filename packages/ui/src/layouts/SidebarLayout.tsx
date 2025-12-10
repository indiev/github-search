"use client";

import Drawer from "@mui/material/Drawer";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import {
  type PropsWithChildren,
  type ReactNode,
  useState,
  useEffect,
} from "react";

import Box from "../primitives/Box";
import Button from "../primitives/Button";
import Typography from "../primitives/Typography";

export interface SidebarLayoutProps extends PropsWithChildren {
  sidebar: ReactNode;
  drawerTitle?: string;
  toggleLabel?: string;
  sidebarWidth?: number;
}

export default function SidebarLayout({
  sidebar,
  children,
  drawerTitle = "필터",
  toggleLabel = "필터 열기",
  sidebarWidth = 300,
}: SidebarLayoutProps) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"), {
    noSsr: true,
    defaultMatches: true,
  });
  const [open, setOpen] = useState(false);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    setWidth(window.innerWidth);
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleDrawer =
    (newOpen: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === "keydown" &&
        ((event as React.KeyboardEvent).key === "Tab" ||
          (event as React.KeyboardEvent).key === "Shift")
      ) {
        return;
      }
      setOpen(newOpen);
    };

  if (isDesktop) {
    return (
      <Box className="grid h-full min-h-screen w-full lg:grid-cols-[320px_minmax(0,1fr)]">
        <span data-testid="layout-mode" style={{ display: "none" }}>
          DESKTOP:{width}
        </span>
        <Box className="w-80 border-r border-divider bg-[var(--color-background-paper)] p-6 dark:bg-[var(--color-background-default)]">
          {sidebar}
        </Box>
        <Box className="flex-1 overflow-x-hidden p-6 lg:p-10">{children}</Box>
      </Box>
    );
  }

  return (
    <Box className="min-h-screen w-full">
      <span data-testid="layout-mode" style={{ display: "none" }}>
        MOBILE:{width}
      </span>
      <Box className="p-4 sm:p-6 lg:p-8">
        <Box className="mb-4 flex justify-end">
          <Button variant="outlined" onClick={toggleDrawer(true)} size="small">
            {toggleLabel}
          </Button>
        </Box>
      </Box>
      <Drawer
        open={open}
        onClose={toggleDrawer(false)}
        PaperProps={{ sx: { width: sidebarWidth } }}
      >
        <Box className="flex items-center justify-between border-b border-black/5 px-4 py-3 dark:border-white/10">
          <Typography variant="subtitle1">{drawerTitle}</Typography>
          <Button variant="text" size="small" onClick={() => setOpen(false)}>
            닫기
          </Button>
        </Box>
        <Box className="p-4 overflow-y-auto" sx={{ height: "100%" }}>
          {sidebar}
        </Box>
      </Drawer>
      <Box className="space-y-6">{children}</Box>
    </Box>
  );
}
