import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { API_ENDPOINTS } from "../utils/endpoints";

const ProtectedRoute = ({ children }) => {
  const { token } = useSelector((state) => state.auth);
  if (!token) {
    console.log("No token found, redirecting to login...");
    return <Navigate to={API_ENDPOINTS.LOGIN} replace />;
  }

  return children;
};

export default ProtectedRoute;
