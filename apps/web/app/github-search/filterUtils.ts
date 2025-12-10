import type { DateRangeValue } from "@repo/ui/components/DateRangeFilter";
import type { NumberRangeValue } from "@repo/ui/components/NumberRangeFilter";

import type {
  FilterState,
  GitHubUser,
  SortValue,
  TypeFilterValue,
} from "./types";

const MILLISECONDS_PER_YEAR = 1000 * 60 * 60 * 24 * 365;
const numberFormatter = new Intl.NumberFormat();

export const TEXT_FIELD_LABELS: Record<
  keyof FilterState["textFields"],
  string
> = {
  login: "login",
  name: "full name",
  email: "email",
};

export function createEmptyNumberRange(): NumberRangeValue {
  return {
    operator: "between",
    value: {
      min: null,
      max: null,
    },
  };
}

export function buildInitialFilterState(): FilterState {
  return {
    type: "user",
    sponsorableOnly: false,
    text: "",
    textFields: {
      login: true,
      name: true,
      email: false,
    },
    repoCount: createEmptyNumberRange(),
    followerCount: createEmptyNumberRange(),
    locations: [],
    languages: [],
    joined: {
      preset: "any",
    },
  };
}

export const initialFilterState: FilterState = buildInitialFilterState();

export interface FilterSummaryEntry {
  key: string;
  label: string;
  category:
    | "type"
    | "sponsorable"
    | "text"
    | "repoCount"
    | "followers"
    | "location"
    | "language"
    | "joined";
  value?: string;
}

export function buildFilterSummaryEntries(
  filters: FilterState,
): FilterSummaryEntry[] {
  const chips: FilterSummaryEntry[] = [];

  chips.push({
    key: "type",
    label: formatTypeLabel(filters.type),
    category: "type",
  });

  if (filters.sponsorableOnly) {
    chips.push({
      key: "sponsorable",
      label: "Sponsorable",
      category: "sponsorable",
    });
  }

  const trimmedText = filters.text.trim();
  if (trimmedText) {
    const selectedFields = Object.entries(filters.textFields)
      .filter(([, value]) => value)
      .map(([key]) => TEXT_FIELD_LABELS[key as keyof typeof TEXT_FIELD_LABELS]);
    chips.push({
      key: "text",
      label: selectedFields.length
        ? `Text: ${trimmedText} (${selectedFields.join(", ")})`
        : `Text: ${trimmedText}`,
      category: "text",
    });
  }

  const repoLabel = formatNumberRangeLabel(filters.repoCount, "Repos");
  if (repoLabel) {
    chips.push({ key: "repoCount", label: repoLabel, category: "repoCount" });
  }

  const followerLabel = formatNumberRangeLabel(
    filters.followerCount,
    "Followers",
  );
  if (followerLabel) {
    chips.push({
      key: "followers",
      label: followerLabel,
      category: "followers",
    });
  }

  filters.locations.forEach((location, index) => {
    chips.push({
      key: `location-${index}`,
      label: `Location: ${location}`,
      category: "location",
      value: location,
    });
  });

  filters.languages.forEach((language, index) => {
    chips.push({
      key: `language-${index}`,
      label: `Language: ${language}`,
      category: "language",
      value: language,
    });
  });

  const joinedLabel = formatJoinedLabel(filters.joined);
  if (joinedLabel) {
    chips.push({ key: "joined", label: joinedLabel, category: "joined" });
  }

  return chips;
}

export function filterUsers(
  users: GitHubUser[],
  filters: FilterState,
): GitHubUser[] {
  return users.filter((user) => {
    if (!matchesType(user.type, filters.type)) {
      return false;
    }

    if (filters.sponsorableOnly && !user.sponsorable) {
      return false;
    }

    if (!matchesText(user, filters)) {
      return false;
    }

    if (!matchesNumberRange(user.stats.repositories, filters.repoCount)) {
      return false;
    }

    if (!matchesNumberRange(user.stats.followers, filters.followerCount)) {
      return false;
    }

    if (
      filters.locations.length &&
      !matchesLocation(user.location, filters.locations)
    ) {
      return false;
    }

    if (
      filters.languages.length &&
      !matchesLanguages(user.languages, filters.languages)
    ) {
      return false;
    }

    if (!matchesJoinedDate(user.stats.joined, filters.joined)) {
      return false;
    }

    return true;
  });
}

