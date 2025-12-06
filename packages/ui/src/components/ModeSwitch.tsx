"use client";
import { useColorScheme } from "@mui/material/styles";

import Box from "../primitives/Box";
import FormControl from "../primitives/FormControl";
import InputLabel from "../primitives/InputLabel";
import MenuItem from "../primitives/MenuItem";
import Select from "../primitives/Select";

export default function ModeSwitch() {
  const { mode, setMode } = useColorScheme();
  if (!mode) {
    return null;
  }
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "flex-end",
        mt: 1,
        p: 1,
      }}
    >
      <FormControl>
        <InputLabel id="mode-select-label">Theme</InputLabel>
        <Select
          labelId="mode-select-label"
          id="mode-select"
          value={mode}
          onChange={(event) => setMode(event.target.value as typeof mode)}
          label="Theme"
        >
          <MenuItem value="system">System</MenuItem>
          <MenuItem value="light">Light</MenuItem>
          <MenuItem value="dark">Dark</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}
