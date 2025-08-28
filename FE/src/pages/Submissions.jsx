import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Chip,
  Alert,
  CircularProgress,
  Skeleton,
} from "@mui/material";
import { Visibility as ViewIcon, Edit as EditIcon } from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { submissionsAPI } from "../services/api";

const Submissions = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await submissionsAPI.getAll({ userId: user?.id });
      setSubmissions(response.data || []);
    } catch (error) {
      console.error("Error fetching submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (isFinalist, isWinner) => {
    if (isWinner) return "success";
    if (isFinalist) return "warning";
    return "default";
  };

  const getStatusLabel = (isFinalist, isWinner) => {
    if (isWinner) return "Winner";
    if (isFinalist) return "Finalist";
    return "Submitted";
  };

  const LoadingSkeleton = () => (
    <Grid container spacing={3}>
      {[...Array(6)].map((_, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Card>
            <CardContent>
              <Skeleton variant="text" width="80%" height={32} />
              <Skeleton variant="text" width="60%" height={20} />
              <Skeleton variant="text" width="100%" height={60} />
              <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                <Skeleton variant="rounded" width={80} height={24} />
                <Skeleton variant="rounded" width={80} height={24} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h3" gutterBottom>
          My Submissions
        </Typography>
        <LoadingSkeleton />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom>
        My Submissions
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Track your creative submissions and their status
      </Typography>

      {submissions.length === 0 ? (
        <Alert severity="info">
          You haven't made any submissions yet. Browse briefs to get started!
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {submissions.map((submission) => (
            <Grid item xs={12} sm={6} md={4} key={submission.id}>
              <Card>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6" component="h2" noWrap>
                      Submission #{submission.id.slice(0, 8)}
                    </Typography>
                    <Chip
                      label={getStatusLabel(
                        submission.is_finalist,
                        submission.is_winner
                      )}
                      color={getStatusColor(
                        submission.is_finalist,
                        submission.is_winner
                      )}
                      size="small"
                    />
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2, minHeight: 60 }}
                  >
                    {submission.description?.substring(0, 120)}
                    {submission.description?.length > 120 ? "..." : ""}
                  </Typography>

                  <Box
                    sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}
                  >
                    <Chip
                      label={`${submission.files?.length || 0} files`}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={`${submission.likes || 0} likes`}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={`${submission.votes || 0} votes`}
                      size="small"
                      variant="outlined"
                    />
                  </Box>

                  <Typography variant="caption" color="text.secondary">
                    Submitted:{" "}
                    {new Date(submission.created_at).toLocaleDateString()}
                  </Typography>
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<ViewIcon />}
                    fullWidth
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Submissions;
