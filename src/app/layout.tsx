import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Loyalty App - Dijital Sadakat Sistemi",
  description: "Modern, hızlı ve premium dijital sadakat sistemi.",
};

import { Cormorant_Garamond, Outfit } from "next/font/google";
import { Providers } from "./providers";

const cormorant = Cormorant_Garamond({ 
  subsets: ["latin"], 
  weight: ["300", "400", "600"], 
  style: ["normal", "italic"], 
  variable: "--font-cormorant" 
});

const outfit = Outfit({ 
  subsets: ["latin"], 
  weight: ["200", "300", "400", "500"], 
  variable: "--font-outfit" 
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${cormorant.variable} ${outfit.variable}`}>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
