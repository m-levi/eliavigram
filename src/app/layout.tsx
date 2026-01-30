import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eliavigram",
  description: "A little photographer's gallery",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
