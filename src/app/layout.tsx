import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Loyalty App - Dijital Sadakat Sistemi",
  description: "Modern, hızlı ve premium dijital sadakat sistemi.",
};

import { Inter } from "next/font/google";
import { Providers } from "./providers";

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter" 
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={inter.variable}>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
