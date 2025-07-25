import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { DecodedToken } from '@/types/auth';
import { authUtils } from '@/lib/authUtils';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const token = authUtils.getToken();

  if (!token) {
    return <Navigate to="/" replace />;
  }

  try {
    const decodedToken = authUtils.decodeToken(token);
    if (!decodedToken) {
      throw new Error("Invalid token");
    }
    const userRole = decodedToken.role; // Assuming your JWT has a 'role' claim

    if (allowedRoles && !allowedRoles.includes(userRole)) {
      // User does not have the required role, redirect to an unauthorized page or dashboard
      return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
  } catch (error) {
    console.error("Invalid token:", error);
    authUtils.removeToken(); // Clear invalid token
    return <Navigate to="/" replace />;
  }
};

export default ProtectedRoute;
