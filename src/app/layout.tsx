import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Loyalty App",
  description: "Dijital Sadakat Sistemi",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#D4A373",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
