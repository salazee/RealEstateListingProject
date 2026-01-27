// src/components/Navbar.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  HomeIcon, 
  BuildingOfficeIcon, 
  HeartIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  HomeModernIcon
} from '@heroicons/react/24/outline';


export default function Navbar() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const user = (() => {
    try {
      const stored = localStorage.getItem('user');
      return stored && stored !== 'undefined' ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
    window.location.reload();
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/dashboard/admin';
    if (user.role === 'seller') return '/dashboard/seller';
    return '/dashboard/buyer';
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <HomeModernIcon className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">BuyRight</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link 
              to="/" 
              className="flex items-center gap-1 text-gray-700 hover:text-blue-600 transition"
            >
              <HomeIcon className="w-5 h-5" />
              <span>Home</span>
            </Link>

            <Link 
              to="/allListing" 
              className="flex items-center gap-1 text-gray-700 hover:text-blue-600 transition"
            >
              <BuildingOfficeIcon className="w-5 h-5" />
              <span>Properties</span>
            </Link>

            {user && user.role === 'buyer' && (
              <Link 
                to="/favorites" 
                className="flex items-center gap-1 text-gray-700 hover:text-blue-600 transition"
              >
                <HeartIcon className="w-5 h-5" />
                <span>Favorites</span>
              </Link>
            )}

            {user ? (
              <div className="flex items-center gap-4">
                <Link
                  to={getDashboardLink()}
                  className="flex items-center gap-1 text-gray-700 hover:text-blue-600 transition"
                >
                  <UserCircleIcon className="w-5 h-5" />
                  <span>Dashboard</span>
                </Link>

                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">
                    {user.name}
                  </span>
                  <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
                    {user.role}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 transition font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4 space-y-3">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100"
            >
              <HomeIcon className="w-5 h-5" />
              <span>Home</span>
            </Link>

            <Link
              to="/allListing"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100"
            >
              <BuildingOfficeIcon className="w-5 h-5" />
              <span>Properties</span>
            </Link>

            {user && user.role === 'buyer' && (
              <Link
                to="/favorites"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100"
              >
                <HeartIcon className="w-5 h-5" />
                <span>Favorites</span>
              </Link>
            )}

            {user ? (
              <>
                <Link
                  to={getDashboardLink()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100"
                >
                  <UserCircleIcon className="w-5 h-5" />
                  <span>Dashboard</span>
                </Link>

                <div className="px-3 py-2 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-gray-600">{user.role}</p>
                </div>

                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}