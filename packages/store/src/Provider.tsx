"use client";
import { setupListeners } from "@reduxjs/toolkit/query";
import { useRef, useEffect } from "react";
import { Provider } from "react-redux";

import { type AppStore, makeStore } from "./lib/store";

import type { PropsWithChildren } from "react";

type StoreProviderProps = PropsWithChildren;

export default function ReduxProvider({ children }: StoreProviderProps) {
  const storeRef = useRef<AppStore | null>(null);

  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  useEffect(() => {
    if (storeRef.current != null) {
      // configuring the listener middleware to enable refetchOnFocus/refetchOnReconnect
      const unsubscribe = setupListeners(storeRef.current.dispatch);
      return unsubscribe;
    }
  }, []);

  return <Provider store={storeRef.current}>{children}</Provider>;
}
