import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jays",
  description: "Jays Dijital Sadakat Uygulaması",
  manifest: "/manifest.webmanifest",
};

import { Inter, Caveat } from "next/font/google";
import { Providers } from "./providers";

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter" 
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat"
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${inter.variable} ${caveat.variable}`}>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
