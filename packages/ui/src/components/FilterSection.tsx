"use client";

import Collapse from "@mui/material/Collapse";
import { type PropsWithChildren, type ReactNode, useState } from "react";

import Box from "../primitives/Box";
import Typography from "../primitives/Typography";

export interface FilterSectionProps extends PropsWithChildren {
  title: string;
  description?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  footer?: ReactNode;
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-transform ${open ? "rotate-180" : ""}`}
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function FilterSection({
  title,
  description,
  children,
  collapsible = true,
  defaultExpanded = true,
  footer,
}: FilterSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const isOpen = collapsible ? expanded : true;

  return (
    <Box className="rounded-2xl border border-black/5 bg-[var(--color-background-paper)] text-[var(--color-text-primary)] shadow-sm dark:border-white/10">
      <button
        type="button"
        className={`flex w-full items-start justify-between gap-3 p-4 text-left ${
          collapsible ? "cursor-pointer" : "cursor-default"
        }`}
        onClick={() => collapsible && setExpanded((value) => !value)}
        aria-expanded={isOpen}
      >
        <Box className="space-y-1">
          <Typography variant="subtitle1">{title}</Typography>
          {description ? (
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          ) : null}
        </Box>
        {collapsible ? <ChevronIcon open={isOpen} /> : null}
      </button>
      <Collapse in={isOpen} timeout="auto" unmountOnExit>
        <Box className="border-t border-black/5 px-4 py-4 dark:border-white/10">
          <Box className="space-y-4">{children}</Box>
        </Box>
      </Collapse>
      {footer ? (
        <Box className="border-t px-4 py-3 text-sm text-[var(--color-text-secondary)]">
          {footer}
        </Box>
      ) : null}
    </Box>
  );
}
