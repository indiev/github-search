import type { DateRangeValue } from "@repo/ui/components/DateRangeFilter";
import type { NumberRangeValue } from "@repo/ui/components/NumberRangeFilter";
import type { UserCardData } from "@repo/ui/components/UserCard";

export enum SearchType {
  User = "user",
  Org = "org",
}

export type TypeFilterValue = "user" | "org";

export interface TextFieldTargets {
  login: boolean;
  name: boolean;
  email: boolean;
}

export interface FilterState {
  type: TypeFilterValue;
  sponsorableOnly: boolean;
  text: string;
  textFields: TextFieldTargets;
  repoCount: NumberRangeValue;
  followerCount: NumberRangeValue;
  locations: string[];
  languages: string[];
  joined: DateRangeValue;
}

export type SortValue = "default" | "followers" | "repositories" | "joined";

export interface GitHubUser extends UserCardData {
  email?: string;
}

export interface RateLimit {
  limit: number;
  remaining: number;
  reset: number;
  used: number;
}
