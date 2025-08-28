import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Grid,
  Alert,
  CircularProgress,
  Typography,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Chip,
  Autocomplete,
} from "@mui/material";
import {
  Assignment as BriefIcon,
  Business as BrandIcon,
  AttachMoney as MoneyIcon,
  Schedule as ScheduleIcon,
  Label as TagIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";
import { briefsAPI, brandsAPI, tagsAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const BriefForm = ({ open, onClose, onSuccess, selectedBrandId = null }) => {
  const { user } = useAuth(); // Get current user for CRM User ID
  const [formData, setFormData] = useState({
    brand_id: selectedBrandId || "",
    title: "",
    description: "",
    isPaid: false,
    prizeAmount: "",
    submissionDeadline: "",
    votingStart: "",
    votingEnd: "",
    status: "submission",
    tags: [],
    base64_images: [], // For image uploads
    // crmUserId removed - will be set automatically from current user
  });

  const [brands, setBrands] = useState([]);
  const [tags, setTags] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    severity: "error",
  });

  // Fetch brands and tags when component mounts
  useEffect(() => {
    if (open) {
      fetchBrandsAndTags();
    }
  }, [open]);

  const fetchBrandsAndTags = async () => {
    setFetchingData(true);
    try {
      const [brandsRes, tagsRes] = await Promise.all([
        brandsAPI.getAll(),
        tagsAPI.getAll(),
      ]);

      setBrands(brandsRes.data.data || brandsRes.data || []);
      setTags(tagsRes.data.data || tagsRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setAlert({
        show: true,
        message: "Failed to load brands and tags",
        severity: "error",
      });
    } finally {
      setFetchingData(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleTagChange = (event, newValue) => {
    setFormData((prev) => ({
      ...prev,
      tags: newValue,
    }));
  };

  // Handle image file uploads
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const imagePromises = files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          // Convert to base64
          const base64 = e.target.result.split(",")[1]; // Remove data:image/...;base64, prefix
          resolve({
            name: file.name,
            type: file.type,
            size: file.size,
            base64: base64,
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(imagePromises).then((images) => {
      setFormData((prev) => ({
        ...prev,
        base64_images: [...prev.base64_images, ...images],
      }));
    });
  };

  // Remove uploaded image
  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      base64_images: prev.base64_images.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.brand_id) {
      newErrors.brand_id = "Brand selection is required";
    }

    if (!formData.title.trim()) {
      newErrors.title = "Brief title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Brief description is required";
    }

    if (formData.isPaid && !formData.prizeAmount) {
      newErrors.prizeAmount = "Prize amount is required for paid briefs";
    }

    if (formData.prizeAmount && isNaN(parseFloat(formData.prizeAmount))) {
      newErrors.prizeAmount = "Prize amount must be a valid number";
    }

    if (
      formData.submissionDeadline &&
      new Date(formData.submissionDeadline) <= new Date()
    ) {
      newErrors.submissionDeadline =
        "Submission deadline must be in the future";
    }

    // Voting start must be BEFORE submission deadline
    if (formData.votingStart && formData.submissionDeadline) {
      const submissionDeadline = new Date(formData.submissionDeadline);
      const votingStart = new Date(formData.votingStart);

      if (votingStart >= submissionDeadline) {
        newErrors.votingStart =
          "Voting start must be before submission deadline";
      }
    }

    // Voting end can be anytime, but if voting start is set, end should be after start
    if (formData.votingEnd && formData.votingStart) {
      const votingStart = new Date(formData.votingStart);
      const votingEnd = new Date(formData.votingEnd);

      if (votingEnd <= votingStart) {
        newErrors.votingEnd = "Voting end must be after voting start";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setAlert({ show: false, message: "", severity: "error" });

    try {
      // Prepare data for API - convert to backend field names
      const briefData = {
        ...formData,
        prizeAmount: formData.prizeAmount
          ? parseFloat(formData.prizeAmount)
          : null,
        submissionDeadline: formData.submissionDeadline || null,
        votingStart: formData.votingStart || null,
        votingEnd: formData.votingEnd || null,
        tags: formData.tags.map((tag) => tag.id || tag),
        crmUserId: user?.id || "default", // Automatically use current admin's ID
      };

      // If S3 upload fails, we can store images as base64 temporarily
      // The backend will handle this gracefully
      if (formData.base64_images.length > 0) {
        briefData.base64_images = formData.base64_images.map(
          (img) => img.base64
        );
      }

      const response = await briefsAPI.create(briefData);

      setAlert({
        show: true,
        message: "Brief created successfully!",
        severity: "success",
      });

      // Reset form
      setFormData({
        brand_id: selectedBrandId || "",
        title: "",
        description: "",
        isPaid: false,
        prizeAmount: "",
        submissionDeadline: "",
        votingStart: "",
        votingEnd: "",
        status: "submission",
        tags: [],
        base64_images: [],
        // crmUserId removed - will be set automatically
      });

      // Call success callback
      if (onSuccess) {
        onSuccess(response.data);
      }

      // Close dialog after a short delay
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      let errorMessage = "Failed to create brief";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      // Special handling for S3 upload errors
      if (errorMessage.includes("Failed to upload images")) {
        errorMessage =
          "Brief created but image upload failed. Images will be stored temporarily.";
        // Still show success for the brief creation
        setAlert({
          show: true,
          message: errorMessage,
          severity: "warning",
        });

        // Call success callback anyway since brief was created
        if (onSuccess) {
          onSuccess({ id: "temp", title: formData.title }); // Temporary success
        }

        setTimeout(() => {
          onClose();
        }, 3000);
        return;
      }

      setAlert({
        show: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        brand_id: selectedBrandId || "",
        title: "",
        description: "",
        isPaid: false,
        prizeAmount: "",
        submissionDeadline: "",
        votingStart: "",
        votingEnd: "",
        status: "submission",
        tags: [],
        base64_images: [],
        // crmUserId removed - will be set automatically
      });
      setErrors({});
      setAlert({ show: false, message: "", severity: "error" });
      onClose();
    }
  };

  if (fetchingData) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogContent>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight={200}
          >
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <BriefIcon color="primary" />
          <Typography variant="h6">Create New Brief</Typography>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          {alert.show && (
            <Alert severity={alert.severity} sx={{ mb: 3 }}>
              {alert.message}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.brand_id} required>
                <InputLabel>Select Brand</InputLabel>
                <Select
                  name="brand_id"
                  value={formData.brand_id}
                  onChange={handleInputChange}
                  label="Select Brand"
                  startAdornment={
                    <BrandIcon sx={{ mr: 1, color: "text.secondary" }} />
                  }
                >
                  {brands.map((brand) => (
                    <MenuItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.brand_id && (
                  <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                    {errors.brand_id}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Brief Title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                error={!!errors.title}
                helperText={errors.title}
                required
                InputProps={{
                  startAdornment: (
                    <BriefIcon sx={{ mr: 1, color: "text.secondary" }} />
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                error={!!errors.description}
                helperText={errors.description}
                required
                multiline
                rows={4}
                InputProps={{
                  startAdornment: (
                    <DescriptionIcon sx={{ mr: 1, color: "text.secondary" }} />
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Payment & Rewards
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isPaid}
                    onChange={handleInputChange}
                    name="isPaid"
                  />
                }
                label="This is a paid brief"
              />
            </Grid>

            {formData.isPaid && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Prize Amount ($)"
                  name="prizeAmount"
                  type="number"
                  value={formData.prizeAmount}
                  onChange={handleInputChange}
                  error={!!errors.prizeAmount}
                  helperText={errors.prizeAmount}
                  InputProps={{
                    startAdornment: (
                      <MoneyIcon sx={{ mr: 1, color: "text.secondary" }} />
                    ),
                  }}
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Timeline & Deadlines
              </Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Submission Deadline"
                name="submissionDeadline"
                type="datetime-local"
                value={formData.submissionDeadline}
                onChange={handleInputChange}
                error={!!errors.submissionDeadline}
                helperText={errors.submissionDeadline}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <ScheduleIcon sx={{ mr: 1, color: "text.secondary" }} />
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Voting Start"
                name="votingStart"
                type="datetime-local"
                value={formData.votingStart}
                onChange={handleInputChange}
                error={!!errors.votingStart}
                helperText={
                  errors.votingStart || "Must be before submission deadline"
                }
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <ScheduleIcon sx={{ mr: 1, color: "text.secondary" }} />
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Voting End"
                name="votingEnd"
                type="datetime-local"
                value={formData.votingEnd}
                onChange={handleInputChange}
                error={!!errors.votingEnd}
                helperText={
                  errors.votingEnd || "Can be anytime after voting start"
                }
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <ScheduleIcon sx={{ mr: 1, color: "text.secondary" }} />
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Tags & Categories
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={tags}
                getOptionLabel={(option) => option.name}
                value={formData.tags}
                onChange={handleTagChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Tags"
                    placeholder="Choose relevant tags"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <TagIcon sx={{ mr: 1, color: "text.secondary" }} />
                          {params.InputProps.startAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      key={option.id || index}
                      label={option.name}
                      {...getTagProps({ index })}
                      color="primary"
                      variant="outlined"
                    />
                  ))
                }
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Upload Images (Optional)
              </Typography>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                style={{ display: "none" }}
                id="image-upload-input"
              />
              <label htmlFor="image-upload-input">
                <Button variant="outlined" component="span">
                  Upload Images
                </Button>
              </label>
              <Box sx={{ mt: 2 }}>
                {formData.base64_images.length > 0 && (
                  <Typography variant="subtitle2">Uploaded Images:</Typography>
                )}
                {formData.base64_images.map((image, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mt: 1,
                      p: 1,
                      border: "1px solid #ccc",
                      borderRadius: 1,
                    }}
                  >
                    <img
                      src={image.base64}
                      alt={`Uploaded ${image.name}`}
                      style={{ maxWidth: 100, maxHeight: 100, marginRight: 10 }}
                    />
                    <Button
                      size="small"
                      color="error"
                      onClick={() => removeImage(index)}
                    >
                      Remove
                    </Button>
                  </Box>
                ))}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <BriefIcon />}
          >
            {loading ? "Creating..." : "Create Brief"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default BriefForm;
