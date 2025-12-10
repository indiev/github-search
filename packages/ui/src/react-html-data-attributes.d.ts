import "react";

declare module "react" {
  interface HTMLAttributes {
    "data-testid"?: string;
  }
}
