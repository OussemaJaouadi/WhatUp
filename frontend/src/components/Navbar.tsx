
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MessageCircle, LogOut, User, Settings, Menu, X } from "lucide-react";
import { ThemeToggle } from "./theme/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const token = localStorage.getItem("jwt_token");
  
  // Hide navbar on auth pages
  const hideNavbarPaths = ['/login', '/register'];
  if (hideNavbarPaths.includes(location.pathname)) {
    return null;
  }
  
  let userRole: string | null = null;
  if (token) {
    try {
      userRole = JSON.parse(atob(token.split(".")[1])).role;
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("jwt_token");
    navigate("/login");
    setMobileMenuOpen(false);
  };

  const isActivePath = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-slate-900/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <MessageCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            <span className="font-bold text-lg text-slate-900 dark:text-slate-100">WhatUp</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {!token ? (
              <>
                <Link to="/login">
                  <Button 
                    variant={isActivePath('/login') ? 'default' : 'ghost'} 
                    size="sm"
                    className="font-medium"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button 
                    variant={isActivePath('/register') ? 'default' : 'outline'} 
                    size="sm"
                    className="font-medium ml-2 bg-amber-600 hover:bg-amber-700 text-white border-amber-600"
                  >
                    Get Started
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/dashboard">
                  <Button 
                    variant={isActivePath('/dashboard') ? 'default' : 'ghost'} 
                    size="sm"
                    className="font-medium"
                  >
                    Dashboard
                  </Button>
                </Link>
                <Link to="/profile">
                  <Button 
                    variant={isActivePath('/profile') ? 'default' : 'ghost'} 
                    size="sm"
                    className="font-medium"
                  >
                    <User className="h-4 w-4 mr-1.5" />
                    Profile
                  </Button>
                </Link>
                {userRole === "admin" && (
                  <Link to="/admin">
                    <Button 
                      variant={isActivePath('/admin') ? 'default' : 'ghost'} 
                      size="sm"
                      className="font-medium"
                    >
                      <Settings className="h-4 w-4 mr-1.5" />
                      Admin
                    </Button>
                  </Link>
                )}
                <Button 
                  onClick={handleLogout} 
                  variant="ghost" 
                  size="sm"
                  className="font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 ml-2"
                >
                  <LogOut className="h-4 w-4 mr-1.5" />
                  Sign Out
                </Button>
                <ThemeToggle />
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            {!token && <ThemeToggle />}
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="py-4 space-y-2">
              {!token ? (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button 
                      variant={isActivePath('/login') ? 'default' : 'ghost'} 
                      className="w-full justify-start font-medium"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button 
                      variant={isActivePath('/register') ? 'default' : 'ghost'} 
                      className="w-full justify-start font-medium"
                    >
                      Get Started
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button 
                      variant={isActivePath('/dashboard') ? 'default' : 'ghost'} 
                      className="w-full justify-start font-medium"
                    >
                      Dashboard
                    </Button>
                  </Link>
                  <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                    <Button 
                      variant={isActivePath('/profile') ? 'default' : 'ghost'} 
                      className="w-full justify-start font-medium"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Button>
                  </Link>
                  {userRole === "admin" && (
                    <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
                      <Button 
                        variant={isActivePath('/admin') ? 'default' : 'ghost'} 
                        className="w-full justify-start font-medium"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Admin
                      </Button>
                    </Link>
                  )}
                  <Button 
                    onClick={handleLogout} 
                    variant="ghost" 
                    className="w-full justify-start font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                  <div className="px-3 pt-2">
                    <ThemeToggle />
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
