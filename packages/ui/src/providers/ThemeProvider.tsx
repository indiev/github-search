import { ThemeProvider as MUIThemeProvider } from "@mui/material/styles";
import { type PropsWithChildren } from "react";

import theme from "../theme/createTheme";

export default function ThemeProvider(props: PropsWithChildren) {
  return (
    <MUIThemeProvider theme={theme} defaultMode={"system"}>
      {props.children}
    </MUIThemeProvider>
  );
}
