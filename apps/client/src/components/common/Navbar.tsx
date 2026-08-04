import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Shield, BookOpen, History, UploadCloud, Search, Cpu } from 'lucide-react';
import AuthModal from './AuthModal';
import { getCurrentUser } from '../../services/api';
import type { UserProfile } from '../../types/auth';

const navItems = [
  { to: '/search', label: 'Search Workspace', icon: Search },
  { to: '/upload', label: 'Invention Compare', icon: UploadCloud },
  { to: '/history', label: 'Search History', icon: History },
  { to: '/how-it-works', label: 'Architecture', icon: Cpu },
  { to: '/docs-preview', label: 'API Specs', icon: BookOpen },
];

const Navbar = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    async function checkAuthSession() {
      try {
        const user = await getCurrentUser();
        if (user) {
          setCurrentUser({
            id: user.id,
            email: user.email,
            fullName: user.name,
            role: 'User',
          });
        }
      } catch (err) {
        console.warn('Session check failed:', err);
      }
    }
    checkAuthSession();
  }, []);

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white font-display font-bold text-lg shadow-sm">
              IQ
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-slate-900">
              Patent<span className="text-blue-600">IQ</span>
            </span>
          </Link>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className="relative py-1">
                {({ isActive }) => (
                  <span
                    className={`flex items-center gap-1.5 font-body text-xs font-semibold transition-colors ${
                      isActive ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'
                    }`}
                  >
                    {item.icon && <item.icon className="h-4 w-4" />}
                    {item.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute -bottom-1 left-0 right-0 h-[2px] bg-blue-600 rounded-full"
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
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 font-body text-xs font-bold text-white">
                  {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="font-body text-xs font-semibold text-slate-800 leading-tight">
                    {currentUser.fullName ? currentUser.fullName.split(' ')[0] : 'User'}
                  </p>
                  <span className="font-mono text-[9px] font-bold text-blue-600 uppercase">
                    USER
                  </span>
                </div>
                <Shield className="h-3.5 w-3.5 text-blue-600 hidden sm:block" />
              </button>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 font-body text-xs font-semibold text-white hover:bg-blue-500 transition shadow-sm"
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
