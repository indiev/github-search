"use client";
import { useRef } from "react";
import { Provider } from "react-redux";

import { type AppStore, makeStore } from "./lib/store";

import type { PropsWithChildren } from "react";

type StoreProviderProps = PropsWithChildren;

export default function ReduxProvider({ children }: StoreProviderProps) {
  const storeRef = useRef<AppStore | null>(null);

  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
}
