import MUICheckbox, {
  type CheckboxProps as MUICheckboxProps,
} from "@mui/material/Checkbox";

export type CheckboxProps = MUICheckboxProps;

export default function Checkbox(props: CheckboxProps) {
  return <MUICheckbox {...props} />;
}
