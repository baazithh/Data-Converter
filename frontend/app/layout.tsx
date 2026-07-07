import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Data Converter — Transform Files Between Formats",
  description:
    "A clean, minimalist tool to transform files and raw text between different formats. Convert CSV, JSON, TXT to Excel, Parquet, and more.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={bricolage.variable}>
      <body style={{ fontFamily: "var(--font-bricolage, 'Bricolage Grotesque', sans-serif)" }}>
        {children}
      </body>
    </html>
  );
}
