import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopNavbar } from "./TopNavbar";
import { useUI } from "../../contexts/UIContext";

interface MainLayoutProps {
  children: ReactNode;
}
export function MainLayout({ children }: MainLayoutProps) {
  const { sidebarOpen, closeSidebar } = useUI();

  return (
    <div
      className="min-h-screen"
      style={{ background: "#0b0f19" }} // ← use your theme base
    >
      <Sidebar />
      <TopNavbar />

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden transition-all duration-300"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      <main className="pt-20 md:pl-72 transition-all duration-300 ease-in-out">
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto">{children}</div>
      </main>
    </div>
  );
}
