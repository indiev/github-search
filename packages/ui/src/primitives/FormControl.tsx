import MUIFormControl, {
  type FormControlProps as MUIFormControlProps,
} from "@mui/material/FormControl";

export type FormControlProps = MUIFormControlProps;

export default function FormControl(props: FormControlProps) {
  return <MUIFormControl {...props} />;
}
