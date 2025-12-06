import MUIBox, { type BoxProps as MUIBoxProps } from "@mui/material/Box";

export type BoxProps = MUIBoxProps;

export default function Box(props: BoxProps) {
  return <MUIBox {...props} />;
}
