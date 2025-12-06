import MUIChip, { type ChipProps as MUIChipProps } from "@mui/material/Chip";

export type ChipProps = MUIChipProps;

export default function Chip(props: ChipProps) {
  return <MUIChip {...props} />;
}
