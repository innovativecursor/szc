import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import { portfoliosAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const PortfolioForm = ({
  open,
  onClose,
  onSuccess,
  portfolio = null,
  isEdit = false,
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (portfolio && isEdit) {
      setFormData({
        title: portfolio.title || "",
        description: portfolio.description || "",
      });
    } else {
      setFormData({
        title: "",
        description: "",
      });
    }
  }, [portfolio, isEdit, open]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isEdit && portfolio) {
        await portfoliosAPI.update(user.id, portfolio.id, formData);
      } else {
        await portfoliosAPI.create(user.id, formData);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Portfolio operation failed:", error);
      setError(error.response?.data?.message || "Failed to save portfolio");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError("");
    setFormData({
      title: "",
      description: "",
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isEdit ? "Edit Portfolio" : "Create New Portfolio"}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Portfolio Title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              required
              fullWidth
              placeholder="Enter portfolio title"
            />

            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              multiline
              rows={4}
              fullWidth
              placeholder="Describe your portfolio"
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !formData.title.trim()}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading
              ? "Saving..."
              : isEdit
                ? "Update Portfolio"
                : "Create Portfolio"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default PortfolioForm;
