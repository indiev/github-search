"use client";

import {
  FilterList as FilterListIcon,
  RestartAlt as RestartAltIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { useId, useState, type ReactNode } from "react";

import DateRangeFilter from "@repo/ui/components/DateRangeFilter";
import type { DateRangePreset } from "@repo/ui/components/DateRangeFilter";
import MultiChipAutocomplete from "@repo/ui/components/MultiChipAutocomplete";
import NumberRangeFilter from "@repo/ui/components/NumberRangeFilter";
import SegmentedControl from "@repo/ui/components/SegmentedControl";
import Box from "@repo/ui/primitives/Box";
import Button from "@repo/ui/primitives/Button";
import Card from "@repo/ui/primitives/Card";
import Checkbox from "@repo/ui/primitives/Checkbox";
import Chip from "@repo/ui/primitives/Chip";
import Collapse from "@repo/ui/primitives/Collapse";
import Divider from "@repo/ui/primitives/Divider";
import FormControlLabel from "@repo/ui/primitives/FormControlLabel";
import IconButton from "@repo/ui/primitives/IconButton";
import Switch from "@repo/ui/primitives/Switch";
import TextField from "@repo/ui/primitives/TextField";
import Typography from "@repo/ui/primitives/Typography";

import { TEXT_FIELD_LABELS, formatNumberRangeSummary } from "./filterUtils";
import { type FilterState, type TypeFilterValue } from "./types";

export interface FilterPanelProps {
  value: FilterState;
  onChange: (next: FilterState) => void;
  onApply: () => void;
  onReset: () => void;
  languageOptions: readonly string[];
  locationOptions: readonly string[];
  joinedPresets: DateRangePreset[];
  loading?: boolean;
}

export default function FilterPanel({
  value: filters,
  onChange,
  onApply,
  onReset,
  languageOptions,
  locationOptions,
  joinedPresets,
  loading,
}: FilterPanelProps) {
  const [showAdvanced, setShowAdvanced] = useState(true);

  const sponsorableLabelId = useId();
  const sponsorableSwitchId = useId();

  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K],
  ) => {
    console.log("FilterPanel: updateFilter", key, value);
    onChange({
      ...filters,
      [key]: value,
    });
  };

  const handleTextFieldToggle = (
    key: keyof FilterState["textFields"],
    checked: boolean,
  ) => {
    updateFilter("textFields", {
      ...filters.textFields,
      [key]: checked,
    });
  };

  const typeOptions = [
    { label: "USER", value: "user" },
    { label: "ORG", value: "org" },
  ];

  return (
    <Card className="flex flex-col gap-6 overflow-hidden rounded-3xl border border-divider bg-[var(--color-background-paper)] p-0 shadow-xl backdrop-blur-xl transition-all duration-300">
      {/* Header Section */}
      <Box className="flex items-center justify-between border-b border-divider px-6 py-5 bg-[var(--color-background-default)]">
        <Box className="flex items-center gap-2">
          <FilterListIcon className="text-indigo-500" />
          <Typography
            variant="h6"
            className="font-bold text-[var(--color-text-primary)]"
          >
            Search Filters
          </Typography>
        </Box>
        <IconButton
          onClick={onReset}
          size="small"
          className="text-[var(--color-text-secondary)] hover:text-indigo-500 transition-colors"
        >
          <RestartAltIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box className="flex flex-col gap-6 px-6 pb-6">
        {/* Core Filters */}
        <Box className="space-y-5">
          <PanelSection title="User Type" noDivider>
            <SegmentedControl
              options={typeOptions}
              value={filters.type || "user"}
              onChange={(val) => updateFilter("type", val as TypeFilterValue)}
              fullWidth
              className="bg-[var(--color-background-default)] p-1"
            />
          </PanelSection>

          <PanelSection title="Keywords" noDivider>
            <TextField
              placeholder="Search..."
              size="small"
              fullWidth
              value={filters.text}
              onChange={(event) => updateFilter("text", event.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onApply();
                }
              }}
              className="[&_.MuiOutlinedInput-root]:rounded-xl [&_.MuiOutlinedInput-root]:bg-[var(--color-background-default)]"
            />
            {/* Debug element removed as we trust the flow now, or keep it if needed later */}

            <div className="mt-3 grid grid-cols-2 gap-2">
              {(
                Object.keys(filters.textFields) as Array<
                  keyof FilterState["textFields"]
                >
              ).map((key) => (
                <FormControlLabel
                  key={key}
                  control={
                    <Checkbox
                      checked={filters.textFields[key]}
                      onChange={(event) =>
                        handleTextFieldToggle(key, event.target.checked)
                      }
                      size="small"
                      className="text-slate-400 dark:text-slate-500 [&.Mui-checked]:text-indigo-500"
                    />
                  }
                  label={
                    <Typography
                      variant="body2"
                      className="text-[var(--color-text-secondary)]"
                    >
                      {TEXT_FIELD_LABELS[key]}
                    </Typography>
                  }
                  className="m-0"
                />
              ))}
            </div>
          </PanelSection>

          <Box className="flex items-center justify-between rounded-xl border border-indigo-100 bg-indigo-50/50 px-4 py-3 dark:border-indigo-900/30 dark:bg-indigo-900/10">
            <Box id={sponsorableLabelId} className="flex flex-col">
              <Typography
                variant="subtitle2"
                className="font-semibold text-indigo-900 dark:text-indigo-100"
              >
                GitHub Sponsors Only
              </Typography>
              <Typography
                variant="caption"
                className="text-indigo-600/80 dark:text-indigo-300/60"
              >
                Support content creators
              </Typography>
            </Box>
            <Switch
              checked={filters.sponsorableOnly}
              onChange={(event) =>
                updateFilter("sponsorableOnly", event.target.checked)
              }
              inputProps={{
                id: sponsorableSwitchId,
                "aria-labelledby": sponsorableLabelId,
              }}
              color="primary"
              data-testid="sponsorable-switch"
            />
          </Box>
        </Box>

        <Button
          fullWidth
          variant="contained"
          size="large"
          className="rounded-xl py-3 font-bold shadow-lg"
          onClick={onApply}
          startIcon={<SearchIcon />}
          disabled={loading}
        >
          {loading ? "검색 중..." : "검색"}
        </Button>

        <Divider className="border-dashed border-divider" />

        {/* Advanced Filters Toggle */}
        <Button
          fullWidth
          variant="text"
          onClick={() => setShowAdvanced((prev) => !prev)}
          endIcon={showAdvanced ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          className="justify-between rounded-xl py-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-action-hover)]"
        >
          <Typography variant="subtitle2" className="font-semibold">
            Advanced Filters
          </Typography>
          <Typography
            variant="caption"
            className="text-[var(--color-text-disabled)]"
          >
            {summaryLabel(filters)}
          </Typography>
        </Button>

        {/* Collapsible Advanced Section */}
        <Collapse in={showAdvanced} timeout="auto" unmountOnExit>
          <Box className="space-y-6 pt-2">
            <PanelSection
              title="Repositories"
              summary={formatNumberRangeSummary(filters.repoCount, "repos")}
            >
              <NumberRangeFilter
                value={filters.repoCount}
                onChange={(val) => updateFilter("repoCount", val)}
                slider={{ min: 0, max: 400, step: 5 }}
                valueFormatter={(val) => (val ?? 0).toLocaleString()}
              />
            </PanelSection>

            <PanelSection
              title="Followers"
              summary={formatNumberRangeSummary(
                filters.followerCount,
                "followers",
              )}
            >
              <NumberRangeFilter
                value={filters.followerCount}
                onChange={(val) => updateFilter("followerCount", val)}
                slider={{ min: 0, max: 20000, step: 100 }}
                valueFormatter={(val) => (val ?? 0).toLocaleString()}
              />
            </PanelSection>

            <PanelSection title="Location">
              <MultiChipAutocomplete
                label="Location"
                placeholder="City, Country..."
                options={locationOptions as string[]}
                value={filters.locations}
                onChange={(val) => updateFilter("locations", val)}
              />
            </PanelSection>

            <PanelSection title="Languages">
              <MultiChipAutocomplete
                label="Languages"
                placeholder="Select languages..."
                options={languageOptions as string[]}
                value={filters.languages}
                onChange={(val) => updateFilter("languages", val)}
              />
            </PanelSection>

            <PanelSection title="Joined Date" noDivider>
              <DateRangeFilter
                label="Date Range"
                presets={joinedPresets}
                value={filters.joined}
                onChange={(val) => updateFilter("joined", val)}
              />
            </PanelSection>
          </Box>
        </Collapse>
      </Box>
    </Card>
  );
}

function PanelSection({
  title,
  summary,
  children,
  noDivider = false,
}: {
  title: string;
  summary?: string | null;
  children: ReactNode;
  noDivider?: boolean;
}) {
  return (
    <Box className="space-y-3">
      <Box className="flex items-center justify-between">
        <Typography
          variant="subtitle2"
          className="font-semibold text-[var(--color-text-primary)]"
        >
          {title}
        </Typography>
        {summary && (
          <Chip
            label={summary}
            size="small"
            variant="outlined"
            className="h-6 border-divider text-xs text-[var(--color-text-secondary)]"
          />
        )}
      </Box>
      <Box>{children}</Box>
      {!noDivider && (
        <div className="border-b border-dashed border-divider pt-1" />
      )}
    </Box>
  );
}

function summaryLabel(filters: FilterState) {
  const activeCount =
    (filters.repoCount ? 1 : 0) +
    (filters.followerCount ? 1 : 0) +
    (filters.locations.length ? 1 : 0) +
    (filters.languages.length ? 1 : 0) +
    (filters.joined ? 1 : 0);

  return activeCount > 0 ? `${activeCount} active` : "";
}
