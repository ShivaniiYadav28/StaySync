import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../context/useAuth";

function ProtectedRoute() {
  const {
    isAuthenticated,
    loading,
  } = useAuth();

  // Wait until authentication is checked
  if (loading) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "18px",
          color: "#0F766E",
        }}
      >
        Checking authentication...
      </div>
    );
  }

  // User is not logged in
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;