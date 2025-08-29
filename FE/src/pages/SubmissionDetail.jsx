import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Grid,
  Avatar,
  Divider,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  Person as UserIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { submissionsAPI } from "../services/api";
import ReactionButtons from "../components/ReactionButtons";

const SubmissionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchSubmissionDetails();
    }
  }, [id]);

  const fetchSubmissionDetails = async () => {
    try {
      setLoading(true);
      const response = await submissionsAPI.getById(id);
      setSubmission(response.data);
    } catch (error) {
      console.error("Error fetching submission details:", error);
      setError("Failed to load submission details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate(-1)}
          variant="outlined"
        >
          Go Back
        </Button>
      </Container>
    );
  }

  if (!submission) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Submission not found
        </Alert>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate(-1)}
          variant="outlined"
        >
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate(-1)}
          variant="outlined"
          sx={{ mb: 2 }}
        >
          Go Back
        </Button>
        <Typography variant="h4" gutterBottom>
          Submission Details
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              {/* User Info */}
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Avatar sx={{ mr: 2 }}>
                  <UserIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {submission.user?.username || "Unknown User"}
                  </Typography>
                  {submission.user?.first_name &&
                    submission.user?.last_name && (
                      <Typography variant="body2" color="text.secondary">
                        {submission.user.first_name} {submission.user.last_name}
                      </Typography>
                    )}
                </Box>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* Description */}
              <Typography variant="h6" gutterBottom>
                Description
              </Typography>
              <Typography variant="body1" paragraph>
                {submission.description || "No description provided"}
              </Typography>

              {/* Status */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Status
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  {submission.is_winner && (
                    <Chip label="Winner" color="success" />
                  )}
                  {submission.is_finalist && (
                    <Chip label="Finalist" color="warning" />
                  )}
                  {!submission.is_winner && !submission.is_finalist && (
                    <Chip label="Submitted" color="default" />
                  )}
                </Box>
              </Box>

              {/* Files */}
              {submission.files && submission.files.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Files ({submission.files.length})
                  </Typography>
                  <Grid container spacing={2}>
                    {submission.files.map((file, index) => (
                      <Grid item xs={12} sm={6} key={index}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="body2" noWrap>
                              {file.filename}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {file.type} •{" "}
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {/* Submission Date */}
              <Typography variant="caption" color="text.secondary">
                Submitted:{" "}
                {new Date(submission.created_at).toLocaleDateString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Engagement
              </Typography>

              {/* Reaction Buttons */}
              <Box sx={{ mb: 3 }}>
                <ReactionButtons
                  submission={submission}
                  onReactionChange={fetchSubmissionDetails}
                />
              </Box>

              {/* Stats */}
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total Reactions
                </Typography>
                <Typography variant="h4" color="primary">
                  {(submission.likes || 0) + (submission.votes || 0)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SubmissionDetail;
