
import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, LogOut, Home, Lock, BarChart3, User } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  isAdmin: boolean;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, isAdmin, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogoutClick = () => {
    onLogout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="sticky top-0 z-50 bg-white/60 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 flex-shrink-0">
              <div className="bg-indigo-600 p-1.5 sm:p-2 rounded-lg shadow-lg shadow-indigo-200">
                <BarChart3 className="text-white w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <Link to="/" className="text-lg sm:text-xl font-bold bg-gradient-to-r from-indigo-600 via-violet-600 to-rose-600 bg-clip-text text-transparent">
                Fund Manager
              </Link>
            </div>

            <div className="flex items-center space-x-1 sm:space-x-4">
              <Link
                to="/"
                className={`flex items-center px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-semibold transition-all ${
                  location.pathname === '/' ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-600 hover:text-indigo-600 hover:bg-white/40'
                }`}
              >
                <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                <span className="hidden xs:inline">Home</span>
              </Link>

              {isAdmin ? (
                <>
                  <Link
                    to="/admin"
                    className={`flex items-center px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-semibold transition-all ${
                      location.pathname === '/admin' ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-600 hover:text-indigo-600 hover:bg-white/40'
                    }`}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                    <span className="hidden xs:inline">Admin</span>
                  </Link>
                  <button
                    onClick={handleLogoutClick}
                    className="flex items-center px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-semibold text-rose-600 hover:bg-rose-50/50 transition-all"
                  >
                    <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                    <span className="hidden xs:inline">Logout</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-600 text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 whitespace-nowrap active:scale-95"
                >
                  <Lock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>

      <footer className="mt-auto py-8 bg-white/30 backdrop-blur-md border-t border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-slate-500 text-xs sm:text-sm">
          <p className="text-center md:text-left font-medium">© {new Date().getFullYear()} Fund Manager System.</p>
          <div className="flex items-center mt-4 md:mt-0 space-x-4">
            <span className="flex items-center bg-white/40 px-3 py-1 rounded-full border border-white/40"><User className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 text-indigo-500"/> Admin Managed</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
