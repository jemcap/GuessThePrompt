import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { user, loading } = useAuth();
  
  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login page but save the attempted location
    // User will be redirected back after successful login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // User is authenticated, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;