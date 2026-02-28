import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Terminal | Premium Luxury Furniture",
  description:
    "Discover handcrafted luxury furniture designed for modern living. Experience bespoke craftsmanship, 3D customization, and timeless elegance.",
  keywords: ["luxury furniture", "premium furniture", "custom furniture", "handcrafted", "interior design"],
  openGraph: {
    title: "Terminal | Premium Luxury Furniture",
    description: "Handcrafted luxury furniture designed for modern living.",
    type: "website",
    locale: "en_US",
  },
};

import { Providers } from "@/components/providers/Providers";
import CartSlideOver from "@/components/cart/CartSlideOver";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="antialiased" suppressHydrationWarning>
        <Providers>
          {children}
          <CartSlideOver />
        </Providers>
      </body>
    </html>
  );
}
