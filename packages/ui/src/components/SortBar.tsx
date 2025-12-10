"use client";

import Box from "../primitives/Box";
import MenuItem from "../primitives/MenuItem";
import TextField from "../primitives/TextField";
import Typography from "../primitives/Typography";

import type { SelectChangeEvent } from "@mui/material/Select";

export interface SortOption {
  label: string;
  value: string;
}

export interface SortBarProps {
  label?: string;
  value: string;
  options: SortOption[];
  onChange: (value: string) => void;
  resultCount?: number;
  metaLabel?: string;
  className?: string;
}

export default function SortBar({
  label = "정렬",
  value,
  options,
  onChange,
  resultCount,
  metaLabel,
  className,
}: SortBarProps) {
  const handleChange = (event: SelectChangeEvent<string>) => {
    onChange(event.target.value);
  };

  return (
    <Box
      className={`rounded-2xl border border-black/5 bg-(--color-background-paper) px-4 py-3 dark:border-white/10 ${className ?? ""}`}
    >
      <Box className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <TextField
          select
          label={label}
          size="small"
          value={value}
          onChange={
            handleChange as unknown as (
              event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
            ) => void
          }
          sx={{ minWidth: 220 }}
          SelectProps={{
            SelectDisplayProps: {
              "data-testid": "sort-select",
            } as unknown as React.HTMLAttributes<HTMLDivElement>,
          }}
        >
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
        <Typography variant="body2" color="text.secondary">
          {metaLabel ??
            (resultCount !== undefined ? `총 ${resultCount}명` : "정렬 기준")}
        </Typography>
      </Box>
    </Box>
  );
}
