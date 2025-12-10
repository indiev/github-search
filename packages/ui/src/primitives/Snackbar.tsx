import MUISnackbar, {
  type SnackbarProps as MUISnackbarProps,
  type SnackbarOrigin,
} from "@mui/material/Snackbar";

export type SnackbarProps = MUISnackbarProps;
export type { SnackbarOrigin };

export default function Snackbar(props: SnackbarProps) {
  return <MUISnackbar {...props} />;
}
