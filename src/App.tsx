import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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

function App() {
  return (
    <Router>
      <AuthProvider>
        <IntroProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route 
              path="daily" 
              element={<Daily />} 
            />
            <Route 
              path="practice" 
              element={<Practice />} 
            />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
          </Route>
        </Routes>
        </IntroProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
