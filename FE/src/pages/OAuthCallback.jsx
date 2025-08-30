import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";

const OAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleOTPVerificationSuccess } = useAuth();
  const [status, setStatus] = useState("processing"); // processing, success, error
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const success = searchParams.get("success");
        const error = searchParams.get("error");
        const details = searchParams.get("details");
        const token = searchParams.get("token");
        const userId = searchParams.get("userId");
        const email = searchParams.get("email");
        const username = searchParams.get("username");
        const roles = searchParams.get("roles");
        const displayName = searchParams.get("displayName");
        const profileImageURL = searchParams.get("profileImageURL");

        if (error) {
          setStatus("error");
          setMessage(`${error}${details ? `: ${details}` : ""}`);
          setLoading(false);
          return;
        }

        if (success === "true" && token) {
          // OAuth authentication successful
          setStatus("success");
          setMessage("Authentication successful! Setting up your session...");

          // Create user data object
          const userData = {
            id: userId,
            email: email,
            username: username,
            displayName: displayName,
            profileImageURL: profileImageURL,
            roles: roles ? roles.split(",") : ["user"],
          };

          // Store token and user data
          localStorage.setItem("accessToken", token);
          localStorage.setItem("user", JSON.stringify(userData));

          // Update auth context
          handleOTPVerificationSuccess(userData, token);

          // Show success message and redirect
          setTimeout(() => {
            setMessage("Redirecting to dashboard...");
            setTimeout(() => {
              navigate("/dashboard");
            }, 1000);
          }, 2000);
        } else {
          setStatus("error");
          setMessage("Authentication failed. Missing required parameters.");
        }

        setLoading(false);
      } catch (error) {
        console.error("OAuth callback error:", error);
        setStatus("error");
        setMessage("Authentication failed. Please try again.");
        setLoading(false);
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate, handleOTPVerificationSuccess]);

  const handleRetry = () => {
    navigate("/login");
  };

  const handleGoHome = () => {
    navigate("/");
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
          <CircularProgress size={60} sx={{ mb: 3 }} />
          <Typography variant="h6" gutterBottom>
            Processing Authentication
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please wait while we complete your sign-in...
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
        {status === "success" ? (
          <>
            <SuccessIcon sx={{ fontSize: 60, color: "success.main", mb: 2 }} />
            <Typography variant="h6" gutterBottom color="success.main">
              Authentication Successful!
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {message}
            </Typography>
          </>
        ) : (
          <>
            <ErrorIcon sx={{ fontSize: 60, color: "error.main", mb: 2 }} />
            <Typography variant="h6" gutterBottom color="error.main">
              Authentication Failed
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {message}
            </Typography>

            <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
              <Button variant="contained" onClick={handleRetry}>
                Try Again
              </Button>
              <Button variant="outlined" onClick={handleGoHome}>
                Go Home
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default OAuthCallback;
