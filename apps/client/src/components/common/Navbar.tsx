import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Shield, BookOpen, History, UploadCloud, Search } from 'lucide-react';
import AuthModal from './AuthModal';
import { mockCurrentUser } from '../../data/mockData';
import type { UserProfile } from '../../types/auth';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/search', label: 'Search', icon: Search },
  { to: '/upload', label: 'Upload & Compare', icon: UploadCloud },
  { to: '/history', label: 'History', icon: History },
  { to: '/docs-preview', label: 'API Docs', icon: BookOpen },
];

const Navbar = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(mockCurrentUser);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-display font-bold text-lg">
              IQ
            </div>
            <span className="font-display text-2xl font-semibold text-slate-900">
              Patent<span className="text-amber-500">IQ</span>
            </span>
            <span className="code-chip hidden sm:inline bg-indigo-50 text-indigo-700">v1.2 AI</span>
          </Link>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className="relative py-1">
                {({ isActive }) => (
                  <span
                    className={`flex items-center gap-1.5 font-body text-sm font-medium transition-colors ${
                      isActive ? 'text-indigo-600 font-semibold' : 'text-slate-600 hover:text-indigo-600'
                    }`}
                  >
                    {item.icon && <item.icon className="h-4 w-4" />}
                    {item.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute -bottom-1 left-0 right-0 h-[2px] bg-amber-500 rounded-full"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </span>
                )}
              </NavLink>
            ))}
          </div>

          {/* User Auth Profile Badge */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-slate-50 p-1 pr-3 hover:bg-slate-100 transition shadow-2xs"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 font-body text-xs font-bold text-white">
                  {currentUser.fullName.charAt(0)}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="font-body text-xs font-semibold text-slate-800 leading-tight">
                    {currentUser.fullName.split(' ')[0]}
                  </p>
                  <span className="font-mono text-[9px] font-bold text-indigo-600 uppercase">
                    {currentUser.role}
                  </span>
                </div>
                <Shield className="h-3.5 w-3.5 text-indigo-600 hidden sm:block" />
              </button>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 font-body text-xs font-semibold text-white hover:bg-indigo-500 transition shadow-sm"
              >
                <User className="h-4 w-4" />
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onLogin={(user) => setCurrentUser(user)}
        onLogout={() => setCurrentUser(null)}
      />
    </>
  );
};

export default Navbar;
