import { Navigate, Outlet } from "react-router";
import { useAuth } from "../context/AuthContext";

/** Redirects to /login if not authenticated. */
export function RequireAuth() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

/** Only accessible to public users; admins are sent to /dashboard. */
export function RequirePublic() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "admin") return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
