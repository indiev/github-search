import React from "react";

export default function InfiniteScrollContainer(props: {
  children: React.ReactNode;
  onLoadMore: () => void;
  endMessage: React.ReactNode;
}) {
  return (
    <div>
      <button
        type="button"
        data-testid="load-more-button"
        onClick={props.onLoadMore}
      >
        Load more
      </button>
      {props.children}
      {props.endMessage}
    </div>
  );
}
