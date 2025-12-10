"use client";

import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

import Box from "../primitives/Box";

import type { MouseEvent } from "react";

export interface SegmentedOption {
  value: string;
  label: string;
}

export interface SegmentedControlProps {
  options: SegmentedOption[];
  value: string;
  onChange: (value: string) => void;
  size?: "small" | "medium";
  fullWidth?: boolean;
  className?: string;
}

export default function SegmentedControl({
  options,
  value,
  onChange,
  size = "small",
  fullWidth,
  className,
}: SegmentedControlProps) {
  const handleChange = (
    _: MouseEvent<HTMLElement>,
    nextValue: string | null,
  ) => {
    if (!nextValue) {
      return;
    }
    onChange(nextValue);
  };

  return (
    <Box className={className}>
      <ToggleButtonGroup
        value={value}
        exclusive
        onChange={handleChange}
        size={size}
        fullWidth={fullWidth}
      >
        {options.map((option) => (
          <ToggleButton key={option.value} value={option.value}>
            {option.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
}
