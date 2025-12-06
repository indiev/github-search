import MUIInputLabel, {
  type InputLabelProps as MUIInputLabelProps,
} from "@mui/material/InputLabel";

export type InputLabelProps = MUIInputLabelProps;

export default function InputLabel(props: InputLabelProps) {
  return <MUIInputLabel {...props} />;
}
