import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Mail, Lock, LogOut, CheckCircle2, User } from 'lucide-react';
import Modal from '../ui/Modal';
import { useAuth } from '../../context/AuthContext';

const AuthModal = () => {
  const { user, isAuthModalOpen, closeAuthModal, login, register, logout } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (isRegister) {
        await register(email, password, fullName || email.split('@')[0]);
      } else {
        await login(email, password);
      }
      setEmail('');
      setPassword('');
      setFullName('');
      closeAuthModal();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (err: any) {
      console.warn('Logout error:', err);
    } finally {
      closeAuthModal();
    }
  };

  return (
    <Modal isOpen={isAuthModalOpen} onClose={closeAuthModal}>
      <AnimatePresence mode="wait">
        {user ? (
          /* Authenticated User Info View */
          <motion.div
            key="authenticated"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white font-display text-xl font-bold shadow-md shadow-indigo-600/20">
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-xl font-semibold text-slate-900">
                    {user.fullName}
                  </h3>
                  <span className="rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200 px-2.5 py-0.5 font-body text-xs font-bold">
                    User
                  </span>
                </div>
                <p className="font-body text-sm text-slate-500">{user.email}</p>
              </div>
            </div>

            {/* Session Security Card */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-emerald-900">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Authenticated Session Active
                </span>
                <span className="text-[11px] font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                  HTTP-Only Cookie / JWT
                </span>
              </div>
              <p className="font-body text-xs text-emerald-800">
                Your authentication token is stored securely in an encrypted cookie / authorization session, protecting system operations and workstation history.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={closeAuthModal}
                className="rounded-xl border border-slate-200 px-5 py-2.5 font-body text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-5 py-2.5 font-body text-xs font-medium text-white hover:bg-rose-500 shadow-sm"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </motion.div>
        ) : (
          /* Authentication Login / Register Form */
          <motion.div
            key="unauthenticated"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="font-display text-2xl font-semibold text-slate-900">
                {isRegister ? 'Create PatentIQ Account' : 'Sign in to PatentIQ Engine'}
              </h3>
              <p className="font-body text-xs text-slate-500 mt-1">
                Secure Session Authentication Portal
              </p>
            </div>

            {errorMsg && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                      placeholder="Dr. Patent Analyst"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                    placeholder="analyst@firm.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-indigo-600 py-3 font-body text-sm font-semibold text-white hover:bg-indigo-500 transition shadow-md shadow-indigo-600/20 disabled:opacity-50"
              >
                {loading ? 'Processing…' : isRegister ? 'Register & Sign In' : 'Sign In'}
              </button>
            </form>

            <div className="text-center pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setIsRegister(!isRegister);
                  setErrorMsg(null);
                }}
                className="font-body text-xs font-medium text-indigo-600 hover:underline"
              >
                {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
};

export default AuthModal;
