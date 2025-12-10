"use client";
import { useColorScheme } from "@mui/material/styles";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

import Box from "../primitives/Box";
import Typography from "../primitives/Typography";

export default function ModeSwitch() {
  const colorScheme = useColorScheme();
  if (!colorScheme) {
    return null;
  }
  const { mode, setMode } = colorScheme;
  if (!mode) {
    return null;
  }
  return (
    <Box className="flex flex-col gap-1 text-right">
      <Typography
        variant="caption"
        color="text.secondary"
        id="mode-select-label"
      >
        Theme
      </Typography>
      <ToggleButtonGroup
        id="mode-select"
        value={mode}
        exclusive
        onChange={(_event, value) => value && setMode(value)}
        size="small"
        sx={{
          borderRadius: 999,
          backgroundColor: "var(--mui-palette-background-paper)",
          "& .MuiToggleButton-root": {
            textTransform: "none",
            minWidth: 0,
            paddingInline: 1.5,
            border: "none",
          },
        }}
      >
        <ToggleButton value="system">System</ToggleButton>
        <ToggleButton value="light">Light</ToggleButton>
        <ToggleButton value="dark">Dark</ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
}
