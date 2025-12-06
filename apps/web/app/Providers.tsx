import UIProvider from "@repo/ui/providers/UIProvider";
import { type PropsWithChildren } from "react";

export default function Providers(props: PropsWithChildren) {
  return <UIProvider>{props.children}</UIProvider>;
}
