import MUITypography, {
  type TypographyProps as MUITypographyProps,
} from "@mui/material/Typography";

export type TypographyProps = MUITypographyProps;

export default function Typography(props: TypographyProps) {
  return <MUITypography {...props} />;
}
