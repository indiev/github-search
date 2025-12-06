import MUIButton, {
  type ButtonProps as MUIButtonProps,
} from "@mui/material/Button";

export type ButtonProps = MUIButtonProps;

export default function Button(props: ButtonProps) {
  return <MUIButton {...props} />;
}
