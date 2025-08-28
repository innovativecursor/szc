import React, { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Avatar,
  Chip,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Assignment as BriefsIcon,
  Upload as SubmissionsIcon,
  AdminPanelSettings as AdminIcon,
  Person as ProfileIcon,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMobileMenuAnchor(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate("/login");
  };

  const handleProfileClick = () => {
    handleMenuClose();
    navigate("/profile");
  };

  const handleAdminClick = () => {
    handleMenuClose();
    navigate("/admin");
  };

  const isAdmin = user?.roles === "admin" || user?.roles === "super_admin";

  return (
    <AppBar position="static">
      <Toolbar>
        {/* Mobile menu button */}
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2, display: { sm: "none" } }}
          onClick={handleMobileMenuOpen}
        >
          <MenuIcon />
        </IconButton>

        {/* Logo/Brand */}
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: "none",
            color: "inherit",
            fontWeight: "bold",
          }}
        >
          SkillzCollab
        </Typography>

        {/* Desktop Navigation */}
        {isAuthenticated && (
          <Box sx={{ display: { xs: "none", sm: "flex" }, gap: 1 }}>
            <Button
              color="inherit"
              component={RouterLink}
              to="/dashboard"
              startIcon={<DashboardIcon />}
            >
              Dashboard
            </Button>
            <Button
              color="inherit"
              component={RouterLink}
              to="/briefs"
              startIcon={<BriefsIcon />}
            >
              Briefs
            </Button>
            <Button
              color="inherit"
              component={RouterLink}
              to="/submissions"
              startIcon={<SubmissionsIcon />}
            >
              Submissions
            </Button>
            {isAdmin && (
              <Button
                color="inherit"
                component={RouterLink}
                to="/admin"
                startIcon={<AdminIcon />}
              >
                Admin
              </Button>
            )}
          </Box>
        )}

        {/* User Menu */}
        {isAuthenticated ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Chip
              label={user?.roles || "User"}
              color={
                user?.roles === "admin" || user?.roles === "super_admin"
                  ? "secondary"
                  : "default"
              }
              size="small"
            />
            <IconButton onClick={handleProfileMenuOpen} sx={{ p: 0 }}>
              <Avatar sx={{ width: 32, height: 32 }}>
                {user?.firstName?.[0] || user?.username?.[0] || "U"}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleProfileClick}>
                <ProfileIcon sx={{ mr: 1 }} />
                Profile
              </MenuItem>
              {isAdmin && (
                <MenuItem onClick={handleAdminClick}>
                  <AdminIcon sx={{ mr: 1 }} />
                  Admin Panel
                </MenuItem>
              )}
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        ) : (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button color="inherit" component={RouterLink} to="/login">
              Login
            </Button>
            <Button
              color="inherit"
              component={RouterLink}
              to="/register"
              variant="outlined"
              sx={{ color: "white", borderColor: "white" }}
            >
              Register
            </Button>
          </Box>
        )}

        {/* Mobile Menu */}
        <Menu
          anchorEl={mobileMenuAnchor}
          open={Boolean(mobileMenuAnchor)}
          onClose={handleMenuClose}
          sx={{ display: { sm: "none" } }}
        >
          {isAuthenticated && (
            <>
              <MenuItem
                component={RouterLink}
                to="/dashboard"
                onClick={handleMenuClose}
              >
                <DashboardIcon sx={{ mr: 1 }} />
                Dashboard
              </MenuItem>
              <MenuItem
                component={RouterLink}
                to="/briefs"
                onClick={handleMenuClose}
              >
                <BriefsIcon sx={{ mr: 1 }} />
                Briefs
              </MenuItem>
              <MenuItem
                component={RouterLink}
                to="/submissions"
                onClick={handleMenuClose}
              >
                <SubmissionsIcon sx={{ mr: 1 }} />
                Submissions
              </MenuItem>
              {isAdmin && (
                <MenuItem
                  component={RouterLink}
                  to="/admin"
                  onClick={handleMenuClose}
                >
                  <AdminIcon sx={{ mr: 1 }} />
                  Admin
                </MenuItem>
              )}
              <MenuItem onClick={handleProfileClick}>
                <ProfileIcon sx={{ mr: 1 }} />
                Profile
              </MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </>
          )}
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
