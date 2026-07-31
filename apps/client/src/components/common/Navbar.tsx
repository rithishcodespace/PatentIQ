import { Link, NavLink } from "react-router-dom";
import { motion } from "framer-motion";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/search", label: "Search" },
];

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-100 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display text-2xl font-semibold text-indigo">
            Patent<span className="text-amber">AI</span>
          </span>
          <span className="code-chip hidden sm:inline">v1.0</span>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-8">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className="relative py-1">
              {({ isActive }) => (
                <span
                  className={`font-body text-sm font-medium transition-colors ${
                    isActive ? "text-indigo" : "text-slate hover:text-indigo"
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute -bottom-1 left-0 right-0 h-[2px] bg-amber"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </span>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
