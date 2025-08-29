import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Chip,
  Divider,
  Skeleton,
  Alert,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Fab,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  Assignment as BriefIcon,
  Person as UserIcon,
  Visibility as ViewIcon,
  Add as AddIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  Business as BusinessIcon,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { briefsAPI, submissionsAPI } from "../services/api";
import SubmissionForm from "../components/SubmissionForm";
import ReactionButtons from "../components/ReactionButtons";

const BriefDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [brief, setBrief] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submissionFormOpen, setSubmissionFormOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchBriefDetails();
      fetchSubmissions();
    }
  }, [id]);

  const fetchBriefDetails = async () => {
    try {
      const response = await briefsAPI.getById(id);
      setBrief(response.data);
    } catch (error) {
      console.error("Error fetching brief details:", error);
      setError("Failed to load brief details");
    }
  };

  const fetchSubmissions = async () => {
    try {
      const response = await submissionsAPI.getByBriefId(id);
      setSubmissions(response.data || []);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      // Don't set error for submissions, just log it
    } finally {
      setLoading(false);
    }
  };

  const handleSubmissionSuccess = () => {
    fetchSubmissions(); // Refresh submissions after successful submission
    setSubmissionFormOpen(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "draft":
        return "default";
      case "active":
        return "info";
      case "submission":
        return "primary";
      case "review":
        return "warning";
      case "completed":
        return "success";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "draft":
        return "Draft";
      case "active":
        return "Active";
      case "submission":
        return "Open for Submissions";
      case "review":
        return "Under Review";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="text" width="60%" height={60} />
        <Skeleton variant="text" width="40%" height={40} />
        <Skeleton
          variant="rectangular"
          width="100%"
          height={200}
          sx={{ mt: 2 }}
        />
      </Container>
    );
  }

  if (error || !brief) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || "Brief not found"}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<BackIcon />}
          onClick={() => navigate("/briefs")}
        >
          Back to Briefs
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          variant="outlined"
          startIcon={<BackIcon />}
          onClick={() => navigate("/briefs")}
          sx={{ mb: 2 }}
        >
          Back to Briefs
        </Button>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="h4" gutterBottom>
              {brief.title}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Chip
                label={getStatusLabel(brief.status)}
                color={getStatusColor(brief.status)}
                size="medium"
              />
              {brief.brand && (
                <Chip
                  icon={<BusinessIcon />}
                  label={brief.brand.name}
                  variant="outlined"
                  size="medium"
                />
              )}
            </Box>
          </Box>

          {user?.roles === "user" && brief.status === "submission" && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setSubmissionFormOpen(true)}
              size="large"
            >
              Submit Work
            </Button>
          )}
        </Box>
      </Box>

      {/* Brief Details */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Description
              </Typography>
              <Typography variant="body1" paragraph>
                {brief.description}
              </Typography>

              {brief.requirements && (
                <>
                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    Requirements
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {brief.requirements}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>

          {/* Submissions Section */}
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography variant="h6">
                  Submissions ({submissions.length})
                </Typography>
              </Box>

              {submissions.length === 0 ? (
                <Alert severity="info">
                  No submissions yet. Be the first to submit your work!
                </Alert>
              ) : (
                <List>
                  {submissions.map((submission, index) => (
                    <React.Fragment key={submission.id}>
                      <ListItem
                        alignItems="flex-start"
                        sx={{ px: 0 }}
                        secondaryAction={
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<ViewIcon />}
                            onClick={() =>
                              navigate(`/submissions/${submission.id}`)
                            }
                          >
                            View Details
                          </Button>
                        }
                      >
                        <ListItemAvatar>
                          <Avatar>
                            <UserIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Typography variant="subtitle1">
                                {submission.user?.username || "Unknown User"}
                              </Typography>
                              {submission.user?.first_name &&
                                submission.user?.last_name && (
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    ({submission.user.first_name}{" "}
                                    {submission.user.last_name})
                                  </Typography>
                                )}
                              {submission.is_winner && (
                                <Chip
                                  label="Winner"
                                  color="success"
                                  size="small"
                                />
                              )}
                              {submission.is_finalist && (
                                <Chip
                                  label="Finalist"
                                  color="warning"
                                  size="small"
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {submission.description}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Submitted:{" "}
                                {new Date(
                                  submission.created_at
                                ).toLocaleDateString()}
                              </Typography>
                              {submission.files &&
                                submission.files.length > 0 && (
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    display="block"
                                  >
                                    Files: {submission.files.length}
                                  </Typography>
                                )}
                              {/* Reaction Buttons */}
                              <Box sx={{ mt: 1 }}>
                                <ReactionButtons
                                  submission={submission}
                                  onReactionChange={fetchSubmissions}
                                />
                              </Box>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < submissions.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Brief Information
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={getStatusLabel(brief.status)}
                  color={getStatusColor(brief.status)}
                  size="small"
                  sx={{ mt: 0.5 }}
                />
              </Box>

              {brief.submission_deadline && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Submission Deadline
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mt: 0.5,
                    }}
                  >
                    <CalendarIcon fontSize="small" />
                    {new Date(brief.submission_deadline).toLocaleDateString()}
                  </Typography>
                </Box>
              )}

              {brief.voting_start && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Voting Period
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 0.5 }}>
                    {new Date(brief.voting_start).toLocaleDateString()} -{" "}
                    {new Date(brief.voting_end).toLocaleDateString()}
                  </Typography>
                </Box>
              )}

              {brief.is_paid && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Prize Amount
                  </Typography>
                  <Typography
                    variant="h6"
                    color="success.main"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mt: 0.5,
                    }}
                  >
                    <MoneyIcon />${brief.prize_amount || "TBD"}
                  </Typography>
                </Box>
              )}

              {brief.tags && brief.tags.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Tags
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {brief.tags.map((tag) => (
                      <Chip
                        key={tag.id}
                        label={tag.name}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Submission Form Dialog */}
      <SubmissionForm
        open={submissionFormOpen}
        onClose={() => setSubmissionFormOpen(false)}
        brief={brief}
        onSuccess={handleSubmissionSuccess}
      />
    </Container>
  );
};

export default BriefDetail;
