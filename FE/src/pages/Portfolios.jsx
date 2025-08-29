import React, { useState, useEffect } from "react";
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
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Folder as FolderIcon,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { portfoliosAPI } from "../services/api";
import PortfolioForm from "../components/PortfolioForm";

const Portfolios = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [portfolioFormOpen, setPortfolioFormOpen] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [portfolioToDelete, setPortfolioToDelete] = useState(null);

  useEffect(() => {
    if (user) {
      fetchPortfolios();
    }
  }, [user]);

  const fetchPortfolios = async () => {
    try {
      setLoading(true);
      const response = await portfoliosAPI.getByUser(user.id);
      setPortfolios(response.data || []);
    } catch (error) {
      console.error("Error fetching portfolios:", error);
      setError("Failed to load portfolios");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePortfolio = () => {
    setEditingPortfolio(null);
    setPortfolioFormOpen(true);
  };

  const handleEditPortfolio = (portfolio) => {
    setEditingPortfolio(portfolio);
    setPortfolioFormOpen(true);
  };

  const handleDeletePortfolio = (portfolio) => {
    setPortfolioToDelete(portfolio);
    setDeleteDialogOpen(true);
  };

  const confirmDeletePortfolio = async () => {
    try {
      await portfoliosAPI.delete(user.id, portfolioToDelete.id);
      setPortfolios((prev) =>
        prev.filter((p) => p.id !== portfolioToDelete.id)
      );
      setDeleteDialogOpen(false);
      setPortfolioToDelete(null);
    } catch (error) {
      console.error("Error deleting portfolio:", error);
      setError("Failed to delete portfolio");
    }
  };

  const handlePortfolioSuccess = () => {
    fetchPortfolios();
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
          My Portfolios
        </Typography>
        <LoadingSkeleton />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
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
            My Portfolios
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Showcase your creative work and build your professional portfolio
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreatePortfolio}
          size="large"
        >
          Create Portfolio
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {portfolios.length === 0 ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          You haven't created any portfolios yet. Start building your creative
          showcase!
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {portfolios.map((portfolio) => (
            <Grid item xs={12} sm={6} md={4} key={portfolio.id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <FolderIcon sx={{ mr: 1, color: "primary.main" }} />
                    <Typography variant="h6" component="h2" noWrap>
                      {portfolio.title}
                    </Typography>
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2, minHeight: 60 }}
                  >
                    {portfolio.description?.substring(0, 120)}
                    {portfolio.description?.length > 120 ? "..." : ""}
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    Files: {portfolio.files?.length || 0}
                  </Typography>
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Box sx={{ display: "flex", gap: 1, width: "100%" }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<ViewIcon />}
                      fullWidth
                      onClick={() =>
                        navigate(`/portfolios/${user.id}/${portfolio.id}`)
                      }
                    >
                      View
                    </Button>
                    <IconButton
                      size="small"
                      onClick={() => handleEditPortfolio(portfolio)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeletePortfolio(portfolio)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Portfolio Form Dialog */}
      <PortfolioForm
        open={portfolioFormOpen}
        onClose={() => setPortfolioFormOpen(false)}
        onSuccess={handlePortfolioSuccess}
        portfolio={editingPortfolio}
        isEdit={!!editingPortfolio}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Portfolio</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{portfolioToDelete?.title}"? This
            action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={confirmDeletePortfolio}
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

export default Portfolios;
