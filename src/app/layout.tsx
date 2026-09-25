import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Vazirmatn, Playfair_Display } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import ScrollProgress from "@/components/ScrollProgress";

const vazir = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-vazirmatn",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "پات‌کلاب | فروشگاه تخصصی گلف",
  description:
    "پات‌کلاب؛ بوتیک پریمیوم تجهیزات گلف — چوب، توپ، کفش، پوشاک و لوازم جانبی اورجینال با ضمانت اصالت و ارسال سریع به سراسر کشور.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className={`${vazir.variable} ${playfair.variable}`}>
      <body className="bg-forest-950 font-vazir text-cream antialiased">
        <ScrollProgress />
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <CartDrawer />
      </body>
    </html>
  );
}
