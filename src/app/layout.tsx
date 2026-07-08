import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Loyalty App - Dijital Sadakat Sistemi",
  description: "Modern, hızlı ve premium dijital sadakat sistemi.",
};

import { Providers } from "./providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
