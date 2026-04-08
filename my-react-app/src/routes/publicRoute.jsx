import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

const PublicRoute = ({ children }) => {
  const { token } = useAuth();
  if (token && token !== "undefined") {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default PublicRoute;
