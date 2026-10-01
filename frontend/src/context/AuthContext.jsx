import { useEffect, useState } from "react";
import api from "../services/api";
import AuthContext from "./AuthContext";

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const [token, setToken] = useState(
    localStorage.getItem("accessToken")
  );

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const savedToken =
        localStorage.getItem("accessToken");

      // No access token means user is simply logged out.
      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(
          "/auth/profile"
        );

        setUser(response.data.user);
        setToken(
          localStorage.getItem("accessToken")
        );
      } catch (error) {
        console.error(
          "Authentication check failed:",
          error
        );

        localStorage.removeItem(
          "accessToken"
        );

        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (
    email,
    password
  ) => {
    const response = await api.post(
      "/auth/login",
      {
        email,
        password,
      }
    );

    const accessToken =
      response.data.accessToken;

    localStorage.setItem(
      "accessToken",
      accessToken
    );

    setToken(accessToken);
    setUser(response.data.user);

    return response.data;
  };

  const register = async (
    name,
    email,
    password,
    role
  ) => {
    const response = await api.post(
      "/auth/register",
      {
        name,
        email,
        password,
        role,
      }
    );

    return response.data;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error(
        "Logout request failed:",
        error
      );
    } finally {
      localStorage.removeItem(
        "accessToken"
      );

      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated:
          Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;