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
  Tabs,
  Tab,
  Chip,
  Alert,
  CircularProgress,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Business as BrandIcon,
  Assignment as BriefIcon,
  Person as UsersIcon,
  Label as TagIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { brandsAPI, briefsAPI, usersAPI, tagsAPI } from "../services/api";
import BrandForm from "../components/BrandForm";
import BriefForm from "../components/BriefForm";

const AdminPanel = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBrands: 0,
    totalBriefs: 0,
    totalTags: 0,
  });
  const [brands, setBrands] = useState([]);
  const [briefs, setBriefs] = useState([]);
  const [users, setUsers] = useState([]);
  const [tags, setTags] = useState([]);

  // Form dialogs
  const [brandFormOpen, setBrandFormOpen] = useState(false);
  const [briefFormOpen, setBriefFormOpen] = useState(false);
  const [selectedBrandId, setSelectedBrandId] = useState(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [brandsRes, briefsRes, usersRes, tagsRes] = await Promise.all([
        brandsAPI.getAll(),
        briefsAPI.getAll(),
        usersAPI.getAll(),
        tagsAPI.getAll(),
      ]);

      setBrands(brandsRes.data.data || brandsRes.data || []);
      setBriefs(briefsRes.data.data || briefsRes.data || []);
      setUsers(usersRes.data.data || usersRes.data || []);
      setTags(tagsRes.data.data || tagsRes.data || []);

      setStats({
        totalUsers: (usersRes.data.data || usersRes.data || []).length,
        totalBrands: (brandsRes.data.data || brandsRes.data || []).length,
        totalBriefs: (briefsRes.data.data || briefsRes.data || []).length,
        totalTags: (tagsRes.data.data || tagsRes.data || []).length,
      });
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleBrandSuccess = (newBrand) => {
    setBrands((prev) => [newBrand, ...prev]);
    setStats((prev) => ({ ...prev, totalBrands: prev.totalBrands + 1 }));
    setSelectedBrandId(newBrand.id); // Auto-select the new brand for brief creation
  };

  const handleBriefSuccess = (newBrief) => {
    setBriefs((prev) => [newBrief, ...prev]);
    setStats((prev) => ({ ...prev, totalBriefs: prev.totalBriefs + 1 }));
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

  const renderStatsCards = () => (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Total Users
                </Typography>
                <Typography variant="h4">{stats.totalUsers}</Typography>
              </Box>
              <UsersIcon color="primary" sx={{ fontSize: 40 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Total Brands
                </Typography>
                <Typography variant="h4">{stats.totalBrands}</Typography>
              </Box>
              <BrandIcon color="secondary" sx={{ fontSize: 40 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Total Briefs
                </Typography>
                <Typography variant="h4">{stats.totalBriefs}</Typography>
              </Box>
              <BriefIcon color="success" sx={{ fontSize: 40 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Total Tags
                </Typography>
                <Typography variant="h4">{stats.totalTags}</Typography>
              </Box>
              <TagIcon color="info" sx={{ fontSize: 40 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderBrandsTab = () => (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Typography variant="h5">Brands Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openBrandForm}
        >
          Create Brand
        </Button>
      </Box>

      {brands.length === 0 ? (
        <Alert severity="info">
          No brands found. Create your first brand to get started!
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {brands.map((brand) => (
            <Grid item xs={12} sm={6} md={4} key={brand.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {brand.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {brand.contact_email}
                  </Typography>
                  {brand.business_field && (
                    <Chip
                      label={brand.business_field}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ mb: 1 }}
                    />
                  )}
                  {brand.website_url && (
                    <Typography variant="caption" display="block">
                      Website: {brand.website_url}
                    </Typography>
                  )}
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    onClick={() => openBriefForm(brand.id)}
                    startIcon={<BriefIcon />}
                  >
                    Create Brief
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );

  const renderBriefsTab = () => (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Typography variant="h5">Briefs Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => openBriefForm()}
        >
          Create Brief
        </Button>
      </Box>

      {briefs.length === 0 ? (
        <Alert severity="info">
          No briefs found. Create your first brief to get started!
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {briefs.map((brief) => (
            <Grid item xs={12} sm={6} md={4} key={brief.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {brief.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {brief.description?.substring(0, 100)}...
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Chip
                      label={brief.status}
                      size="small"
                      color={
                        brief.status === "submission" ? "primary" : "secondary"
                      }
                      sx={{ mr: 1 }}
                    />
                    {brief.is_paid && (
                      <Chip
                        label={`$${brief.prize_amount}`}
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    )}
                  </Box>
                  {brief.submission_deadline && (
                    <Typography variant="caption" display="block">
                      Deadline:{" "}
                      {new Date(brief.submission_deadline).toLocaleDateString()}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );

  const renderUsersTab = () => (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Users Management
      </Typography>
      {users.length === 0 ? (
        <Alert severity="info">No users found.</Alert>
      ) : (
        <Grid container spacing={3}>
          {users.map((user) => (
            <Grid item xs={12} sm={6} md={4} key={user.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {user.displayName || user.username}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    {user.email}
                  </Typography>
                  <Chip
                    label={user.roles}
                    size="small"
                    color={user.roles === "admin" ? "secondary" : "default"}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );

  const renderTagsTab = () => (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Tags Management
      </Typography>
      {tags.length === 0 ? (
        <Alert severity="info">No tags found.</Alert>
      ) : (
        <Grid container spacing={2}>
          {tags.map((tag) => (
            <Grid item key={tag.id}>
              <Chip
                label={tag.name}
                color="primary"
                variant="outlined"
                size="large"
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight={400}
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom>
        Admin Panel
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Welcome back, {user?.firstName || user?.username}! Manage your platform
        from here.
      </Typography>

      {renderStatsCards()}

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="admin tabs"
        >
          <Tab label="Brands" icon={<BrandIcon />} iconPosition="start" />
          <Tab label="Briefs" icon={<BriefIcon />} iconPosition="start" />
          <Tab label="Users" icon={<UsersIcon />} iconPosition="start" />
          <Tab label="Tags" icon={<TagIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      {activeTab === 0 && renderBrandsTab()}
      {activeTab === 1 && renderBriefsTab()}
      {activeTab === 2 && renderUsersTab()}
      {activeTab === 3 && renderTagsTab()}

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

      {/* Floating Action Button for Quick Access */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: "fixed", bottom: 16, right: 16 }}
        onClick={() => {
          if (activeTab === 0) {
            openBrandForm();
          } else if (activeTab === 1) {
            openBriefForm();
          }
        }}
      >
        <AddIcon />
      </Fab>
    </Container>
  );
};

export default AdminPanel;
