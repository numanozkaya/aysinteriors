import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ays Interiors",
  description: "İç Mimarlık & Tasarım Danışmanlığı",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
