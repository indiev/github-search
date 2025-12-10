import React from "react";

const Link = React.forwardRef(function Link(
  { children, href, ...props }: React.ComponentProps<"a"> & { href: string },
  ref: React.ForwardedRef<HTMLAnchorElement>,
) {
  return (
    <a href={href} ref={ref} {...props}>
      {children}
    </a>
  );
});

export default Link;
