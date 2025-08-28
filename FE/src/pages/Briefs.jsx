import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Skeleton,
  Alert,
  Fab,
} from "@mui/material";
import {
  Assignment as BriefIcon,
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { briefsAPI } from "../services/api";
import BriefForm from "../components/BriefForm";
import SubmissionForm from "../components/SubmissionForm";

const Briefs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [briefs, setBriefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    is_paid: "",
    page: 1,
    limit: 12,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    currentPage: 1,
  });

  // Brief form state
  const [briefFormOpen, setBriefFormOpen] = useState(false);

  // Submission form state
  const [submissionFormOpen, setSubmissionFormOpen] = useState(false);
  const [selectedBrief, setSelectedBrief] = useState(null);

  useEffect(() => {
    fetchBriefs();
  }, [filters]);

  const fetchBriefs = async () => {
    try {
      setLoading(true);
      const response = await briefsAPI.getAll(filters);

      // Backend returns a flat array, not paginated structure
      const briefsArray = response.data;

      setBriefs(briefsArray || []);
      setPagination({
        total: briefsArray?.length || 0,
        pages: 1, // Since backend doesn't support pagination yet
        currentPage: 1,
      });
    } catch (error) {
      console.error("Error fetching briefs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handlePageChange = (event, value) => {
    setFilters((prev) => ({
      ...prev,
      page: value,
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "success";
      case "completed":
        return "info";
      case "draft":
        return "default";
      case "in_progress":
        return "warning";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status) => {
    return status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const handleBriefSuccess = (newBrief) => {
    setBriefs((prev) => [newBrief, ...prev]);
    setPagination((prev) => ({ ...prev, total: prev.total + 1 }));
  };

  const openBriefForm = () => {
    setBriefFormOpen(true);
  };

  const closeBriefForm = () => {
    setBriefFormOpen(false);
  };

  const openSubmissionForm = (brief) => {
    setSelectedBrief(brief);
    setSubmissionFormOpen(true);
  };

  const closeSubmissionForm = () => {
    setSubmissionFormOpen(false);
    setSelectedBrief(null);
  };

  const handleSubmissionSuccess = (newSubmission) => {
    // You can add logic here to update the UI if needed
    console.log("New submission created:", newSubmission);
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h3" gutterBottom>
            Creative Briefs
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Discover and work on exciting creative projects
          </Typography>
        </Box>

        {(user?.roles === "admin" || user?.roles === "super_admin") && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openBriefForm}
            size="large"
          >
            Create Brief
          </Button>
        )}
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Search briefs"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                InputProps={{
                  startAdornment: (
                    <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Payment Type</InputLabel>
                <Select
                  value={filters.is_paid}
                  label="Payment Type"
                  onChange={(e) =>
                    handleFilterChange("is_paid", e.target.value)
                  }
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="true">Paid</MenuItem>
                  <MenuItem value="false">Unpaid</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => {
                  setFilters({
                    search: "",
                    status: "",
                    is_paid: "",
                    page: 1,
                    limit: 12,
                  });
                }}
                fullWidth
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Briefs Grid */}
      {loading ? (
        <LoadingSkeleton />
      ) : briefs.length === 0 ? (
        <Alert severity="info" sx={{ mt: 4 }}>
          No briefs found matching your criteria.
        </Alert>
      ) : (
        <>
          <Grid container spacing={3}>
            {briefs.map((brief) => (
              <Grid item xs={12} sm={6} md={4} key={brief.id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 2,
                      }}
                    >
                      <Typography
                        variant="h6"
                        component="h2"
                        noWrap
                        sx={{ maxWidth: "70%" }}
                      >
                        {brief.title}
                      </Typography>
                      <Chip
                        label={getStatusLabel(brief.status)}
                        color={getStatusColor(brief.status)}
                        size="small"
                      />
                    </Box>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2, minHeight: 60 }}
                    >
                      {brief.description?.substring(0, 120)}
                      {brief.description?.length > 120 ? "..." : ""}
                    </Typography>

                    <Box
                      sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}
                    >
                      {brief.is_paid && (
                        <Chip
                          label={`$${brief.prize_amount || "TBD"}`}
                          color="success"
                          size="small"
                          variant="outlined"
                        />
                      )}
                      {brief.brand && (
                        <Chip
                          label={brief.brand.name}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>

                    <Typography variant="caption" color="text.secondary">
                      Deadline:{" "}
                      {new Date(brief.submission_deadline).toLocaleDateString()}
                    </Typography>
                  </CardContent>

                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<ViewIcon />}
                      onClick={() => navigate(`/briefs/${brief.id}`)}
                      sx={{ flex: 1 }}
                    >
                      View Details
                    </Button>
                    {user?.roles === "user" && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => openSubmissionForm(brief)}
                        sx={{ flex: 1 }}
                      >
                        Submit Work
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Pagination
                count={pagination.pages}
                page={pagination.currentPage}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      )}

      {/* Brief Form Dialog */}
      <BriefForm
        open={briefFormOpen}
        onClose={closeBriefForm}
        onSuccess={handleBriefSuccess}
      />

      {/* Submission Form Dialog */}
      <SubmissionForm
        open={submissionFormOpen}
        onClose={closeSubmissionForm}
        brief={selectedBrief}
        onSuccess={handleSubmissionSuccess}
      />

      {/* Floating Action Button for Admin Users */}
      {(user?.roles === "admin" || user?.roles === "super_admin") && (
        <Fab
          color="primary"
          aria-label="create brief"
          sx={{ position: "fixed", bottom: 16, right: 16 }}
          onClick={openBriefForm}
        >
          <AddIcon />
        </Fab>
      )}
    </Container>
  );
};

export default Briefs;
