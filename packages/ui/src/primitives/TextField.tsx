import MUITextField, {
  type TextFieldProps as MUITextFieldProps,
} from "@mui/material/TextField";

export type TextFieldProps = MUITextFieldProps;

export default function TextField(props: TextFieldProps) {
  return <MUITextField {...props} />;
}
