import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Briefs from "./pages/Briefs";
import BriefDetail from "./pages/BriefDetail";
import Submissions from "./pages/Submissions";
import SubmissionDetail from "./pages/SubmissionDetail";
import Portfolios from "./pages/Portfolios";
import PortfolioDetail from "./pages/PortfolioDetail";
import AdminPanel from "./pages/AdminPanel";
import Profile from "./pages/Profile";
import OAuthCallback from "./pages/OAuthCallback";

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
});

// Protected Route component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.roles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// App Routes component
const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          !isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />
        }
      />
      <Route
        path="/register"
        element={
          !isAuthenticated ? <Register /> : <Navigate to="/dashboard" replace />
        }
      />

      <Route path="/oauth/callback" element={<OAuthCallback />} />

      <Route
        path="/"
        element={
          <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/briefs"
        element={
          <ProtectedRoute>
            <Briefs />
          </ProtectedRoute>
        }
      />

      <Route
        path="/briefs/:id"
        element={
          <ProtectedRoute>
            <BriefDetail />
          </ProtectedRoute>
        }
      />

      <Route
        path="/submissions"
        element={
          <ProtectedRoute>
            <Submissions />
          </ProtectedRoute>
        }
      />

      <Route
        path="/submissions/:id"
        element={
          <ProtectedRoute>
            <SubmissionDetail />
          </ProtectedRoute>
        }
      />

      <Route
        path="/portfolios"
        element={
          <ProtectedRoute>
            <Portfolios />
          </ProtectedRoute>
        }
      />

      <Route
        path="/portfolios/:userId/:portfolioId"
        element={
          <ProtectedRoute>
            <PortfolioDetail />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
            <AdminPanel />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

// Main App component
function App() {
  return (
    <GoogleOAuthProvider clientId="1022476623857-t50qf3ing7kdar5scavab91t2du74ki5.apps.googleusercontent.com">
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <div className="App">
              <Navbar />
              <AppRoutes />
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
