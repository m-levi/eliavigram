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
        {/* Vintage app frame - top border */}
        <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#3D5A73] via-[#4A6B8A] to-[#3D5A73] z-50" />

        {/* Main content */}
        <div className="min-h-screen bg-[#FFFDF7]">
          {children}
        </div>

        {/* Bottom navigation bar - Instagram style */}
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#2C4356] to-[#3D5A73] h-2 z-50" />
      </body>
    </html>
  );
}
