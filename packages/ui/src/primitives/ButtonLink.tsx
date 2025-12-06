import MUIButton, { type ButtonProps } from "@mui/material/Button";
import NextLink, { type LinkProps as NextLinkProps } from "next/link";

export type ButtonLinkProps = ButtonProps<
  typeof NextLink,
  {
    href: NextLinkProps["href"];
  }
>;

export default function ButtonLink(props: ButtonLinkProps) {
  return <MUIButton component={NextLink} {...props} />;
}
