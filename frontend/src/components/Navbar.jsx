import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { HiMenu, HiX } from 'react-icons/hi';
import { FaBolt, FaPlusCircle, FaSun, FaMoon } from 'react-icons/fa';
import { motion, AnimatePresence } from '../components/animations';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/');
  };

  return (
    <nav className="glass sticky top-0 z-50 border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 no-underline">
            <motion.div
              whileHover={{ rotate: [0, -8, 8, 0] }}
              transition={{ duration: 0.5 }}
              className="w-7 h-7 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center"
            >
              <span className="text-white font-bold text-xs">SS</span>
            </motion.div>
            <span className="text-lg font-bold text-text-dark font-[Raleway]">
              Survey<span className="text-primary">Swap</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/" className="text-text hover:text-text-dark transition-colors no-underline text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-text-dark/5">
              Home
            </Link>
            <Link to="/surveys" className="text-text hover:text-text-dark transition-colors no-underline text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-text-dark/5">
              Earn Credits
            </Link>
            {user && (
              <Link to="/dashboard" className="text-text hover:text-text-dark transition-colors no-underline text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-text-dark/5">
                Dashboard
              </Link>
            )}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-text/60 mr-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="hidden lg:inline">342 online</span>
            </div>

            {/* Theme Toggle with rotation */}
            <motion.button
              onClick={toggleTheme}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9, rotate: 180 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              className="p-2 rounded-lg bg-transparent border-none cursor-pointer text-text hover:text-primary hover:bg-primary/10 transition-colors"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={theme}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {theme === 'dark' ? <FaSun size={14} /> : <FaMoon size={14} />}
                </motion.div>
              </AnimatePresence>
            </motion.button>

            {user ? (
              <>
                <motion.div
                  key={user.karma}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 12 }}
                  className="flex items-center gap-1 bg-primary/15 text-primary px-2.5 py-1 rounded-full text-xs font-semibold border border-primary/20"
                >
                  <FaBolt size={10} />
                  {user.karma}
                </motion.div>
                <motion.button
                  onClick={() => navigate('/add-survey')}
                  whileHover={{ scale: 1.04, boxShadow: '0 4px 20px rgba(124,92,252,0.2)' }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-primary to-primary-dark text-white px-4 py-1.5 rounded-lg text-sm font-medium border-none cursor-pointer"
                >
                  <FaPlusCircle size={11} /> Post Survey
                </motion.button>
                <Link to="/profile" className="text-text hover:text-text-dark transition-colors no-underline text-sm">
                  {user.name?.split(' ')[0]}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-xs text-text/50 hover:text-red-400 transition-colors bg-transparent border-none cursor-pointer"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-text hover:text-text-dark transition-colors no-underline text-sm font-medium">
                  Login
                </Link>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  <Link
                    to="/signup"
                    className="bg-gradient-to-r from-primary to-primary-dark text-white px-4 py-1.5 rounded-lg no-underline text-sm font-medium"
                  >
                    Sign Up Free
                  </Link>
                </motion.div>
              </>
            )}
          </div>

          {/* Mobile */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Theme Toggle Mobile */}
            <motion.button
              onClick={toggleTheme}
              whileTap={{ rotate: 180 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              className="p-1.5 rounded-lg bg-transparent border-none cursor-pointer text-text hover:text-primary transition-colors"
            >
              {theme === 'dark' ? <FaSun size={14} /> : <FaMoon size={14} />}
            </motion.button>
            {user && (
              <motion.div
                key={user.karma}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1 bg-primary/15 text-primary px-2 py-0.5 rounded-full text-xs font-semibold border border-primary/20"
              >
                <FaBolt size={9} />
                {user.karma}
              </motion.div>
            )}
            <button
              className="bg-transparent border-none cursor-pointer text-text-dark p-1"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={mobileOpen ? 'close' : 'open'}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {mobileOpen ? <HiX size={22} /> : <HiMenu size={22} />}
                </motion.div>
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Mobile Nav — slide down animation */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="md:hidden overflow-hidden border-t border-border/50"
            >
              <div className="flex flex-col gap-1 pt-2 pb-3">
                <Link to="/" className="text-text hover:text-text-dark no-underline font-medium px-3 py-2 rounded-lg hover:bg-text-dark/5 text-sm" onClick={() => setMobileOpen(false)}>Home</Link>
                <Link to="/surveys" className="text-text hover:text-text-dark no-underline font-medium px-3 py-2 rounded-lg hover:bg-text-dark/5 text-sm" onClick={() => setMobileOpen(false)}>Earn Credits</Link>
                {user ? (
                  <>
                    <Link to="/dashboard" className="text-text hover:text-text-dark no-underline font-medium px-3 py-2 rounded-lg hover:bg-text-dark/5 text-sm" onClick={() => setMobileOpen(false)}>Dashboard</Link>
                    <Link to="/add-survey" className="text-primary font-semibold no-underline px-3 py-2 rounded-lg hover:bg-primary/10 text-sm flex items-center gap-1.5" onClick={() => setMobileOpen(false)}>
                      <FaPlusCircle size={12} /> Post Survey
                    </Link>
                    <Link to="/profile" className="text-text hover:text-text-dark no-underline font-medium px-3 py-2 rounded-lg hover:bg-text-dark/5 text-sm" onClick={() => setMobileOpen(false)}>Profile</Link>
                    <button onClick={handleLogout} className="text-left text-red-400 font-medium bg-transparent border-none cursor-pointer px-3 py-2 text-sm">Logout</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="text-text hover:text-text-dark no-underline font-medium px-3 py-2 rounded-lg hover:bg-text-dark/5 text-sm" onClick={() => setMobileOpen(false)}>Login</Link>
                    <Link to="/signup" className="text-primary font-semibold no-underline px-3 py-2 text-sm" onClick={() => setMobileOpen(false)}>Sign Up Free</Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
