import MUISelect, {
  type SelectProps as MUISelectProps,
} from "@mui/material/Select";

export type SelectProps = MUISelectProps;

export default function Select(props: SelectProps) {
  return <MUISelect {...props} />;
}
