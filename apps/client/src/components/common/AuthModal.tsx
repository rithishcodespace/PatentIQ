import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Key, Mail, Lock, LogOut, CheckCircle2, User } from 'lucide-react';
import type { UserProfile, UserRole } from '../../types/auth';
import Modal from '../ui/Modal';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onLogin: (user: UserProfile) => void;
  onLogout: () => void;
}

const AuthModal = ({ isOpen, onClose, currentUser, onLogin, onLogout }: AuthModalProps) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('analyst.rithish@patentiq.ai');
  const [password, setPassword] = useState('••••••••••••');
  const [fullName, setFullName] = useState('Rithish (Patent Analyst)');
  const [selectedRole, setSelectedRole] = useState<UserRole>('PATENT_ANALYST');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin({
      id: `usr_${Math.floor(Math.random() * 8999999 + 1000000)}`,
      email,
      fullName: isRegister ? fullName : email.split('@')[0] || 'User',
      role: selectedRole,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <AnimatePresence mode="wait">
        {currentUser ? (
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
                {currentUser.fullName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-xl font-semibold text-slate-900">
                    {currentUser.fullName}
                  </h3>
                  <span
                    className={`rounded-full px-2.5 py-0.5 font-body text-xs font-bold ${
                      currentUser.role === 'ADMIN'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                    }`}
                  >
                    {currentUser.role}
                  </span>
                </div>
                <p className="font-body text-sm text-slate-500">{currentUser.email}</p>
              </div>
            </div>

            {/* Simulated JWT Bearer Token Card */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Key className="h-3.5 w-3.5 text-indigo-600" />
                  Active JWT Bearer Session Token
                </span>
                <span className="flex items-center gap-1 text-emerald-600 text-[11px]">
                  <CheckCircle2 className="h-3 w-3" /> Valid Token
                </span>
              </div>
              <p className="font-mono text-[11px] text-slate-500 break-all bg-white p-2 rounded border border-slate-200">
                eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c3JfODgyMzkxMDIzIiwicm9sZSI6IlBBVEVOVF9BTkFMWVNUIiwiaWF0IjoxNzU0MDYzOTAwfQ...
              </p>
            </div>

            {/* Role Switcher Demo Control */}
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 space-y-2">
              <label className="block text-xs font-semibold text-indigo-950">
                Simulate Role Switcher (RBAC Demo)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onLogin({ ...currentUser, role: 'PATENT_ANALYST' })}
                  className={`rounded-lg py-2 text-xs font-medium border transition ${
                    currentUser.role === 'PATENT_ANALYST'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs font-semibold'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  PATENT_ANALYST Role
                </button>
                <button
                  onClick={() => onLogin({ ...currentUser, role: 'ADMIN' })}
                  className={`rounded-lg py-2 text-xs font-medium border transition ${
                    currentUser.role === 'ADMIN'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs font-semibold'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  ADMIN Role
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-5 py-2.5 font-body text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
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
                JWT Authentication & Role-Based Authorization Portal
              </p>
            </div>

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
                <label className="block text-xs font-medium text-slate-700 mb-1">Work Email</label>
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
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Select Assignable Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none bg-white"
                >
                  <option value="PATENT_ANALYST">PATENT_ANALYST (Search, RAG, Upload, History)</option>
                  <option value="ADMIN">ADMIN (System Benchmark, Pinecone & Redis Admin)</option>
                  <option value="INNOVATOR">INNOVATOR (Basic Patent Search)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-indigo-600 py-3 font-body text-sm font-semibold text-white hover:bg-indigo-500 transition shadow-md shadow-indigo-600/20"
              >
                {isRegister ? 'Register & Generate JWT' : 'Authenticate & Sign In'}
              </button>
            </form>

            <div className="text-center pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsRegister(!isRegister)}
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
