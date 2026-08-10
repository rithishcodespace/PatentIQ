import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import { AuthProvider } from "../context/AuthContext";
import ProtectedRoute from "../components/common/ProtectedRoute";

const Landing = lazy(() => import("../pages/Landing"));
const Search = lazy(() => import("../pages/Search"));
const Results = lazy(() => import("../pages/Results"));
const HowItWorksPage = lazy(() => import("../pages/HowItWorksPage"));
const HistoryPage = lazy(() => import("../pages/HistoryPage"));
const DocsPage = lazy(() => import("../pages/DocsPage"));
const AdminDashboardPage = lazy(() => import("../pages/AdminDashboardPage"));
const NotFound = lazy(() => import("../pages/NotFound"));

const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-sm font-medium text-slate-500">Loading workstation...</p>
    </div>
  </div>
);

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Landing />} />
              <Route path="search" element={<Search />} />
              <Route path="how-it-works" element={<HowItWorksPage />} />
              <Route path="results" element={<Results />} />
              <Route path="upload" element={<Navigate to="/search" replace />} />
              <Route
                path="history"
                element={
                  <ProtectedRoute>
                    <HistoryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin"
                element={
                  <ProtectedRoute>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="dashboard"
                element={
                  <ProtectedRoute>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route path="docs-preview" element={<DocsPage />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default AppRoutes;