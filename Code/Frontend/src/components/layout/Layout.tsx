import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { CommandPalette } from "../common/CommandPalette";
import { ShortcutsHelp } from "../common/ShortcutsHelp";

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] as const } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.15 } },
};

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

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
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Global overlays */}
      <CommandPalette />
      <ShortcutsHelp />
    </div>
  );
};

export default Layout;