import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Sidebar } from "@/components/layout/sidebar";
import { RightPanel } from "@/components/layout/right-panel";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "clix",
  description: "Twitter/X client powered by clix",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${geist.className} bg-black text-white antialiased`}>
        <Providers>
          <div className="flex min-h-screen max-w-7xl mx-auto">
            <Sidebar />
            <main className="flex-1 min-w-0 border-x border-white/10">
              {children}
            </main>
            <RightPanel />
          </div>
        </Providers>
      </body>
    </html>
  );
}
