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
  IconButton,
} from "@mui/material";
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
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
    files: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (portfolio && isEdit) {
      setFormData({
        title: portfolio.title || "",
        description: portfolio.description || "",
        files: [],
      });
    } else {
      setFormData({
        title: "",
        description: "",
        files: [],
      });
    }
  }, [portfolio, isEdit, open]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setFormData((prev) => ({ ...prev, files: [...prev.files, ...files] }));
  };

  const removeFile = (index) => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }));
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
      files: [],
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

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Files
              </Typography>
              <input
                accept="image/*,.pdf,.doc,.docx,.psd,.ai,.sketch"
                style={{ display: "none" }}
                id="portfolio-files"
                multiple
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor="portfolio-files">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<UploadIcon />}
                  sx={{ mb: 2 }}
                >
                  Upload Files
                </Button>
              </label>

              {formData.files.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Selected files:
                  </Typography>
                  {formData.files.map((file, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mt: 1,
                        p: 1,
                        border: "1px solid #e0e0e0",
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => removeFile(index)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
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
