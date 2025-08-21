import { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";

interface User {
  id: string;
  email: string;
  username: string;
  totalXP?: number;
  level?: number;
  rank?: string;
}

interface AuthContextType {
  user: User | null;
  userStats: any;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<any>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  getUserStats: (userId: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userStats, setUserStats] = useState<any>(null);
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
          setUserStats(null);
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
    if (data.user?.id) {
      await getUserStats(data.user.id);
    }
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
        if (data.user?.id) {
          await getUserStats(data.user.id);
        }
      } else {
        // Try to refresh the token
        try {
          await refreshTokens();
        } catch (refreshError) {
          setUser(null);
          setUserStats(null);
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
      setUserStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    // Check if there's a guest session ID to transfer scores (same logic as register)
    const sessionId = sessionStorage.getItem('guestSessionId');
    
    // Create request body - only include sessionId if it exists AND is valid
    const requestBody: any = { email, password };
    
    // Only include sessionId if it exists and looks like a valid UUID
    if (sessionId && sessionId.length > 10 && sessionId.includes('-')) {
      requestBody.sessionId = sessionId;
    }
    
    const response = await fetch("http://localhost:3003/api/v1/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Include cookies for session management
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    console.log('Login response:', data)

    if (!response.ok) {
      throw new Error(data.error || "Login failed");
    }

    // Handle guest session cleanup based on backend response
    if (sessionId) {
      // Clean up guest session in these cases:
      // 1. Score was transferred successfully
      // 2. User already submitted today (backend cleaned it up)
      // 3. No guest score found (nothing to keep)
      if (data.transferredScore || 
          data.scoreTransferInfo?.status === 'already_submitted' ||
          data.scoreTransferInfo?.status === 'no_guest_score') {
        sessionStorage.removeItem('guestSessionId');
      }
      // Keep sessionId for 'transfer_failed' case in case user wants to try again
    }

    setUser(data.user);
    if (data.user?.id) {
      await getUserStats(data.user.id);
    }
    
    // Return the data to handle score transfer notifications
    return data;
  };

  const register = async (
    username: string,
    email: string,
    password: string
  ) => {
    // Check if there's a guest session ID to transfer scores
    const sessionId = sessionStorage.getItem('guestSessionId');
    
    // Create request body - only include sessionId if it exists AND is valid
    const requestBody: any = { username, email, password };
    
    // Only include sessionId if it exists and looks like a valid UUID
    if (sessionId && sessionId.length > 10 && sessionId.includes('-')) {
      requestBody.sessionId = sessionId;
    }
    
    const response = await fetch("http://localhost:3003/api/v1/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Registration failed");
    }

    // Clear guest session after successful registration (only if it existed)
    if (sessionId) {
      sessionStorage.removeItem('guestSessionId');
    }

    setUser(data.user);
    if (data.user?.id) {
      await getUserStats(data.user.id);
    }

    // Return the data to handle score transfer notifications
    return data;
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
      setUserStats(null);
      navigate("/");
    }
  };

  const getUserStats = async (userId: string) => { 
    if (!userId) {
      console.error("No userId provided to getUserStats");
      return;
    }

    try {
      const response = await fetch("http://localhost:3003/api/v1/stats/profile", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setUserStats(data.data);
      } else {
        throw new Error("Failed to fetch user stats");
      }
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, userStats, loading, login, register, logout, checkAuth, getUserStats }}
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

