"use client";

import Box from "../primitives/Box";
import Button from "../primitives/Button";
import Chip from "../primitives/Chip";
import Typography from "../primitives/Typography";

export interface SummaryChipItem {
  key: string;
  label: string;
  onRemove?: () => void;
}

export interface FilterSummaryChipsProps {
  chips: SummaryChipItem[];
  onReset?: () => void;
  resetLabel?: string;
  emptyLabel?: string;
  className?: string;
}

export default function FilterSummaryChips({
  chips,
  onReset,
  resetLabel = "필터 초기화",
  emptyLabel = "활성 필터 없음",
  className,
}: FilterSummaryChipsProps) {
  const hasFilters = chips.length > 0;

  return (
    <Box
      className={`rounded-2xl border border-black/5 bg-[var(--color-background-paper)] px-4 py-3 dark:border-white/10 ${className ?? ""}`}
    >
      <Box className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Box className="flex flex-wrap gap-2">
          {hasFilters ? null : (
            <Typography variant="body2" color="text.secondary">
              {emptyLabel}
            </Typography>
          )}
          {chips.map((chip) => (
            <Chip
              key={chip.key}
              label={chip.label}
              aria-label={chip.label}
              onClick={chip.onRemove}
              onDelete={chip.onRemove}
              clickable={Boolean(chip.onRemove)}
              deleteIcon={
                chip.onRemove ? <span aria-hidden>x</span> : undefined
              }
              variant="outlined"
              size="small"
            />
          ))}
        </Box>
        {onReset ? (
          <Button
            size="small"
            variant="text"
            color="primary"
            onClick={onReset}
            disabled={!hasFilters}
          >
            {resetLabel}
          </Button>
        ) : null}
      </Box>
    </Box>
  );
}
