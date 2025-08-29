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
import { creativesAPI } from "../services/api";

const CreativeForm = ({
  open,
  onClose,
  onSuccess,
  portfolioId,
  creative = null,
  isEdit = false,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    files: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (creative && isEdit) {
      setFormData({
        title: creative.title || "",
        description: creative.description || "",
        files: [],
      });
    } else {
      setFormData({
        title: "",
        description: "",
        files: [],
      });
    }
  }, [creative, isEdit, open]);

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
      if (isEdit && creative) {
        await creativesAPI.update(portfolioId, creative.id, formData);
      } else {
        await creativesAPI.create(portfolioId, formData);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Creative operation failed:", error);
      setError(error.response?.data?.message || "Failed to save creative");
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
      <DialogTitle>{isEdit ? "Edit Creative" : "Add New Creative"}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Creative Title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              required
              fullWidth
              placeholder="Enter creative title"
            />

            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              multiline
              rows={4}
              fullWidth
              placeholder="Describe your creative work"
            />

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Files
              </Typography>
              <input
                accept="image/*,.pdf,.doc,.docx,.psd,.ai,.sketch,.mp4,.mov,.avi"
                style={{ display: "none" }}
                id="creative-files"
                multiple
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor="creative-files">
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
                ? "Update Creative"
                : "Add Creative"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreativeForm;
