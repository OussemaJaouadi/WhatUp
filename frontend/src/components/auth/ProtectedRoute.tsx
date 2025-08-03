import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { authUtils } from '@/lib/authUtils';
import { websocketService } from '@/services/websocket';
import { WebSocketMessagePayload } from '@/types/message';
import { useMessages } from '@/hooks/useMessages';
import { getApiBaseUrl } from '@/lib/env';

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
    if (!decodedToken || typeof decodedToken.role !== "string" || !decodedToken.sub) {
      throw new Error("Invalid token or missing role/user ID");
    }
    const userRole = decodedToken.role;
    const userId = decodedToken.sub;
    const { messages, sendMessage } = useMessages({ userId });

    // TODO: Handle messages or sendMessage as needed for WebSocket events

    if (allowedRoles && !allowedRoles.includes(userRole)) {
      return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
  } catch (error) {
    console.error("Invalid token:", error);
    authUtils.removeToken();
    return <Navigate to="/" replace />;
  }
};

export default ProtectedRoute;
