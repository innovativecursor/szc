import React, { useState } from "react";
import {
  Button,
  CircularProgress,
  Alert,
  Box,
  Typography,
} from "@mui/material";
import { Google as GoogleIcon } from "@mui/icons-material";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";

const GoogleOAuthButton = ({
  variant = "outlined",
  size = "large",
  fullWidth = false,
  role = null,
  onError,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { handleGoogleOAuthSuccess } = useAuth();
  const navigate = useNavigate();

  const googleLogin = useGoogleLogin({
    flow: "implicit",
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError("");

      try {
        // Send access token to backend for authentication
        const response = await authAPI.authenticateGoogleOAuth(
          tokenResponse.access_token,
          role || "user"
        );

        if (response.data.success) {
          const { user, accessToken } = response.data.data;

          // Store token and user data
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("user", JSON.stringify(user));

          // Update auth context
          handleGoogleOAuthSuccess(user, accessToken);

          // Show success and redirect
          setTimeout(() => {
            navigate("/dashboard");
          }, 1000);
        } else {
          throw new Error(
            response.data.message || "Google authentication failed"
          );
        }
      } catch (err) {
        console.error("Google login failed:", err);
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Google login failed. Please try again.";
        setError(errorMessage);

        if (onError) {
          onError(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      const errorMessage = "Google login cancelled";
      setError(errorMessage);

      if (onError) {
        onError(errorMessage);
      }
    },
  });

  const handleGoogleSignIn = () => {
    setError("");
    googleLogin();
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Button
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        onClick={handleGoogleSignIn}
        disabled={loading}
        startIcon={loading ? <CircularProgress size={20} /> : <GoogleIcon />}
        sx={{
          backgroundColor: variant === "contained" ? "#4285f4" : "transparent",
          color: variant === "contained" ? "white" : "#4285f4",
          borderColor: "#4285f4",
          "&:hover": {
            backgroundColor:
              variant === "contained" ? "#3367d6" : "rgba(66, 133, 244, 0.04)",
            borderColor: "#3367d6",
          },
        }}
      >
        {loading
          ? "Signing in..."
          : `Continue with Google${role ? ` (${role})` : ""}`}
      </Button>

      {role && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 1, display: "block", textAlign: "center" }}
        >
          Signing in as: {role}
        </Typography>
      )}
    </Box>
  );
};

export default GoogleOAuthButton;
