import React, { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Link,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormLabel,
} from "@mui/material";
import {
  Person as UserIcon,
  AdminPanelSettings as AdminIcon,
  Email as EmailIcon,
  Check as CheckIcon,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { authAPI } from "../services/api";
import GoogleOAuthButton from "../components/GoogleOAuthButton";

const Register = () => {
  const navigate = useNavigate();
  const { handleOTPVerificationSuccess } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "user",
  });
  const [otpCode, setOtpCode] = useState("");
  const [registrationData, setRegistrationData] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    severity: "error",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setAlert({ show: false, message: "", severity: "error" });

    try {
      const result = await authAPI.register(formData);

      if (result.data.success) {
        setRegistrationData(result.data.data);
        setAlert({
          show: true,
          message:
            "Account created successfully! Please check your email for OTP verification.",
          severity: "success",
        });
        setActiveStep(1);
      } else {
        setAlert({
          show: true,
          message: result.data.message || "Registration failed",
          severity: "error",
        });
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "Registration failed";
      setAlert({
        show: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerification = async (e) => {
    e.preventDefault();

    if (otpCode.trim().length !== 6 || !/^\d{6}$/.test(otpCode.trim())) {
      setErrors({ otpCode: "Please enter a valid 6-digit OTP" });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const result = await authAPI.verifyOTP({
        email: formData.email,
        otp: otpCode.trim(),
      });

      if (result.data.success) {
        setAlert({
          show: true,
          message: "OTP verified successfully! Setting up your account...",
          severity: "success",
        });

        // Handle successful OTP verification
        handleOTPVerificationSuccess(
          result.data.data.user,
          result.data.data.token
        );
        setActiveStep(2);

        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } else {
        setErrors({
          otpCode: result.data.message || "OTP verification failed",
        });
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "OTP verification failed";
      setErrors({ otpCode: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      const result = await authAPI.resendOTP({ email: formData.email });

      if (result.data.success) {
        setAlert({
          show: true,
          message: "OTP resent successfully! Please check your email.",
          severity: "success",
        });
      } else {
        setAlert({
          show: true,
          message: result.data.message || "Failed to resend OTP",
          severity: "error",
        });
      }
    } catch (error) {
      setAlert({
        show: true,
        message: "Failed to resend OTP. Please try again.",
        severity: "error",
      });
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <>
            <form onSubmit={handleSubmit}>
              <FormControl component="fieldset" sx={{ mb: 4, width: "100%" }}>
                <FormLabel component="legend" sx={{ mb: 2 }}>
                  Register as:
                </FormLabel>
                <RadioGroup
                  row
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  sx={{ justifyContent: "center" }}
                >
                  <FormControlLabel
                    value="user"
                    control={<Radio />}
                    label={
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <UserIcon color="primary" />
                        <Typography>User</Typography>
                      </Box>
                    }
                    sx={{ mr: 4 }}
                  />
                  <FormControlLabel
                    value="admin"
                    control={<Radio />}
                    label={
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <AdminIcon color="secondary" />
                        <Typography>Admin</Typography>
                      </Box>
                    }
                  />
                </RadioGroup>
              </FormControl>

              <TextField
                fullWidth
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                error={!!errors.username}
                helperText={errors.username}
                required
                sx={{ mb: 3 }}
              />

              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                error={!!errors.email}
                helperText={errors.email}
                required
                sx={{ mb: 3 }}
              />

              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                error={!!errors.password}
                helperText={errors.password}
                required
                sx={{ mb: 3 }}
              />

              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                error={!!errors.firstName}
                helperText={errors.firstName}
                required
                sx={{ mb: 3 }}
              />

              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                error={!!errors.lastName}
                helperText={errors.lastName}
                required
                sx={{ mb: 3 }}
              />

              <Box sx={{ textAlign: "center" }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  fullWidth
                  sx={{ mb: 3 }}
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>
              </Box>

              <Box sx={{ textAlign: "center", mb: 3 }}>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Already have an account?{" "}
                  <Link component={RouterLink} to="/login" variant="body2">
                    Sign in here
                  </Link>
                </Typography>
              </Box>

              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  OR
                </Typography>
                <GoogleOAuthButton
                  variant="outlined"
                  size="large"
                  fullWidth
                  role={formData.role}
                  onError={(errorMessage) => {
                    setAlert({
                      show: true,
                      message: errorMessage,
                      severity: "error",
                    });
                  }}
                />
              </Box>
            </form>
          </>
        );

      case 1:
        return (
          <>
            <Box sx={{ textAlign: "center", mb: 3 }}>
              <EmailIcon sx={{ fontSize: 60, color: "primary.main", mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Verify Your Email
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                We've sent a verification code to{" "}
                <strong>{formData.email}</strong>
              </Typography>
            </Box>

            <form onSubmit={handleOTPVerification}>
              <TextField
                fullWidth
                label="Enter 6-digit OTP"
                name="otpCode"
                value={otpCode}
                onChange={(e) => {
                  setOtpCode(e.target.value);
                  if (errors.otpCode) {
                    setErrors((prev) => ({ ...prev, otpCode: "" }));
                  }
                }}
                error={!!errors.otpCode}
                helperText={errors.otpCode}
                required
                inputProps={{ maxLength: 6 }}
                sx={{ mb: 3 }}
              />

              <Box sx={{ textAlign: "center" }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={
                    loading ||
                    otpCode.trim().length !== 6 ||
                    !/^\d{6}$/.test(otpCode.trim())
                  }
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </Button>

                <Button
                  variant="text"
                  onClick={handleResendOTP}
                  disabled={loading}
                  sx={{ mb: 3 }}
                >
                  Resend OTP
                </Button>
              </Box>
            </form>
          </>
        );

      case 2:
        return (
          <Box sx={{ textAlign: "center" }}>
            <CheckIcon sx={{ fontSize: 60, color: "success.main", mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Account Created Successfully!
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Your account has been verified and created. You can now access all
              features.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/dashboard")}
              fullWidth
            >
              Go to Dashboard
            </Button>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Create Your Account
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          align="center"
          sx={{ mb: 4 }}
        >
          Join SkillzCollab and start collaborating on creative projects
        </Typography>

        {alert.show && (
          <Alert severity={alert.severity} sx={{ mb: 3 }}>
            {alert.message}
          </Alert>
        )}

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          <Step>
            <StepLabel>Account Details</StepLabel>
          </Step>
          <Step>
            <StepLabel>Email Verification</StepLabel>
          </Step>
          <Step>
            <StepLabel>Complete</StepLabel>
          </Step>
        </Stepper>

        {renderStepContent(activeStep)}
      </Paper>
    </Container>
  );
};

export default Register;
