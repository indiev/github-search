import { type PropsWithChildren } from "react";

import ReduxProvider from "@repo/store/Provider";
import UIProvider from "@repo/ui/providers/UIProvider";

export default function Providers(props: PropsWithChildren) {
  return (
    <ReduxProvider>
      <UIProvider>{props.children}</UIProvider>
    </ReduxProvider>
  );
}
