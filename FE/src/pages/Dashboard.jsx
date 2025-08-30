import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
} from "@mui/material";
import {
  Assignment as BriefIcon,
  Upload as SubmissionIcon,
  ThumbUp as LikeIcon,
  Add as AddIcon,
  TrendingUp as TrendingIcon,
  Business as BrandIcon,
  Folder as PortfolioIcon,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { briefsAPI, submissionsAPI, reactionsAPI } from "../services/api";
import BrandForm from "../components/BrandForm";
import BriefForm from "../components/BriefForm";
import SuperAdminDashboard from "../components/SuperAdminDashboard";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalBriefs: 0,
    totalSubmissions: 0,
    totalReactions: 0,
    recentBriefs: [],
    recentSubmissions: [],
  });
  const [loading, setLoading] = useState(true);

  // Form dialogs
  const [brandFormOpen, setBrandFormOpen] = useState(false);
  const [briefFormOpen, setBriefFormOpen] = useState(false);
  const [selectedBrandId, setSelectedBrandId] = useState(null);

  // Show super admin dashboard for super_admin users
  if (user?.roles === "super_admin") {
    return <SuperAdminDashboard />;
  }

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [briefsRes, submissionsRes, reactionsRes] = await Promise.all([
          briefsAPI.getAll({ limit: 5 }),
          submissionsAPI.getAll({ limit: 5 }),
          reactionsAPI.getAll({ limit: 10 }),
        ]);

        setStats({
          totalBriefs: briefsRes.data.data?.total || 0,
          totalSubmissions: submissionsRes.data.data?.total || 0,
          totalReactions: reactionsRes.data.data?.total || 0,
          recentBriefs: briefsRes.data.data?.items || [],
          recentSubmissions: submissionsRes.data.data?.items || [],
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getRoleColor = (role) => {
    switch (role) {
      case "super_admin":
        return "error";
      case "admin":
        return "warning";
      default:
        return "default";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "success";
      case "completed":
        return "info";
      case "draft":
        return "default";
      default:
        return "warning";
    }
  };

  const handleBrandSuccess = (newBrand) => {
    setSelectedBrandId(newBrand.id); // Auto-select the new brand for brief creation
  };

  const handleBriefSuccess = (newBrief) => {
    // Refresh dashboard data
    window.location.reload();
  };

  const openBrandForm = () => {
    setBrandFormOpen(true);
  };

  const openBriefForm = (brandId = null) => {
    setSelectedBrandId(brandId);
    setBriefFormOpen(true);
  };

  const closeBrandForm = () => {
    setBrandFormOpen(false);
  };

  const closeBriefForm = () => {
    setBriefFormOpen(false);
    setSelectedBrandId(null);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Loading Dashboard...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" gutterBottom>
          Welcome back, {user?.firstName || user?.username}!
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Chip
            label={user?.roles || "User"}
            color={getRoleColor(user?.roles)}
            size="large"
          />
          <Typography variant="body1" color="text.secondary">
            {user?.email}
          </Typography>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Briefs
                  </Typography>
                  <Typography variant="h4">{stats.totalBriefs}</Typography>
                </Box>
                <BriefIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Submissions
                  </Typography>
                  <Typography variant="h4">{stats.totalSubmissions}</Typography>
                </Box>
                <SubmissionIcon color="secondary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Reactions
                  </Typography>
                  <Typography variant="h4">{stats.totalReactions}</Typography>
                </Box>
                <LikeIcon color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Your Role
                  </Typography>
                  <Typography variant="h6">{user?.roles || "User"}</Typography>
                </Box>
                <TrendingIcon color="info" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate("/briefs")}
                  fullWidth
                >
                  Browse Briefs
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<SubmissionIcon />}
                  onClick={() => navigate("/submissions")}
                  fullWidth
                >
                  View Submissions
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<PortfolioIcon />}
                  onClick={() => navigate("/portfolios")}
                  fullWidth
                >
                  My Portfolios
                </Button>
                {(user?.roles === "admin" || user?.roles === "super_admin") && (
                  <>
                    <Button
                      variant="outlined"
                      color="secondary"
                      startIcon={<BrandIcon />}
                      onClick={openBrandForm}
                      fullWidth
                    >
                      Create Brand
                    </Button>
                    <Button
                      variant="outlined"
                      color="success"
                      startIcon={<BriefIcon />}
                      onClick={() => openBriefForm()}
                      fullWidth
                    >
                      Create Brief
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      startIcon={<AddIcon />}
                      onClick={() => navigate("/admin")}
                      fullWidth
                    >
                      Admin Panel
                    </Button>
                  </>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <List dense>
                {stats.recentBriefs.slice(0, 3).map((brief) => (
                  <ListItem key={brief.id} sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar>
                        <BriefIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={brief.title}
                      secondary={`Status: ${brief.status}`}
                    />
                    <Chip
                      label={brief.status}
                      color={getStatusColor(brief.status)}
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Briefs */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6">Recent Briefs</Typography>
            <Button variant="text" onClick={() => navigate("/briefs")}>
              View All
            </Button>
          </Box>
          <Grid container spacing={2}>
            {stats.recentBriefs.map((brief) => (
              <Grid item xs={12} sm={6} md={4} key={brief.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" noWrap>
                      {brief.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      {brief.description?.substring(0, 100)}...
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Chip
                        label={brief.status}
                        color={getStatusColor(brief.status)}
                        size="small"
                      />
                      <Button
                        size="small"
                        onClick={() => navigate(`/briefs/${brief.id}`)}
                      >
                        View Details
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Brand Form Dialog */}
      <BrandForm
        open={brandFormOpen}
        onClose={closeBrandForm}
        onSuccess={handleBrandSuccess}
      />

      {/* Brief Form Dialog */}
      <BriefForm
        open={briefFormOpen}
        onClose={closeBriefForm}
        onSuccess={handleBriefSuccess}
        selectedBrandId={selectedBrandId}
      />
    </Container>
  );
};

export default Dashboard;
