import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { API_ENDPOINTS } from "../utils/endpoints";

const ProtectedRoute = ({ children }) => {
  const { token } = useSelector((state) => state.auth);

  if (!token) {
    return <Navigate to={API_ENDPOINTS.LOGIN} replace />;
  }

  return children;
};

export default ProtectedRoute;
