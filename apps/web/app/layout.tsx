import { primaryFont } from "@repo/ui/theme/typography";
import "@repo/ui/global.css";

import Providers from "./Providers";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GitHub User Search",
  description: "Advanced GitHub user search with premium design",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${primaryFont.variable} font-sans antialiased bg-[var(--color-background-default)] text-[var(--color-text-primary)] transition-colors duration-300`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
