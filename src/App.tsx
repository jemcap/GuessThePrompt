import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from "./contexts/AuthContext";
import { IntroProvider } from "./contexts/IntroContext";
import Layout from "./components/layout/Layout";
import Daily from "./pages/Daily";
import Home from "./pages/Home";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Profile from "./components/profile/Profile";
import Practice from "./pages/Practice";
import ResetPassword from "./pages/ResetPassword";

function App() {
  return (
    <Router>
      <AuthProvider>
        <IntroProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="daily" element={<Daily />} />
              <Route path="practice" element={<Practice />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route
                path="profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route path="reset-password" element={<ResetPassword />} />
            </Route>
          </Routes>
          {/* Toast notifications container with custom styling to match your dark theme */}
          <ToastContainer
            position="top-center"
            autoClose={4000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
            toastStyle={{
              backgroundColor: '#374151', // gray-700
              color: '#f9fafb', // gray-50
              border: '1px solid #4b5563', // gray-600
            }}
          />
        </IntroProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
