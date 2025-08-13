import { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";

interface User {
  id: string;
  email: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let refreshInterval: NodeJS.Timeout;

    if (user) {
      refreshInterval = setInterval(async () => {
        try {
          await refreshTokens();
        } catch (error) {
          console.error("Token refresh failed:", error);
          setUser(null);
        }
      }, 14 * 60 * 1000);
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [user]);

  // Utility function for making authenticated requests (currently unused but available for future use)
  // const makeAuthenticatedRequest = async (
  //   url: string,
  //   options: RequestInit = {}
  // ) => {
  //   const response = await fetch(url, {
  //     ...options,
  //     credentials: "include", // Always include cookies
  //     headers: {
  //       "Content-Type": "application/json",
  //       ...options.headers,
  //     },
  //   });

  //   // Handle token expiration
  //   if (response.status === 401) {
  //     const errorData = await response.json().catch(() => ({}));

  //     if (errorData.code === "TOKEN_EXPIRED") {
  //       try {
  //         await refreshTokens();
  //         // Retry the original request
  //         return fetch(url, {
  //           ...options,
  //           credentials: "include",
  //           headers: {
  //             "Content-Type": "application/json",
  //             ...options.headers,
  //           },
  //         });
  //       } catch (refreshError) {
  //         // Refresh failed, logout user
  //         setUser(null);
  //         navigate("/login");
  //         throw new Error("Session expired. Please log in again.");
  //       }
  //     }
  //   }

  //   return response;
  // };

  const refreshTokens = async () => {
    const response = await fetch("http://localhost:3003/api/v1/auth/refresh", {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to refresh tokens");
    }

    const data = await response.json();
    setUser(data.user);
    return data;
  };

  // Check if user is authenticated on mount and when auth state changes
  const checkAuth = async () => {
    try {
      const response = await fetch("http://localhost:3003/api/v1/auth/verify", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        // Try to refresh the token
        try {
          await refreshTokens();
        } catch (refreshError) {
          setUser(null);
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch("http://localhost:3003/api/v1/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Include cookies for session management
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    console.log(data)

    if (!response.ok) {
      throw new Error(data.error || "Login failed");
    }

    setUser(data.user);
  };

  const register = async (
    username: string,
    email: string,
    password: string
  ) => {
    const response = await fetch("http://localhost:3003/api/v1/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Registration failed");
    }

    setUser(data.user);
  };

  const logout = async () => {
    try {
      await fetch("http://localhost:3003/api/v1/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      navigate("/");
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, checkAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

// Custom hook for making authenticated API requests
export const useAuthenticatedFetch = () => {
  const { user } = useAuth();
  
  return async (url: string, options: RequestInit = {}) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    return fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  };
};

