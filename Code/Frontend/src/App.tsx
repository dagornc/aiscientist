import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Layout from "./components/layout/Layout";
import DashboardPage from "./pages/Dashboard";
import IdeasPage from "./pages/IdeasPage";
import ExperimentsPage from "./pages/ExperimentsPage";
import PapersPage from "./pages/PapersPage";
import ReviewsPage from "./pages/ReviewsPage";
import PipelinePage from "./pages/PipelinePage";
import SettingsPage from "./pages/SettingsPage";

function App() {
  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/ideas" element={<IdeasPage />} />
          <Route path="/experiments" element={<ExperimentsPage />} />
          <Route path="/papers" element={<PapersPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/pipeline" element={<PipelinePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "var(--surface-raised)",
            color: "var(--text)",
            border: "1px solid var(--border)",
          },
        }}
      />
    </>
  );
}

export default App;
