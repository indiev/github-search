"use client";

import { type MouseEvent } from "react";

import AvatarCanvas from "./AvatarCanvas";
import Box from "../primitives/Box";
import Card from "../primitives/Card";
import Chip from "../primitives/Chip";
import Link from "../primitives/Link";
import Typography from "../primitives/Typography";

export type UserType = "User" | "Organization";

export interface UserCardData {
  login: string;
  name?: string;
  avatarUrl?: string;
  type: UserType;
  sponsorable?: boolean;
  stats: {
    repositories: number;
    followers: number;
    joined: string;
  };
  location?: string;
  languages?: string[];
  bio?: string;
  url?: string;
}

export interface UserCardProps {
  user: UserCardData;
  onLoginClick?: (login: string) => void;
  className?: string;
}

const numberFormatter = new Intl.NumberFormat();

export default function UserCard({
  user,
  onLoginClick,
  className,
}: UserCardProps) {
  const joinedLabel = formatDate(user.stats.joined);

  const handleLoginClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!onLoginClick) {
      return;
    }

    event.preventDefault();
    onLoginClick(user.login);
  };

  const languages = user.languages ?? [];
  const visibleLanguages = languages.slice(0, 2);
  const hiddenLanguageCount = Math.max(
    languages.length - visibleLanguages.length,
    0,
  );

  const stats = [
    `${numberFormatter.format(user.stats.repositories)} repos`,
    `${numberFormatter.format(user.stats.followers)} followers`,
  ].join(" · ");

  return (
    <Card
      data-testid="user-card"
      className={`rounded-2xl border border-black/5 bg-(--color-background-paper) p-5 shadow-sm transition hover:shadow-lg dark:border-white/10 ${className ?? ""}`}
    >
      <Box className="flex flex-col gap-4">
        {/* Top Row: Avatar + Login */}
        <Box className="flex items-center gap-3">
          <AvatarCanvas
            src={user.avatarUrl}
            alt={user.login}
            size={48}
            fallbackText={user.login}
          />
          <Link
            href={user.url ?? `https://github.com/${user.login}`}
            underline="hover"
            onClick={handleLoginClick}
            className="truncate"
          >
            <Typography variant="h6" component="span" className="truncate">
              {user.login}
            </Typography>
          </Link>
        </Box>

        {/* Bottom Section: All other details */}
        <Box className="space-y-3">
          {/* Identity & Bio */}
          <Box className="space-y-1">
            <Box className="flex flex-wrap items-center gap-2">
              <Chip label={user.type} size="small" />
              {user.sponsorable ? (
                <Chip label="Sponsorable" color="secondary" size="small" />
              ) : null}
            </Box>
            {user.name ? (
              <Typography
                variant="body2"
                color="text.secondary"
                className="truncate"
              >
                {user.name}
              </Typography>
            ) : null}
            {user.bio ? (
              <Typography
                variant="body2"
                color="text.secondary"
                className="line-clamp-2"
              >
                {user.bio}
              </Typography>
            ) : null}
          </Box>

          {/* Location & Languages */}
          <Box className="flex flex-wrap items-center gap-2 text-xs text-(--color-text-secondary)">
            {user.location ? (
              <Box className="flex items-center gap-1">
                <LocationIcon />
                {user.location}
              </Box>
            ) : null}
            {user.location && visibleLanguages.length > 0 ? (
              <span className="h-3 w-px bg-black/10 dark:bg-white/20" />
            ) : null}
            {visibleLanguages.length > 0 ? (
              <Box className="flex flex-wrap gap-1">
                {visibleLanguages.map((language) => (
                  <Chip
                    key={language}
                    label={language}
                    size="small"
                    variant="outlined"
                  />
                ))}
                {hiddenLanguageCount > 0 ? (
                  <Chip
                    label={`+${hiddenLanguageCount}`}
                    size="small"
                    variant="outlined"
                  />
                ) : null}
              </Box>
            ) : null}
          </Box>

          {/* Stats */}
          <Box className="flex flex-col">
            <Typography
              variant="body2"
              color="text.secondary"
              className="text-sm font-medium text-(--color-text-secondary)"
            >
              {stats}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              className="text-sm font-medium text-(--color-text-secondary)"
            >
              Joined {joinedLabel}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Card>
  );
}

function formatDate(input: string) {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return input;
  }

  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function LocationIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className="text-(--color-text-secondary)"
    >
      <path
        d="M12 2.5c-3.246 0-5.75 2.504-5.75 5.75 0 4.593 5.03 11.286 5.245 11.565a.75.75 0 0 0 1.01.173.75.75 0 0 0 .173-.173c.215-.279 5.245-6.972 5.245-11.565 0-3.246-2.504-5.75-5.75-5.75zm0 8.25a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"
        fill="currentColor"
      />
    </svg>
  );
}
