"use client";

import Box from "../primitives/Box";

import type { PropsWithChildren, ReactNode } from "react";

export interface AppShellProps extends PropsWithChildren {
  header?: ReactNode;
  footer?: ReactNode;
  maxWidthClassName?: string;
  outerMaxWidthClassName?: string;
}

const DEFAULT_MAX_WIDTH = "max-w-[1280px]";
const DEFAULT_OUTER_MAX_WIDTH = "max-w-[1440px]";

export default function AppShell({
  header,
  footer,
  children,
  maxWidthClassName = DEFAULT_MAX_WIDTH,
  outerMaxWidthClassName = DEFAULT_OUTER_MAX_WIDTH,
}: AppShellProps) {
  return (
    <Box
      component="div"
      className="min-h-screen bg-[var(--color-background-default)] text-[var(--color-text-primary)]"
    >
      <Box
        className={`mx-auto w-full px-4 py-6 sm:px-6 lg:px-8 lg:py-10 ${outerMaxWidthClassName}`}
      >
        {header ? (
          <Box className={`mx-auto w-full ${maxWidthClassName} mb-8`}>
            {header}
          </Box>
        ) : null}
        <Box component="main" className={`mx-auto w-full ${maxWidthClassName}`}>
          {children}
        </Box>
      </Box>
      {footer ? (
        <Box
          className={`mx-auto w-full px-4 pb-6 sm:px-6 lg:px-8 ${outerMaxWidthClassName}`}
        >
          {footer}
        </Box>
      ) : null}
    </Box>
  );
}
