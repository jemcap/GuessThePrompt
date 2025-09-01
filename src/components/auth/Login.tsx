import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from 'react-toastify';
import { useAuth } from "../../contexts/AuthContext";

type LoginFormData = {
  email: string;
  password: string;
  rememberMe: boolean;
};

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, forgotPassword } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);

  // Get the page user was trying to access before being redirected to login
  const from = location.state?.from?.pathname || "/daily";

  // Check if user has a guest score to transfer
  const hasGuestScore = sessionStorage.getItem("guestSessionId");

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<LoginFormData>();

  // Show guest score transfer notification
  useEffect(() => {
    if (hasGuestScore) {
      toast.info("You have a trial score! Log in to save it to your account permanently.", {
        position: "top-center",
        autoClose: 8000,
        toastId: "guest-score-info", // Prevent duplicate toasts
      });
    }
  }, [hasGuestScore]);

  // Show message from reset password page if any
  useEffect(() => {
    if (location.state?.message) {
      toast.success(location.state.message, {
        position: "top-center",
        autoClose: 6000,
      });
      // Clear the message from location state
      window.history.replaceState({}, document.title);
    }
  }, [location.state?.message]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError("");
      setLoading(true);
      await login(data.email, data.password);
      
      // Show success toast if they had a guest score
      if (hasGuestScore) {
        toast.success("Welcome back! Your trial score has been saved to your account.", {
          position: "top-center",
          autoClose: 5000,
        });
      }
      
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const email = getValues("email");
    if (!email) {
      setError("Please enter your email address first");
      return;
    }

    try {
      setForgotPasswordLoading(true);
      await forgotPassword(email);
      setForgotPasswordSent(true);
      toast.success("Password reset email sent! Check your inbox.", {
        position: "top-center",
        autoClose: 6000,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset email");
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-2xl p-8 space-y-6">
          {/* Header with Back Button */}
          <div className="relative text-center space-y-3">
            {/* Back to Home Button */}
            <Link 
              to="/" 
              className="absolute left-0 top-0 p-2 text-gray-400 hover:text-white transition-all duration-200 hover:scale-110 rounded-lg hover:bg-gray-700/50"
            >
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M10 19l-7-7m0 0l7-7m-7 7h18" 
                />
              </svg>
            </Link>
            <h2 className="text-3xl font-bold text-white">
              Welcome back
            </h2>
            <p className="text-gray-400">
              Sign in to continue your prompt challenge
            </p>
          </div>

          {/* Guest Score Notification */}
          {hasGuestScore && (
            <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-blue-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm text-blue-300 font-medium">
                    Trial Score Found!
                  </p>
                  <p className="text-xs text-blue-400 mt-1">
                    Log in to save your trial score permanently
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-red-900/20 border border-red-700/50 p-4 backdrop-blur-sm">
              <div className="text-sm text-red-300 text-center flex items-center justify-center">
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                {error}
              </div>
            </div>
          )}

          {/* Success Message for Password Reset */}
          {forgotPasswordSent && (
            <div className="rounded-lg bg-green-900/20 border border-green-700/50 p-4 backdrop-blur-sm">
              <div className="text-sm text-green-300 text-center flex items-center justify-center">
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Password reset email sent! Check your inbox.
              </div>
            </div>
          )}

          {/* Login Form */}
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-white mb-2"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={`block w-full px-4 py-3 border ${
                    errors.email ? "border-red-500" : "border-gray-600"
                  } bg-gray-700/50 backdrop-blur-sm rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200`}
                  placeholder="Enter your email"
                  {...register("email", { 
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Please enter a valid email address"
                    }
                  })}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-white mb-2"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  className={`block w-full px-4 py-3 border ${
                    errors.password ? "border-red-500" : "border-gray-600"
                  } bg-gray-700/50 backdrop-blur-sm rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200`}
                  placeholder="Enter your password"
                  {...register("password", { 
                    required: "Password is required",
                    minLength: {
                      value: 1,
                      message: "Password is required"
                    }
                  })}
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 focus:ring-offset-gray-800 focus:ring-2"
                    {...register("rememberMe")}
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                    Remember me
                  </label>
                </div>

                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={forgotPasswordLoading}
                  className="text-sm text-purple-400 hover:text-purple-300 transition-colors duration-200 disabled:opacity-50"
                >
                  {forgotPasswordLoading ? "Sending..." : "Forgot password?"}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-[1.02] disabled:hover:scale-100"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </div>
                ) : (
                  "Sign in"
                )}
              </button>
            </div>

            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-sm text-gray-400">
                Don't have an account?{" "}
                <button
                  onClick={() => navigate("/register")}
                  className="font-medium text-purple-400 hover:text-purple-300 transition-colors duration-200"
                >
                  Sign up
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
