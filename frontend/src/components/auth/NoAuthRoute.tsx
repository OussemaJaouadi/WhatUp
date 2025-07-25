import { Navigate, useLocation } from "react-router-dom";
import { authUtils } from "@/lib/authUtils";

export function NoAuthRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const token = authUtils.getToken();
  let isTokenValid = false;
  if (token) {
    const decoded = authUtils.decodeToken(token) as { exp?: number };
    if (decoded && typeof decoded.exp === "number") {
      // exp is in seconds since epoch
      const now = Math.floor(Date.now() / 1000);
      isTokenValid = decoded.exp > now;
    } else {
      // If no exp, treat as invalid
      isTokenValid = false;
    }
  }

  if (token && !isTokenValid) {
    // If token exists but is invalid/expired, remove it
    authUtils.removeToken();
  }

  if (token && isTokenValid) {
    // Already logged in and token is valid, redirect to dashboard
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}
