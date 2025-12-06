import MUILink, { type LinkProps as MUILinkProps } from "@mui/material/Link";
import NextLink, { type LinkProps as NextLinkProps } from "next/link";

export type LinkProps = MUILinkProps<
  typeof NextLink,
  {
    href: NextLinkProps["href"];
  }
>;

export default function Link(props: LinkProps) {
  return <MUILink component={NextLink} {...props} />;
}
