import MUIMenuItem, {
  type MenuItemProps as MUIMenuItemProps,
} from "@mui/material/MenuItem";

export type MenuItemProps = MUIMenuItemProps;

export default function MenuItem(props: MenuItemProps) {
  return <MUIMenuItem {...props} />;
}
