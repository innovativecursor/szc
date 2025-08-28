import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  Chip,
  IconButton,
  LinearProgress,
} from "@mui/material";
import {
  Close as CloseIcon,
  CloudUpload as UploadIcon,
} from "@mui/icons-material";
import { submissionsAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const SubmissionForm = ({ open, onClose, brief, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [formData, setFormData] = useState({
    description: "",
    files: [],
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newFiles = files.map((file) => ({
      file,
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
    }));

    setFormData((prev) => ({
      ...prev,
      files: [...prev.files, ...newFiles],
    }));
  };

  const removeFile = (fileId) => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((f) => f.id !== fileId),
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.description.trim()) {
      errors.description = "Description is required";
    }

    if (formData.files.length === 0) {
      errors.files = "At least one file is required";
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setAlert({
        severity: "error",
        message: "Please fix the errors above",
      });
      return;
    }

    setLoading(true);
    setAlert(null);

    try {
      // Create FormData for multipart/form-data submission
      const formDataToSend = new FormData();
      formDataToSend.append("description", formData.description);

      // Append each file
      formData.files.forEach((fileObj) => {
        formDataToSend.append("files", fileObj.file);
      });

      const response = await submissionsAPI.create({
        brief_id: brief.id,
        formData: formDataToSend,
      });

      setAlert({
        severity: "success",
        message: "Submission created successfully!",
      });

      // Reset form
      setFormData({
        description: "",
        files: [],
      });

      // Call success callback
      if (onSuccess) {
        onSuccess(response.data);
      }

      // Close dialog after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Error creating submission:", error);
      setAlert({
        severity: "error",
        message: error.response?.data?.message || "Failed to create submission",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        description: "",
        files: [],
      });
      setAlert(null);
      onClose();
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Submit Your Work</Typography>
          <IconButton onClick={handleClose} disabled={loading}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Brief: {brief?.title}
        </Typography>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          {alert && (
            <Alert severity={alert.severity} sx={{ mb: 2 }}>
              {alert.message}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            multiline
            rows={4}
            sx={{ mb: 3 }}
            disabled={loading}
            helperText="Describe your submission, your creative process, and any relevant details"
          />

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Upload Files
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Supported formats: Images, PDFs, Videos, Design files
            </Typography>

            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadIcon />}
              disabled={loading}
              sx={{ mb: 2 }}
            >
              Choose Files
              <input
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.psd,.ai,.sketch,.mp4,.mov,.avi"
                onChange={handleFileUpload}
                style={{ display: "none" }}
              />
            </Button>

            {formData.files.length > 0 && (
              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Selected Files ({formData.files.length}):
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {formData.files.map((fileObj) => (
                    <Chip
                      key={fileObj.id}
                      label={`${fileObj.name} (${formatFileSize(fileObj.size)})`}
                      onDelete={() => removeFile(fileObj.id)}
                      disabled={loading}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>

          {loading && <LinearProgress sx={{ mt: 2 }} />}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || formData.files.length === 0}
          >
            {loading ? "Submitting..." : "Submit Work"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default SubmissionForm;
