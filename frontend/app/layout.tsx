import type { Metadata } from "next";
import "lenis/dist/lenis.css";
import "./globals.css";
import { Figtree, Noto_Sans } from "next/font/google";
import { cn } from "@/lib/utils";
import SmoothScrollProvider from "./smooth-scroll-provider";

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
});

const notoSans = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-noto-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sistem Pakar Gizi Buruk",
  description:
    "Demo sistem pakar diagnosa dini gizi buruk balita menggunakan Hybrid RBR dan CBR.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={cn("font-sans", figtree.variable, notoSans.variable)}>
      <body>
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
