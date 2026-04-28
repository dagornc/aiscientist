import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Button } from "../ui/button";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-[var(--bg)] text-[var(--text)]">
      {/* Mobile toggle */}
      <button
        className="fixed left-4 top-3 z-50 md:hidden"
        onClick={() => setSidebarOpen((v) => !v)}
        aria-label="Toggle sidebar"
      >
        <Menu className="h-5 w-5 text-[var(--text)]" />
      </button>

      <Sidebar collapsed={!sidebarOpen} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 pt-14 md:pt-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;