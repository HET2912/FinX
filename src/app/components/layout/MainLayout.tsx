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

      {/* ── Responsive overrides for mobile (max-width: 640px) ── */}
      <style>{`
        @media (max-width: 640px) {
          /* Adjust main content top padding to match reduced navbar height */
          .pt-20 {
            padding-top: 3.5rem;  /* Matches navbar h-20 reduction */
          }
          
          /* Reduce main content container padding */
          .p-4 {
            padding: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}