export function sortUsers(users: GitHubUser[], sort: SortValue): GitHubUser[] {
  const sorted = [...users];
  switch (sort) {
    case "followers":
      sorted.sort((a, b) => b.stats.followers - a.stats.followers);
      break;
    case "repositories":
      sorted.sort((a, b) => b.stats.repositories - a.stats.repositories);
      break;
    case "joined":
      sorted.sort(
        (a, b) =>
          new Date(b.stats.joined).getTime() -
          new Date(a.stats.joined).getTime(),
      );
      break;
    default:
      sorted.sort((a, b) => a.login.localeCompare(b.login));
  }
  return sorted;
}

export function matchesNumberRange(
  value: number,
  filter: NumberRangeValue,
): boolean {
  if (filter.operator === "between") {
    const { min, max } = filter.value;
    if (min === null && max === null) {
      return true;
    }
    if (min !== null && value < min) {
      return false;
    }
    if (max !== null && value > max) {
      return false;
    }
    return true;
  }

  if (filter.value === null) {
    return true;
  }

  switch (filter.operator) {
    case "eq":
      return value === filter.value;
    case "gte":
      return value >= filter.value;
    case "lte":
      return value <= filter.value;
    default:
      return true;
  }
}

function matchesType(
  userType: GitHubUser["type"],
  filterType: TypeFilterValue,
) {
  if (filterType === "user") {
    return userType === "User";
  }

  return userType === "Organization";
}

function matchesText(user: GitHubUser, filters: FilterState) {
  const text = filters.text.trim().toLowerCase();
  if (!text) {
    return true;
  }

  const targets: (string | undefined)[] = [];
  if (filters.textFields.login) {
    targets.push(user.login);
  }
  if (filters.textFields.name) {
    targets.push(user.name);
  }
  if (filters.textFields.email) {
    targets.push(user.email);
  }

  return targets.some((target) => target?.toLowerCase().includes(text));
}

function matchesLocation(userLocation: string | undefined, filters: string[]) {
  if (!userLocation) {
    return false;
  }

  const normalized = userLocation.toLowerCase();
  return filters.some((location) =>
    normalized.includes(location.toLowerCase()),
  );
}

function matchesLanguages(
  userLanguages: string[] | undefined,
  required: string[],
) {
  if (!userLanguages || userLanguages.length === 0) {
    return false;
  }

  const set = new Set(userLanguages.map((language) => language.toLowerCase()));
  return required.every((language) => set.has(language.toLowerCase()));
}

function matchesJoinedDate(joined: string, filter: DateRangeValue) {
  const joinedDate = new Date(joined);
  if (Number.isNaN(joinedDate.getTime())) {
    return true;
  }

  if (filter.preset === "any") {
    return true;
  }

  if (filter.preset === "custom") {
    const from = filter.from ? new Date(filter.from) : null;
    const to = filter.to ? new Date(filter.to) : null;
    if (from && joinedDate < from) {
      return false;
    }
    if (to && joinedDate > to) {
      return false;
    }
    return true;
  }

  const now = Date.now();
  const diffYears = (now - joinedDate.getTime()) / MILLISECONDS_PER_YEAR;
  if (filter.preset === "last1") {
    return diffYears <= 1;
  }
  if (filter.preset === "oneToThree") {
    return diffYears >= 1 && diffYears <= 3;
  }
  if (filter.preset === "threePlus") {
    return diffYears >= 3;
  }

  return true;
}

function formatTypeLabel(type: TypeFilterValue) {
  switch (type) {
    case "user":
      return "Type: Users";
    case "org":
      return "Type: Organizations";
    default:
      return "Type: Users";
  }
}

export function formatNumberRangeLabel(
  filter: NumberRangeValue,
  prefix: string,
) {
  if (filter.operator === "between") {
    const { min, max } = filter.value;
    if (min === null && max === null) {
      return null;
    }
    return `${prefix}: ${min ?? "0"} - ${max ?? "∞"}`;
  }

  if (filter.value === null) {
    return null;
  }

  const symbol =
    filter.operator === "eq" ? "=" : filter.operator === "gte" ? ">=" : "<=";
  return `${prefix}: ${symbol} ${filter.value}`;
}

