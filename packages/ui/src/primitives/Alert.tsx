import MUIAlert, {
  type AlertProps as MUIAlertProps,
} from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";

export type AlertProps = MUIAlertProps & {
  title?: string;
  subtitle?: string;
};

export default function Alert({
  title,
  subtitle,
  children,
  ...props
}: AlertProps) {
  return (
    <MUIAlert {...props}>
      {title ? <AlertTitle>{title}</AlertTitle> : null}
      {subtitle}
      {children}
    </MUIAlert>
  );
}
