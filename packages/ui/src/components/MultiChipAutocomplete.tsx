"use client";

import Autocomplete from "@mui/material/Autocomplete";
import Chip from "@mui/material/Chip";

import TextField from "../primitives/TextField";

import type { AutocompleteRenderInputParams } from "@mui/material/Autocomplete";
import type { SyntheticEvent } from "react";

export interface MultiChipAutocompleteProps {
  label: string;
  placeholder?: string;
  options: string[];
  value: string[];
  onChange: (next: string[]) => void;
  helperText?: string;
  freeSolo?: boolean;
}

export default function MultiChipAutocomplete({
  label,
  placeholder,
  options,
  value,
  onChange,
  helperText,
  freeSolo = true,
}: MultiChipAutocompleteProps) {
  const handleChange = (_event: SyntheticEvent, newValue: string[]) => {
    const deduped = Array.from(
      new Set(newValue.map((option) => option.trim())),
    ).filter(Boolean);
    onChange(deduped);
  };

  return (
    <Autocomplete
      multiple
      freeSolo={freeSolo}
      options={options}
      value={value}
      onChange={handleChange}
      filterSelectedOptions
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => (
          <Chip
            {...getTagProps({ index })}
            key={option}
            label={option}
            size="small"
          />
        ))
      }
      renderInput={(params: AutocompleteRenderInputParams) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          helperText={helperText}
          size="small"
        />
      )}
    />
  );
}
