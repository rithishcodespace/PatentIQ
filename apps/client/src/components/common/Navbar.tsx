import { Link, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Shield, BookOpen, History, Search, Cpu, Activity } from 'lucide-react';
import AuthModal from './AuthModal';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/search', label: 'Prior-Art Search', icon: Search },
  { to: '/history', label: 'Search History', icon: History },
  { to: '/dashboard', label: 'System Health', icon: Activity },
  { to: '/how-it-works', label: 'Architecture', icon: Cpu },
  { to: '/docs-preview', label: 'API Specs', icon: BookOpen },
];

const Navbar = () => {
  const { user, openAuthModal } = useAuth();

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="w-full flex h-16 items-center justify-between px-4 sm:px-8 lg:px-12">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-display font-bold text-lg shadow-sm">
              IQ
            </div>
            <div className="flex items-center gap-2">
              <span className="font-display text-xl font-bold tracking-tight text-slate-900">
                Patent<span className="text-indigo-600">IQ</span>
              </span>
              <span className="hidden sm:inline-block font-mono text-[9px] font-bold bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-200">
                ENTERPRISE
              </span>
            </div>
          </Link>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className="relative py-1">
                {({ isActive }) => (
                  <span
                    className={`flex items-center gap-1.5 font-body text-xs font-semibold transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600'
                      }`}
                  >
                    {item.icon && <item.icon className="h-4 w-4" />}
                    {item.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute -bottom-1 left-0 right-0 h-[2px] bg-indigo-600 rounded-full"
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
            {user ? (
              <button
                onClick={openAuthModal}
                className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-slate-50 p-1 pr-3 hover:bg-slate-100 transition shadow-2xs"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 font-body text-xs font-bold text-white">
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="font-body text-xs font-semibold text-slate-800 leading-tight">
                    {user.fullName ? user.fullName.split(' ')[0] : 'User'}
                  </p>
                  <span className="font-mono text-[9px] font-bold text-indigo-600 uppercase">
                    USER
                  </span>
                </div>
                <Shield className="h-3.5 w-3.5 text-indigo-600 hidden sm:block" />
              </button>
            ) : (
              <button
                onClick={openAuthModal}
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
      <AuthModal />
    </>
  );
};

export default Navbar;
