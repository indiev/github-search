import MUICard, { type CardProps as MUICardProps } from "@mui/material/Card";

export type CardProps = MUICardProps;

export default function Card(props: CardProps) {
  return <MUICard {...props} />;
}
