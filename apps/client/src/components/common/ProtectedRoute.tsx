import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, LogIn, ArrowLeft } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Loader from "./Loader";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, openAuthModal } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4 text-center">
        <Loader />
        <p className="font-body text-xs font-semibold text-slate-500">
          Verifying session credentials...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto my-12 max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-xs text-center space-y-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-xs">
          <ShieldAlert className="h-7 w-7" />
        </div>

        <div className="space-y-2">
          <h2 className="font-display text-xl font-bold text-slate-900">
            Authentication Required
          </h2>
          <p className="font-body text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
            This workstation feature requires an authenticated PatentIQ user session. Please sign in to access search history, invention comparison, and system management.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={openAuthModal}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 font-body text-xs font-semibold text-white hover:bg-indigo-500 transition shadow-sm"
          >
            <LogIn className="h-4 w-4" />
            Sign In / Register
          </button>

          <Link
            to="/search"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 font-body text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Search
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
