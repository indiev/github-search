"use client";

import Box from "../primitives/Box";
import Typography from "../primitives/Typography";

import type { ReactNode } from "react";

export interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  status?: ReactNode;
  className?: string;
}

export default function PageHeader({
  title,
  description,
  actions,
  status,
  className,
}: PageHeaderProps) {
  return (
    <Box
      component="header"
      className={`border-b border-black/5 pb-6 dark:border-white/10 ${className ?? ""}`}
    >
      <Box className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <Box className="flex-1 space-y-2">
          <Typography variant="h4" component="h1">
            {title}
          </Typography>
          {description ? (
            <Typography
              variant="body1"
              color="text.secondary"
              className="max-w-2xl"
            >
              {description}
            </Typography>
          ) : null}
        </Box>
        <Box className="flex flex-col gap-2 text-right">
          {status}
          {actions}
        </Box>
      </Box>
    </Box>
  );
}
