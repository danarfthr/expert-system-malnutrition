import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sistem Pakar Gizi Buruk",
  description:
    "Demo sistem pakar diagnosa dini gizi buruk balita menggunakan Hybrid RBR dan CBR.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
