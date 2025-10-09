import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, LogOut, User, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isEmployer, isCandidate } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/jobs" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition">
            <Briefcase className="w-6 h-6" />
            <span className="text-xl font-bold">JobPortal</span>
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link
                  to="/jobs"
                  className="text-slate-700 hover:text-slate-900 font-medium transition"
                >
                  Browse Jobs
                </Link>

                {isCandidate && (
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2 text-slate-700 hover:text-slate-900 font-medium transition"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    My Applications
                  </Link>
                )}

                {isCandidate && (
                  <Link
                    to="/saved"
                    className="text-slate-700 hover:text-slate-900 font-medium transition"
                  >
                    Saved Jobs
                  </Link>
                )}

                {isEmployer && (
                  <Link
                    to="/employer/dashboard"
                    className="flex items-center gap-2 text-slate-700 hover:text-slate-900 font-medium transition"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                )}

                <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.role}</p>
                      {isEmployer && user.companyName && (
                        <p className="text-xs text-slate-500">{user.companyName}</p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-slate-700 hover:text-slate-900 font-medium transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
