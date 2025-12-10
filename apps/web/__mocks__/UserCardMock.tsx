import React from "react";

export default function UserCard(props: { user: { login: string } }) {
  return <div data-testid="user-card">{props.user.login}</div>;
}
