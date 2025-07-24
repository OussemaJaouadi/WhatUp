import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { DecodedToken } from '@/types/auth';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const token = localStorage.getItem('jwt_token');

  if (!token) {
    return <Navigate to="/" replace />;
  }

  try {
    const decodedToken = jwtDecode<DecodedToken>(token);
    const userRole = decodedToken.role; // Assuming your JWT has a 'role' claim

    if (allowedRoles && !allowedRoles.includes(userRole)) {
      // User does not have the required role, redirect to an unauthorized page or dashboard
      return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
  } catch (error) {
    console.error("Invalid token:", error);
    localStorage.removeItem('jwt_token'); // Clear invalid token
    return <Navigate to="/" replace />;
  }
};

export default ProtectedRoute;