export function formatNumberRangeSummary(
  filter: NumberRangeValue,
  unit?: string,
  options?: {
    style?: "default" | "prefix";
    label?: string;
  },
) {
  const style = options?.style ?? "default";
  const suffix = unit && style !== "prefix" ? ` ${unit}` : "";
  const prefixLabel =
    style === "prefix" && options?.label ? `${options.label} ` : "";

  if (filter.operator === "between") {
    const { min, max } = filter.value;
    if (min === null && max === null) {
      return null;
    }
    const minLabel = min !== null ? numberFormatter.format(min) : "0";
    const maxLabel = max !== null ? numberFormatter.format(max) : "∞";
    return `${prefixLabel}${minLabel} - ${maxLabel}${suffix}`;
  }

  if (filter.value === null) {
    return null;
  }

  const symbol =
    filter.operator === "eq" ? "=" : filter.operator === "gte" ? "≥" : "≤";
  const formatted = numberFormatter.format(filter.value);
  return `${prefixLabel}${symbol} ${formatted}${suffix}`;
}

function formatJoinedLabel(filter: DateRangeValue) {
  switch (filter.preset) {
    case "last1":
      return "Joined: Last 1 year";
    case "oneToThree":
      return "Joined: 1–3 years";
    case "threePlus":
      return "Joined: 3+ years";
    case "custom":
      if (filter.from || filter.to) {
        return `Joined: ${filter.from ?? "..."} ~ ${filter.to ?? "..."}`;
      }
      return null;
    default:
      return null;
  }
}

export const buildSearchQuery = (filters: FilterState): string => {
  const parts: string[] = [];

  if (filters.text) {
    const text = filters.text.trim();
    if (text) {
      const selectedFields: string[] = [];
      if (filters.textFields.login) selectedFields.push("login");
      if (filters.textFields.name) selectedFields.push("name");
      if (filters.textFields.email) selectedFields.push("email");

      // Valid qualifiers for user search: in:login, in:name, in:email.
      // If subset is selected, we append "in:field1,field2".
      // If ALL are selected (3) or NONE (0), we usually default to searching everywhere.
      if (selectedFields.length > 0 && selectedFields.length < 3) {
        parts.push(`${text} in:${selectedFields.join(",")}`);
      } else {
        parts.push(text);
      }
    }
  }

  if (filters.sponsorableOnly) {
    parts.push("is:sponsorable");
  }

  parts.push(`type:${filters.type || "user"}`);

  // Location
  filters.locations.forEach((loc) => {
    parts.push(`location:"${loc}"`);
  });

  // Language
  filters.languages.forEach((lang) => {
    parts.push(`language:${lang}`);
  });

  // Repos
  if (filters.repoCount.operator === "between") {
    const { min: minVal, max: maxVal } = filters.repoCount.value;
    const min = minVal ?? "*";
    const max = maxVal ?? "*";
    if (min !== "*" || max !== "*") {
      parts.push(`repos:${min}..${max}`);
    }
  } else if (filters.repoCount.value !== null) {
    const val = filters.repoCount.value;
    switch (filters.repoCount.operator) {
      case "gte":
        parts.push(`repos:>=${val}`);
        break;
      case "lte":
        parts.push(`repos:<=${val}`);
        break;
      case "eq":
        parts.push(`repos:${val}`);
        break;
    }
  }

  // Followers
  if (filters.followerCount.operator === "between") {
    const { min: minVal, max: maxVal } = filters.followerCount.value;
    const min = minVal ?? "*";
    const max = maxVal ?? "*";
    if (min !== "*" || max !== "*") {
      parts.push(`followers:${min}..${max}`);
    }
  } else if (filters.followerCount.value !== null) {
    const val = filters.followerCount.value;
    switch (filters.followerCount.operator) {
      case "gte":
        parts.push(`followers:>=${val}`);
        break;
      case "lte":
        parts.push(`followers:<=${val}`);
        break;
      case "eq":
        parts.push(`followers:${val}`);
        break;
    }
  }

  // Joined
  if (filters.joined.preset !== "any") {
    const today = new Date();
    const formatDate = (date: Date) => date.toISOString().split("T")[0];

    switch (filters.joined.preset) {
      case "last1": {
        const oneYearAgo = new Date(today);
        oneYearAgo.setFullYear(today.getFullYear() - 1);
        parts.push(`created:>=${formatDate(oneYearAgo)}`);
        break;
      }
      case "oneToThree": {
        const oneYearAgo = new Date(today);
        oneYearAgo.setFullYear(today.getFullYear() - 1);
        const threeYearsAgo = new Date(today);
        threeYearsAgo.setFullYear(today.getFullYear() - 3);
        parts.push(
          `created:${formatDate(threeYearsAgo)}..${formatDate(oneYearAgo)}`,
        );
        break;
      }
      case "threePlus": {
        const threeYearsAgo = new Date(today);
        threeYearsAgo.setFullYear(today.getFullYear() - 3);
        parts.push(`created:<=${formatDate(threeYearsAgo)}`);
        break;
      }
      case "custom":
        if (filters.joined.from || filters.joined.to) {
          const start = filters.joined.from ?? "*";
          const end = filters.joined.to ?? "*";
          parts.push(`created:${start}..${end}`);
        }
        break;
    }
  }

  return parts.join(" ");
};

