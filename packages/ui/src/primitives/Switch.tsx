import MUISwitch, {
  type SwitchProps as MUISwitchProps,
} from "@mui/material/Switch";

export type SwitchProps = MUISwitchProps;

export default function Switch(props: SwitchProps) {
  return <MUISwitch {...props} />;
}
