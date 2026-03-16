import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "clix — Twitter/X Manager",
  description: "Manage your X presence without an API key",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className} style={{ background: "#000", color: "#e7e9ea" }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
