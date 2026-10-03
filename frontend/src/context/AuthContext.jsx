import {
  useEffect,
  useState,
} from "react";

import AuthContext from "./AuthContext";

import api from "../services/api";


export function AuthProvider({
  children,
}) {
  const [
    user,
    setUser,
  ] = useState(null);

  const [
    token,
    setToken,
  ] = useState(
    () =>
      localStorage.getItem(
        "accessToken"
      )
  );

  const [
    loading,
    setLoading,
  ] = useState(true);


  // =========================================
  // LOAD CURRENT USER
  // =========================================

  const loadUser = async () => {
    try {
      const response =
        await api.get(
          "/auth/profile"
        );

      const currentUser =
        response.data?.user ||
        response.data?.data?.user ||
        null;

      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }

    } catch (error) {
      console.error(
        "Load user error:",
        error
      );

      setUser(null);

    } finally {
      setLoading(false);
    }
  };


  // =========================================
  // INITIAL AUTH CHECK
  // =========================================

  useEffect(() => {
    const initializeAuth =
      async () => {

        const storedToken =
          localStorage.getItem(
            "accessToken"
          );

        if (!storedToken) {
          setLoading(false);
          return;
        }

        await loadUser();
      };

    initializeAuth();
  }, []);


  // =========================================
  // LOGIN
  // =========================================

  const login = async (
    email,
    password
  ) => {

    const response =
      await api.post(
        "/auth/login",
        {
          email,
          password,
        }
      );


    const accessToken =
      response.data?.accessToken ||
      response.data?.data?.accessToken;


    if (!accessToken) {
      throw new Error(
        "Login succeeded but no access token was returned."
      );
    }


    // Save token BEFORE requesting profile
    localStorage.setItem(
      "accessToken",
      accessToken
    );

    setToken(accessToken);


    // Try to get the user from login response first
    let loggedInUser =
      response.data?.user ||
      response.data?.data?.user ||
      null;


    // If login response doesn't contain user,
    // get it from /profile using the new token.
    if (!loggedInUser) {
      try {
        const profileResponse =
          await api.get(
            "/auth/profile"
          );

        loggedInUser =
          profileResponse.data?.user ||
          profileResponse.data?.data?.user ||
          null;

      } catch (profileError) {

        console.error(
          "Profile loading after login failed:",
          profileError
        );
      }
    }


    if (!loggedInUser) {
      localStorage.removeItem(
        "accessToken"
      );

      setToken(null);
      setUser(null);

      throw new Error(
        "Login succeeded but user information could not be loaded."
      );
    }


    setUser(loggedInUser);

    return {
      ...response,
      data: {
        ...response.data,
        user: loggedInUser,
        accessToken,
      },
    };
  };


  // =========================================
  // REGISTER
  // =========================================

  const register = async (
    name,
    email,
    password,
    role = "seeker"
  ) => {

    const response =
      await api.post(
        "/auth/register",
        {
          name,
          email,
          password,
          role,
        }
      );

    return response;
  };


  // =========================================
  // LOGOUT
  // =========================================

  const logout = async () => {

    try {
      await api.post(
        "/auth/logout"
      );

    } catch (error) {

      console.error(
        "Logout error:",
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


  const isAuthenticated =
    Boolean(user);


  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    loadUser,
  };


  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}


export default AuthContext;