"use client";

import Slider from "@mui/material/Slider";
import { type ChangeEvent } from "react";

import Box from "../primitives/Box";
import MenuItem from "../primitives/MenuItem";
import TextField from "../primitives/TextField";
import Typography from "../primitives/Typography";

import type { SelectChangeEvent } from "@mui/material/Select";

export type NumberRangeOperator = "eq" | "gte" | "lte" | "between";

export type NumberRangeValue =
  | {
      operator: "eq" | "gte" | "lte";
      value: number | null;
    }
  | {
      operator: "between";
      value: {
        min: number | null;
        max: number | null;
      };
    };

export interface NumberRangeFilterProps {
  label?: string;
  value: NumberRangeValue;
  onChange: (value: NumberRangeValue) => void;
  helperText?: string;
  slider?: {
    min: number;
    max: number;
    step?: number;
  };
  minLabel?: string;
  maxLabel?: string;
  valueFormatter?: (value: number | null) => string;
}

const operatorOptions: { value: NumberRangeOperator; label: string }[] = [
  { value: "eq", label: "=" },
  { value: "gte", label: ">=" },
  { value: "lte", label: "<=" },
  { value: "between", label: "Between" },
];

export default function NumberRangeFilter({
  label,
  value,
  onChange,
  helperText,
  slider,
  minLabel = "최솟값",
  maxLabel = "최댓값",
  valueFormatter,
}: NumberRangeFilterProps) {
  const isBetween = value.operator === "between";

  const singleValue = !isBetween ? value.value : null;
  const betweenValue = isBetween
    ? value.value
    : {
        min: null,
        max: null,
      };

  const handleOperatorChange = (
    event: SelectChangeEvent<NumberRangeOperator>,
  ) => {
    const nextOperator = event.target.value as NumberRangeOperator;
    if (nextOperator === "between") {
      onChange({ operator: "between", value: { min: null, max: null } });
      return;
    }

    onChange({ operator: nextOperator, value: singleValue ?? null });
  };

  const handleSingleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = parseNumber(event.target.value);
    if (value.operator === "between") {
      return;
    }
    onChange({ operator: value.operator, value: nextValue });
  };

  const handleBetweenChange = (
    key: "min" | "max",
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    if (value.operator !== "between") {
      return;
    }
    const nextValue = parseNumber(event.target.value);
    onChange({
      operator: "between",
      value: {
        ...value.value,
        [key]: nextValue,
      },
    });
  };

  const handleSliderChange = (_: Event, newValue: number | number[]) => {
    if (!slider) {
      return;
    }

    if (Array.isArray(newValue)) {
      onChange({
        operator: "between",
        value: {
          min: newValue[0] ?? null,
          max: newValue[1] ?? null,
        },
      });
      return;
    }

    if (value.operator === "between") {
      onChange({
        operator: "between",
        value: {
          min: newValue,
          max: newValue,
        },
      });
      return;
    }

    onChange({
      operator: value.operator,
      value: newValue,
    });
  };

  const sliderValue = (() => {
    if (!slider) {
      return null;
    }

    if (value.operator === "between") {
      return [value.value.min ?? slider.min, value.value.max ?? slider.max];
    }

    return value.value ?? slider.min;
  })();

  const summaryLabel = formatSummary(value, valueFormatter);

  return (
    <Box className="space-y-3">
      {label ? (
        <Box className="flex items-center justify-between gap-4">
          <Typography variant="subtitle2">{label}</Typography>
          <Typography variant="caption" color="text.secondary">
            {summaryLabel}
          </Typography>
        </Box>
      ) : null}
      <TextField
        select
        fullWidth
        size="small"
        label="비교 연산자"
        value={value.operator}
        onChange={
          handleOperatorChange as unknown as (
            event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
          ) => void
        }
      >
        {operatorOptions.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
      {isBetween ? (
        <Box className="grid gap-3 sm:grid-cols-2">
          <TextField
            type="number"
            label={minLabel}
            size="small"
            value={betweenValue.min ?? ""}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              handleBetweenChange("min", event)
            }
          />
          <TextField
            type="number"
            label={maxLabel}
            size="small"
            value={betweenValue.max ?? ""}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              handleBetweenChange("max", event)
            }
          />
        </Box>
      ) : (
        <TextField
          type="number"
          label="값"
          size="small"
          value={singleValue ?? ""}
          onChange={handleSingleChange}
        />
      )}
      {slider ? (
        <>
          <Slider
            value={sliderValue ?? slider.min}
            onChange={handleSliderChange}
            min={slider.min}
            max={slider.max}
            step={slider.step ?? 1}
            valueLabelDisplay="auto"
            aria-label={label ?? "범위"}
          />
          <Box className="flex w-full justify-between text-xs text-[var(--color-text-secondary)]">
            <span>{slider.min}</span>
            <span>
              {value.operator === "between"
                ? `${value.value.min ?? slider.min} - ${value.value.max ?? slider.max}`
                : (singleValue ?? slider.min)}
            </span>
            <span>{slider.max}+</span>
          </Box>
        </>
      ) : null}
      {helperText ? (
        <Typography variant="caption" color="text.secondary">
          {helperText}
        </Typography>
      ) : null}
    </Box>
  );
}

function parseNumber(value: string): number | null {
  if (value === "") {
    return null;
  }

  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    return null;
  }

  return parsed;
}

function formatSummary(
  value: NumberRangeValue,
  formatter?: (val: number | null) => string,
) {
  if (value.operator === "between") {
    const min = formatter
      ? formatter(value.value.min)
      : (value.value.min ?? "0");
    const max = formatter
      ? formatter(value.value.max)
      : (value.value.max ?? "∞");
    return `Between ${min} - ${max}`;
  }

  if (value.value === null) {
    return "모든 값";
  }

  const formatted = formatter ? formatter(value.value) : value.value;
  switch (value.operator) {
    case "gte":
      return `≥ ${formatted}`;
    case "lte":
      return `≤ ${formatted}`;
    case "eq":
      return `= ${formatted}`;
    default:
      return String(formatted);
  }
}
