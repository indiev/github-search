"use client";

import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

import Box from "../primitives/Box";
import TextField from "../primitives/TextField";
import Typography from "../primitives/Typography";

import type { MouseEvent } from "react";

export interface DateRangePreset {
  value: string;
  label: string;
}

export interface DateRangeValue {
  preset: string;
  from?: string | null;
  to?: string | null;
}

export interface DateRangeFilterProps {
  label: string;
  presets: DateRangePreset[];
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  helperText?: string;
  allowCustomRange?: boolean;
  fromLabel?: string;
  toLabel?: string;
}

export default function DateRangeFilter({
  label,
  presets,
  value,
  onChange,
  helperText,
  allowCustomRange = true,
  fromLabel = "시작일",
  toLabel = "종료일",
}: DateRangeFilterProps) {
  const handlePresetChange = (
    _: MouseEvent<HTMLElement>,
    nextPreset: string | null,
  ) => {
    if (!nextPreset) {
      return;
    }

    onChange({
      ...value,
      preset: nextPreset,
    });
  };

  const handleDateChange = (key: "from" | "to", nextValue: string) => {
    onChange({
      ...value,
      [key]: nextValue,
    });
  };

  const showCustomInputs = allowCustomRange && value.preset === "custom";

  return (
    <Box className="space-y-3">
      <Typography variant="subtitle2" color="text.secondary">
        {label}
      </Typography>
      <ToggleButtonGroup
        value={value.preset}
        exclusive
        onChange={handlePresetChange}
        size="small"
        sx={{ flexWrap: "wrap", gap: 1 }}
      >
        {presets.map((preset) => (
          <ToggleButton
            key={preset.value}
            value={preset.value}
            className="uppercase"
          >
            {preset.label}
          </ToggleButton>
        ))}
        {allowCustomRange ? (
          <ToggleButton value="custom">Custom</ToggleButton>
        ) : null}
      </ToggleButtonGroup>
      {showCustomInputs ? (
        <Box className="grid gap-2 sm:grid-cols-2">
          <TextField
            type="date"
            label={fromLabel}
            size="small"
            value={value.from ?? ""}
            onChange={(event) => handleDateChange("from", event.target.value)}
          />
          <TextField
            type="date"
            label={toLabel}
            size="small"
            value={value.to ?? ""}
            onChange={(event) => handleDateChange("to", event.target.value)}
          />
        </Box>
      ) : null}
      {helperText ? (
        <Typography variant="caption" color="text.secondary">
          {helperText}
        </Typography>
      ) : null}
    </Box>
  );
}
