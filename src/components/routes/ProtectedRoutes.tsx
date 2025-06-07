import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { role, isLoading } = useAuth(); // Asegúrate de exponer isLoading en el contexto

  if (isLoading) {
    return <div>Cargando...</div>; // O un spinner
  }

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
