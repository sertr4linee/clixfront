import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen" style={{ background: "#000" }}>
      <Sidebar />
      <main className="flex-1 ml-64 min-h-screen border-l" style={{ borderColor: "#2f3336" }}>
        {children}
      </main>
    </div>
  );
}
