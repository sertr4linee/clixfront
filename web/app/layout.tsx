import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { AppSidebar } from "@/components/app-sidebar";
import { RightPanel } from "@/components/layout/right-panel";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

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
      <body className={`${geist.className} bg-background text-foreground antialiased`}>
        <Providers>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="flex flex-row min-w-0">
              <main className="flex-1 min-w-0 border-x border-border">
                {children}
              </main>
              <RightPanel />
            </SidebarInset>
          </SidebarProvider>
        </Providers>
      </body>
    </html>
  );
}
