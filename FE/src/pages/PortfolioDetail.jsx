import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Skeleton,
  Divider,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Folder as FolderIcon,
  Palette as CreativeIcon,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { portfoliosAPI, creativesAPI } from "../services/api";
import PortfolioForm from "../components/PortfolioForm";
import CreativeForm from "../components/CreativeForm";

const PortfolioDetail = () => {
  const { userId, portfolioId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState(null);
  const [creatives, setCreatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [portfolioFormOpen, setPortfolioFormOpen] = useState(false);
  const [creativeFormOpen, setCreativeFormOpen] = useState(false);
  const [editingCreative, setEditingCreative] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [creativeToDelete, setCreativeToDelete] = useState(null);

  useEffect(() => {
    if (userId && portfolioId) {
      fetchPortfolioDetails();
      fetchCreatives();
    }
  }, [userId, portfolioId]);

  const fetchPortfolioDetails = async () => {
    try {
      const response = await portfoliosAPI.getById(userId, portfolioId);
      setPortfolio(response.data);
    } catch (error) {
      console.error("Error fetching portfolio details:", error);
      setError("Failed to load portfolio details");
    }
  };

  const fetchCreatives = async () => {
    try {
      const response = await creativesAPI.getByPortfolio(portfolioId);
      setCreatives(response.data || []);
    } catch (error) {
      console.error("Error fetching creatives:", error);
      // Don't set error for creatives, just log it
    } finally {
      setLoading(false);
    }
  };

  const handleEditPortfolio = () => {
    setPortfolioFormOpen(true);
  };

  const handleCreateCreative = () => {
    setEditingCreative(null);
    setCreativeFormOpen(true);
  };

  const handleEditCreative = (creative) => {
    setEditingCreative(creative);
    setCreativeFormOpen(true);
  };

  const handleDeleteCreative = (creative) => {
    setCreativeToDelete(creative);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteCreative = async () => {
    try {
      await creativesAPI.delete(portfolioId, creativeToDelete.id);
      setCreatives((prev) => prev.filter((c) => c.id !== creativeToDelete.id));
      setDeleteDialogOpen(false);
      setCreativeToDelete(null);
    } catch (error) {
      console.error("Error deleting creative:", error);
      setError("Failed to delete creative");
    }
  };

  const handlePortfolioSuccess = () => {
    fetchPortfolioDetails();
  };

  const handleCreativeSuccess = () => {
    fetchCreatives();
  };

  const LoadingSkeleton = () => (
    <Box>
      <Skeleton variant="text" width="60%" height={48} sx={{ mb: 2 }} />
      <Skeleton variant="text" width="100%" height={24} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="80%" height={24} sx={{ mb: 3 }} />
      <Skeleton
        variant="rectangular"
        width="100%"
        height={200}
        sx={{ mb: 3 }}
      />
      <Grid container spacing={3}>
        {[...Array(6)].map((_, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card>
              <CardContent>
                <Skeleton variant="text" width="80%" height={32} />
                <Skeleton variant="text" width="60%" height={20} />
                <Skeleton variant="text" width="100%" height={60} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <LoadingSkeleton />
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

  if (!portfolio) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Portfolio not found
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

  const canEdit =
    user &&
    (user.id === userId ||
      user.roles === "admin" ||
      user.roles === "super_admin");

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

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Box>
            <Typography variant="h3" gutterBottom>
              {portfolio.title}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {portfolio.description}
            </Typography>
          </Box>

          {canEdit && (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={handleEditPortfolio}
            >
              Edit Portfolio
            </Button>
          )}
        </Box>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Creatives Section */}
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h4" gutterBottom>
            Creatives ({creatives.length})
          </Typography>
          {canEdit && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateCreative}
            >
              Add Creative
            </Button>
          )}
        </Box>

        {creatives.length === 0 ? (
          <Alert severity="info">
            No creatives yet.{" "}
            {canEdit
              ? "Start adding your creative work!"
              : "This portfolio doesn't have any creatives yet."}
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {creatives.map((creative) => (
              <Grid item xs={12} sm={6} md={4} key={creative.id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <CreativeIcon sx={{ mr: 1, color: "secondary.main" }} />
                      <Typography variant="h6" component="h3" noWrap>
                        {creative.title}
                      </Typography>
                    </Box>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2, minHeight: 60 }}
                    >
                      {creative.description?.substring(0, 120)}
                      {creative.description?.length > 120 ? "..." : ""}
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      Files: {creative.files?.length || 0}
                    </Typography>
                  </CardContent>

                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Box sx={{ display: "flex", gap: 1, width: "100%" }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<ViewIcon />}
                        fullWidth
                      >
                        View
                      </Button>
                      {canEdit && (
                        <>
                          <IconButton
                            size="small"
                            onClick={() => handleEditCreative(creative)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteCreative(creative)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </>
                      )}
                    </Box>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Portfolio Form Dialog */}
      <PortfolioForm
        open={portfolioFormOpen}
        onClose={() => setPortfolioFormOpen(false)}
        onSuccess={handlePortfolioSuccess}
        portfolio={portfolio}
        isEdit={true}
      />

      {/* Creative Form Dialog */}
      <CreativeForm
        open={creativeFormOpen}
        onClose={() => setCreativeFormOpen(false)}
        onSuccess={handleCreativeSuccess}
        portfolioId={portfolioId}
        creative={editingCreative}
        isEdit={!!editingCreative}
      />

      {/* Delete Creative Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Creative</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{creativeToDelete?.title}"? This
            action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={confirmDeleteCreative}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PortfolioDetail;
