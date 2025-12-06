import MUICircularProgress, {
  type CircularProgressProps as MUICircularProgressProps,
} from "@mui/material/CircularProgress";

export type CircularProgressProps = MUICircularProgressProps;

export default function CircularProgress(props: CircularProgressProps) {
  return <MUICircularProgress {...props} />;
}
