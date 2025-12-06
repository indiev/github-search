"use client";
import CssBaseline from "@mui/material/CssBaseline";
import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";
import { type PropsWithChildren } from "react";

import CacheProvider from "./CacheProvider";
import ThemeProvider from "./ThemeProvider";

export default function UIProvider(props: PropsWithChildren) {
  return (
    <>
      <InitColorSchemeScript attribute="class" />
      <CacheProvider>
        <ThemeProvider>
          <CssBaseline />
          {props.children}
        </ThemeProvider>
      </CacheProvider>
    </>
  );
}
