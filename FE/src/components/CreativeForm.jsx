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
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
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
    type: "",
    medium: "",
    dimensions: "",
    year: "",
    tags: [],
    files: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newTag, setNewTag] = useState("");

  const creativeTypes = [
    "Graphic Design",
    "Photography",
    "Illustration",
    "Digital Art",
    "Painting",
    "Sculpture",
    "Web Design",
    "UI/UX Design",
    "Animation",
    "Video",
    "Other",
  ];

  const mediums = [
    "Digital",
    "Oil on Canvas",
    "Acrylic",
    "Watercolor",
    "Charcoal",
    "Pencil",
    "Mixed Media",
    "Photography",
    "Vector",
    "3D",
    "Other",
  ];

  useEffect(() => {
    if (creative && isEdit) {
      setFormData({
        title: creative.title || "",
        description: creative.description || "",
        type: creative.type || "",
        medium: creative.medium || "",
        dimensions: creative.dimensions || "",
        year: creative.year || "",
        tags: creative.tags || [],
        files: [],
      });
    } else {
      setFormData({
        title: "",
        description: "",
        type: "",
        medium: "",
        dimensions: "",
        year: "",
        tags: [],
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

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
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
      type: "",
      medium: "",
      dimensions: "",
      year: "",
      tags: [],
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

            <Box sx={{ display: "flex", gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={formData.type}
                  label="Type"
                  onChange={(e) => handleInputChange("type", e.target.value)}
                >
                  {creativeTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Medium</InputLabel>
                <Select
                  value={formData.medium}
                  label="Medium"
                  onChange={(e) => handleInputChange("medium", e.target.value)}
                >
                  {mediums.map((medium) => (
                    <MenuItem key={medium} value={medium}>
                      {medium}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Dimensions"
                value={formData.dimensions}
                onChange={(e) =>
                  handleInputChange("dimensions", e.target.value)
                }
                fullWidth
                placeholder="e.g., 1920x1080, 11x14 inches"
              />

              <TextField
                label="Year"
                value={formData.year}
                onChange={(e) => handleInputChange("year", e.target.value)}
                fullWidth
                placeholder="e.g., 2024"
                inputProps={{ maxLength: 4 }}
              />
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Tags
              </Typography>
              <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                <TextField
                  size="small"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addTag())
                  }
                />
                <Button
                  variant="outlined"
                  onClick={addTag}
                  startIcon={<AddIcon />}
                  disabled={!newTag.trim()}
                >
                  Add
                </Button>
              </Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {formData.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    onDelete={() => removeTag(tag)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>

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
