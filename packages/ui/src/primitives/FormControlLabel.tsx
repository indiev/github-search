import MUIFormControlLabel, {
  type FormControlLabelProps as MUIFormControlLabelProps,
} from "@mui/material/FormControlLabel";

export type FormControlLabelProps = MUIFormControlLabelProps;

export default function FormControlLabel(props: FormControlLabelProps) {
  return <MUIFormControlLabel {...props} />;
}
