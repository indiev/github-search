import MUISkeleton, {
  type SkeletonProps as MUISkeletonProps,
} from "@mui/material/Skeleton";

export type SkeletonProps = MUISkeletonProps;

export default function Skeleton(props: SkeletonProps) {
  return <MUISkeleton {...props} />;
}
