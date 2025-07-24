import { Link, useLocation, useNavigate } from "react-router-dom";
import { MessageCircle, LogOut, User, Crown } from "lucide-react";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("jwt_token");
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
  };

  return (
    <nav className="w-full bg-card/80 dark:bg-card-dark/80 border-b border-border dark:border-border-dark px-6 py-4 flex items-center justify-between">
      <Link to="/" className="flex items-center space-x-2">
        <MessageCircle className="h-6 w-6 text-accent" />
        <span className="font-crimson font-bold text-xl">WhatUp</span>
      </Link>
      <div className="space-x-2 flex items-center">
        {!token ? (
          <>
            <Link to="/login" className={`btn-cozy px-4 py-2${location.pathname === '/login' ? ' ring-2 ring-accent' : ''}`}>Login</Link>
            <Link to="/register" className={`btn-accent px-4 py-2${location.pathname === '/register' ? ' ring-2 ring-accent' : ''}`}>Register</Link>
          </>
        ) : (
          <>
            <Link to="/dashboard" className={`btn-cozy px-4 py-2${location.pathname === '/dashboard' ? ' ring-2 ring-accent' : ''}`}>Dashboard</Link>
            <Link to="/profile" className={`btn-cozy px-4 py-2${location.pathname === '/profile' ? ' ring-2 ring-accent' : ''}`}><User className="inline h-4 w-4 mr-1" />Profile</Link>
            {userRole === "admin" && (
              <Link to="/admin" className={`btn-accent px-4 py-2${location.pathname === '/admin' ? ' ring-2 ring-accent' : ''}`}><Crown className="inline h-4 w-4 mr-1" />Admin</Link>
            )}
            <button onClick={handleLogout} className="btn-cozy px-4 py-2 flex items-center"><LogOut className="inline h-4 w-4 mr-1" />Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}
