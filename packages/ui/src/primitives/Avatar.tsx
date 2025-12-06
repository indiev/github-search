import MUIAvatar, {
  type AvatarProps as MUIAvatarProps,
} from "@mui/material/Avatar";

export type AvatarProps = MUIAvatarProps;

export default function Avatar(props: AvatarProps) {
  return <MUIAvatar {...props} />;
}
