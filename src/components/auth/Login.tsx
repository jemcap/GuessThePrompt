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
        toastId: "reset-password-success",
      });
    }
  }, [location.state?.message]);

  const onSubmit = async (data: LoginFormData) => {
    setError("");
    setLoading(true);

    try {
      const result = await login(data.email, data.password);

      // Show success toast for login
      toast.success("Welcome back! Login successful.", {
        position: "top-center",
        autoClose: 3000,
      });

      // Handle different score transfer scenarios based on your backend response
      if (result?.transferredScore) {
        // Score was successfully transferred
        // Show success message about transferred score
        toast.success(
          `🎉 Great! Your trial score of ${result.transferredScore.score} points has been saved to your account!`,
          {
            position: "top-center",
            autoClose: 5000,
          }
        );
      } else if (result?.scoreTransferInfo) {
        // Handle other transfer scenarios
        const { status, message } = result.scoreTransferInfo;

        switch (status) {
          case "already_submitted":
            // User already played today - this is normal
            toast.info(message || "You've already submitted your daily guess today!", {
              position: "top-center",
              autoClose: 4000,
            });
            break;
          case "no_guest_score":
            // Normal login without guest score - this is expected
            break;
          case "transfer_failed":
            // Technical issue but login succeeded
            console.warn("Score transfer failed but login successful");
            toast.warning(
              'Login successful, but there was an issue transferring your trial score. Please contact support if needed.',
              {
                position: "top-center",
                autoClose: 6000,
              }
            );
            break;
        }
      }

      // Navigate to the page they were trying to access, or /daily by default
      navigate(from, { replace: true });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      // Show error toast
      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const email = getValues("email");
    
    if (!email) {
      const errorMessage = "Please enter your email address first";
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 4000,
      });
      return;
    }

    setError("");
    setForgotPasswordLoading(true);

    try {
      await forgotPassword(email);
      setForgotPasswordSent(true);
      // Show success message
      toast.success(`Password reset email sent to ${email}. Please check your inbox.`, {
        position: "top-center",
        autoClose: 6000,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to send password reset email";
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 5000,
      });
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 py-12 px-4 sm:px-6 lg:px-8 relative">
      <Link
        to="/"
        className="absolute top-4 left-4 flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
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
        <span className="font-medium">Back to Home</span>
      </Link>
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Log in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-300">
            Or{" "}
            <Link
              to="/register"
              className="font-medium text-blue-400 hover:text-blue-300"
            >
              create a new account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {forgotPasswordSent && (
            <div className="rounded-md bg-green-900/20 border border-green-800 p-4">
              <div className="text-sm text-green-300">
                Password reset email sent! Please check your inbox and follow the instructions.
              </div>
            </div>
          )}
          {error && (
            <div className="rounded-md bg-red-900/20 border border-red-800 p-4">
              <div className="text-sm text-red-300">{error}</div>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                type="email"
                autoComplete="email"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-400 text-white bg-gray-800 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-400 text-white bg-gray-800 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-600 bg-gray-800 rounded"
                {...register("rememberMe")}
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-white"
              >
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <button 
                type="button"
                onClick={handleForgotPassword}
                disabled={forgotPasswordLoading}
                className="font-medium text-blue-400 hover:text-blue-300 disabled:opacity-50"
              >
                {forgotPasswordLoading ? "Sending..." : "Forgot your password?"}
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "Logging in..."
                : hasGuestScore
                ? "Log in & Save Score"
                : "Log in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