export function parseSearchQuery(query: string): FilterState {
  const filters = buildInitialFilterState();
  if (!query) return filters;

  // Regex to match tokens: key:"value", key:value, "value", or value
  const regex = /([a-zA-Z0-9_.-]+:"[^"]*"|[a-zA-Z0-9_.-]+:\S+|"[^"]*"|\S+)/g;
  const tokens = query.match(regex) || [];

  const textParts: string[] = [];
  const textFields = { login: false, name: false, email: false };
  let hasTextFields = false;

  for (const token of tokens) {
    if (token.includes(":")) {
      const firstColonIndex = token.indexOf(":");
      const key = token.substring(0, firstColonIndex);
      let value = token.substring(firstColonIndex + 1);

      // Remove quotes if present
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }

      switch (key) {
        case "type":
          if (value === "user") filters.type = "user";
          if (value === "org") filters.type = "org";
          // Default is user, so ignore others or map to user
          break;
        case "is":
          if (value === "sponsorable") {
            filters.sponsorableOnly = true;
          }
          break;
        case "location":
          filters.locations.push(value);
          break;
        case "language":
          filters.languages.push(value);
          break;
        case "repos":
          filters.repoCount = parseNumberRangeToken(value);
          break;
        case "followers":
          filters.followerCount = parseNumberRangeToken(value);
          break;
        case "created":
          filters.joined = parseDateRangeToken(value);
          break;
        case "in": {
          const fields = value.split(",");
          hasTextFields = true;
          if (fields.includes("login")) textFields.login = true;
          if (fields.includes("name")) textFields.name = true;
          if (fields.includes("email")) textFields.email = true;
          break;
        }
        default:
          // Unknown qualifier, treat as text? Or ignore?
          // GitHub treats "unknown:val" as text.
          textParts.push(token);
          break;
      }
    } else {
      // Regular text term
      // Remove quotes if present
      if (token.startsWith('"') && token.endsWith('"')) {
        textParts.push(token.slice(1, -1));
      } else {
        textParts.push(token);
      }
    }
  }

  filters.text = textParts.join(" ");
  if (hasTextFields) {
    filters.textFields = textFields;
  }

  return filters;
}

function parseNumberRangeToken(value: string): NumberRangeValue {
  const range = createEmptyNumberRange();

  if (value.includes("..")) {
    const [minStr, maxStr] = value.split("..");
    const min = minStr && minStr !== "*" ? Number(minStr) : null;
    const max = maxStr && maxStr !== "*" ? Number(maxStr) : null;
    range.operator = "between";
    range.value = { min, max };
  } else if (value.startsWith(">=")) {
    range.operator = "gte";
    range.value = Number(value.substring(2));
  } else if (value.startsWith("<=")) {
    range.operator = "lte";
    range.value = Number(value.substring(2));
  } else if (value.startsWith(">")) {
    // Treat >X as >=X (approximation for simple UI)
    // Or ideally >= X+1. Let's stick to simple parsing.
    range.operator = "gte";
    range.value = Number(value.substring(1));
  } else if (value.startsWith("<")) {
    range.operator = "lte";
    range.value = Number(value.substring(1));
  } else {
    // Equality
    range.operator = "eq";
    range.value = Number(value);
  }

  return range;
}

function parseDateRangeToken(value: string): DateRangeValue {
  // Always return custom preset for simplicity when parsing from URL
  // We can't easily reverse "last1" because it's relative to "now"

  let from: string | null = null;
  let to: string | null = null;

  if (value.includes("..")) {
    const [start, end] = value.split("..");
    if (start && start !== "*") from = start;
    if (end && end !== "*") to = end;
  } else if (value.startsWith(">=")) {
    from = value.substring(2);
  } else if (value.startsWith("<=")) {
    to = value.substring(2);
  } else if (value.startsWith(">")) {
    from = value.substring(1);
  } else if (value.startsWith("<")) {
    to = value.substring(1);
  } else {
    // Exact date... treat as from=to? Or just from?
    // created:2020-01-01 usually means that specific date.
    from = value;
    to = value;
  }

  return {
    preset: "custom",
    from: from || undefined,
    to: to || undefined,
  };
}
