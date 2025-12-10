import type { DateRangePreset } from "@repo/ui/components/DateRangeFilter";

export const LANGUAGE_OPTIONS = [
  "TypeScript",
  "JavaScript",
  "Python",
  "Go",
  "Rust",
  "Java",
  "C#",
  "Kotlin",
  "Swift",
  "C++",
  "Ruby",
  "PHP",
] as const;

export const LOCATION_OPTIONS = [
  "Seoul",
  "Busan",
  "Tokyo",
  "Osaka",
  "San Francisco",
  "New York",
  "Berlin",
  "London",
  "Sydney",
  "Singapore",
  "Remote",
] as const;

export const JOINED_DATE_PRESETS: DateRangePreset[] = [
  { value: "any", label: "Any time" },
  { value: "last1", label: "Last 1 year" },
  { value: "oneToThree", label: "1-3 years ago" },
  { value: "threePlus", label: "3+ years ago" },
];

export const PAGE_SIZE = 30;
