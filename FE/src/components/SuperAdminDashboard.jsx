import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Block as DeactivateIcon,
  Person as UserIcon,
  AdminPanelSettings as AdminIcon,
  Security as SuperAdminIcon,
} from "@mui/icons-material";
import { adminAPI } from "../services/api";

const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [allAdmins, setAllAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    severity: "info",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pendingResponse, adminsResponse] = await Promise.all([
        adminAPI.getPendingApprovals(),
        adminAPI.getAllAdmins(),
      ]);

      if (pendingResponse.data.success) {
        setPendingAdmins(pendingResponse.data.data.pendingAdmins);
      }

      if (adminsResponse.data.success) {
        setAllAdmins(adminsResponse.data.data.admins);
      }
    } catch (error) {
      setAlert({
        show: true,
        message: "Failed to load admin data",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAdmin = async (adminId, approved) => {
    try {
      const response = await adminAPI.approveAdmin(adminId, { approved });

      if (response.data.success) {
        setAlert({
          show: true,
          message: response.data.message,
          severity: "success",
        });
        loadData(); // Reload data
      }
    } catch (error) {
      setAlert({
        show: true,
        message: "Failed to process admin approval",
        severity: "error",
      });
    }
  };

  const handleDeactivateAdmin = async (adminId) => {
    try {
      const response = await adminAPI.deactivateAdmin(adminId);

      if (response.data.success) {
        setAlert({
          show: true,
          message: response.data.message,
          severity: "success",
        });
        loadData(); // Reload data
      }
    } catch (error) {
      setAlert({
        show: true,
        message: "Failed to deactivate admin",
        severity: "error",
      });
    }
  };

  const getStatusChip = (isVerified, isActive) => {
    if (!isActive) {
      return <Chip label="Deactivated" color="error" size="small" />;
    }
    if (isVerified) {
      return <Chip label="Verified" color="success" size="small" />;
    }
    return <Chip label="Pending" color="warning" size="small" />;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderPendingAdmins = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>User</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Created</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {pendingAdmins.map((admin) => (
            <TableRow key={admin.id}>
              <TableCell>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <AdminIcon color="primary" />
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {admin.displayName ||
                        `${admin.firstName} ${admin.lastName}`}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      @{admin.username}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>{admin.email}</TableCell>
              <TableCell>{formatDate(admin.createdAt)}</TableCell>
              <TableCell>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    size="small"
                    variant="contained"
                    color="success"
                    startIcon={<ApproveIcon />}
                    onClick={() => handleApproveAdmin(admin.id, true)}
                  >
                    Approve
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<RejectIcon />}
                    onClick={() => handleApproveAdmin(admin.id, false)}
                  >
                    Reject
                  </Button>
                </Box>
              </TableCell>
            </TableRow>
          ))}
          {pendingAdmins.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} align="center">
                <Typography variant="body2" color="text.secondary">
                  No pending admin approvals
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderAllAdmins = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>User</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Created</TableCell>
            <TableCell>Last Login</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {allAdmins.map((admin) => (
            <TableRow key={admin.id}>
              <TableCell>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <AdminIcon color="primary" />
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {admin.displayName ||
                        `${admin.firstName} ${admin.lastName}`}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      @{admin.username}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>{admin.email}</TableCell>
              <TableCell>
                {getStatusChip(admin.isVerified, admin.isActive)}
              </TableCell>
              <TableCell>{formatDate(admin.createdAt)}</TableCell>
              <TableCell>
                {admin.lastLogin ? formatDate(admin.lastLogin) : "Never"}
              </TableCell>
              <TableCell>
                {admin.isActive && (
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<DeactivateIcon />}
                    onClick={() => handleDeactivateAdmin(admin.id)}
                  >
                    Deactivate
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderDashboard = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <AdminIcon color="primary" sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  {allAdmins.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Admins
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Chip color="warning" label={pendingAdmins.length} />
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  {pendingAdmins.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending Approvals
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <SuperAdminIcon color="error" sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  1
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Super Admin
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Super Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage admin users and system access
        </Typography>
      </Box>

      {alert.show && (
        <Alert
          severity={alert.severity}
          sx={{ mb: 3 }}
          onClose={() => setAlert({ ...alert, show: false })}
        >
          {alert.message}
        </Alert>
      )}

      {renderDashboard()}

      <Box sx={{ mt: 4 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
        >
          <Tab label={`Pending Approvals (${pendingAdmins.length})`} />
          <Tab label="All Admins" />
        </Tabs>

        <Box sx={{ mt: 3 }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {activeTab === 0 && renderPendingAdmins()}
              {activeTab === 1 && renderAllAdmins()}
            </>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default SuperAdminDashboard;
