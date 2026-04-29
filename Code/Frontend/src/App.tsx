import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Layout from "./components/layout/Layout";
import { Skeleton } from "./components/common/LoadingSpinner";

// Code-split pages for smaller bundles
const DashboardPage = lazy(() => import("./pages/Dashboard"));
const IdeasPage = lazy(() => import("./pages/IdeasPage"));
const ExperimentsPage = lazy(() => import("./pages/ExperimentsPage"));
const PapersPage = lazy(() => import("./pages/PapersPage"));
const ReviewsPage = lazy(() => import("./pages/ReviewsPage"));
const PipelinePage = lazy(() => import("./pages/PipelinePage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));

const PageLoader = () => (
  <div className="flex items-center justify-center p-12">
    <Skeleton className="h-8 w-48" />
  </div>
);

function App() {
  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/dashboard"
            element={
              <Suspense fallback={<PageLoader />}>
                <DashboardPage />
              </Suspense>
            }
          />
          <Route
            path="/ideas"
            element={
              <Suspense fallback={<PageLoader />}>
                <IdeasPage />
              </Suspense>
            }
          />
          <Route
            path="/experiments"
            element={
              <Suspense fallback={<PageLoader />}>
                <ExperimentsPage />
              </Suspense>
            }
          />
          <Route
            path="/papers"
            element={
              <Suspense fallback={<PageLoader />}>
                <PapersPage />
              </Suspense>
            }
          />
          <Route
            path="/reviews"
            element={
              <Suspense fallback={<PageLoader />}>
                <ReviewsPage />
              </Suspense>
            }
          />
          <Route
            path="/pipeline"
            element={
              <Suspense fallback={<PageLoader />}>
                <PipelinePage />
              </Suspense>
            }
          />
          <Route
            path="/settings"
            element={
              <Suspense fallback={<PageLoader />}>
                <SettingsPage />
              </Suspense>
            }
          />
        </Route>
      </Routes>
      <Toaster
        position="top-right"
        containerStyle={{ top: 20, right: 20 }}
        toastOptions={{
          duration: 4000,
          style: {
            background: "transparent",
            boxShadow: "none",
            padding: 0,
          },
        }}
      />
    </>
  );
}

export default App;