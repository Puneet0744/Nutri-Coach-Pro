import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthProvider";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();

  if (loading)
    return <div className="text-center mt-10">Checking authentication...</div>;

  if (!user) return <Navigate to="/signin" replace />;

  return children;
};

export default ProtectedRoute;
