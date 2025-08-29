import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // Increased timeout for file uploads
  // Remove default Content-Type header to allow multipart/form-data
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Only set Content-Type for JSON requests
    if (!config.headers["Content-Type"] && (!config.data) instanceof FormData) {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });
          localStorage.setItem("accessToken", response.data.data.accessToken);
          localStorage.setItem("refreshToken", response.data.data.refreshToken);

          // Retry original request
          error.config.headers.Authorization = `Bearer ${response.data.data.accessToken}`;
          return api.request(error.config);
        } catch (refreshError) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post("/auth/register", userData),
  login: (credentials) => api.post("/auth/login", credentials),
  getProfile: () => api.get("/auth/profile"),
  updateProfile: (profileData) => api.put("/auth/profile", profileData),
};

// Briefs API
export const briefsAPI = {
  getAll: (params) => api.get("/briefs", { params }),
  getById: (id) => api.get(`/briefs/${id}`),
  create: (briefData) => {
    // Briefs are created through brands endpoint
    const { brand_id, ...restData } = briefData;
    return api.post(`/brands/${brand_id}/briefs`, restData);
  },
  update: (id, briefData) => api.patch(`/briefs/${id}`, briefData),
  delete: (id) => api.delete(`/briefs/${id}`),
};

// Submissions API
export const submissionsAPI = {
  getAll: (params) => api.get("/submissions", { params }),
  getById: (id) => api.get(`/submissions/${id}`),
  getByBriefId: (briefId) => api.get(`/briefs/${briefId}/submissions`),
  create: (submissionData) => {
    // Submissions are created through briefs endpoint
    const { brief_id, formData } = submissionData;
    return api.post(`/briefs/${brief_id}/submissions`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  update: (id, submissionData) =>
    api.patch(`/submissions/${id}`, submissionData),
  delete: (id) => api.delete(`/submissions/${id}`),
};

// Reactions API
export const reactionsAPI = {
  getAll: (params) => api.get("/reactions", { params }),
  getBySubmission: (submissionId) =>
    api.get(`/reactions/submission/${submissionId}`),
  create: (reactionData) => {
    const { submission_id, reaction } = reactionData;
    return api.post(`/reactions/submission/${submission_id}`, { reaction });
  },
  update: (id, reactionData) => api.patch(`/reactions/${id}`, reactionData),
  delete: (id) => api.delete(`/reactions/${id}`),
};

// Brands API
export const brandsAPI = {
  getAll: (params) => api.get("/brands", { params }),
  getById: (id) => api.get(`/brands/${id}`),
  create: (brandData) => api.post("/brands", brandData),
  update: (id, brandData) => api.patch(`/brands/${id}`, brandData),
  delete: (id) => api.delete(`/brands/${id}`),
  getStats: (id) => api.get(`/brands/${id}/stats`),
};

// Tags API
export const tagsAPI = {
  getAll: (params) => api.get("/tags", { params }),
  getById: (id) => api.get(`/tags/${id}`),
  create: (tagData) => api.post("/tags", tagData),
  update: (id, tagData) => api.patch(`/tags/${id}`, tagData),
  delete: (id) => api.delete(`/tags/${id}`),
};

// Portfolios API
export const portfoliosAPI = {
  getAll: (params) => api.get("/portfolios", { params }),
  getByUser: (userId) => api.get(`/portfolios/users/${userId}`),
  getById: (userId, portfolioId) =>
    api.get(`/portfolios/users/${userId}/${portfolioId}`),
  create: (userId, portfolioData) => {
    const formData = new FormData();
    Object.keys(portfolioData).forEach((key) => {
      if (key === "files") {
        if (portfolioData[key] && portfolioData[key].length > 0) {
          portfolioData[key].forEach((file) => {
            formData.append("files", file);
          });
        }
      } else {
        formData.append(key, portfolioData[key]);
      }
    });
    return api.post(`/portfolios/users/${userId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  update: (userId, portfolioId, portfolioData) => {
    const formData = new FormData();
    Object.keys(portfolioData).forEach((key) => {
      if (key === "files") {
        if (portfolioData[key] && portfolioData[key].length > 0) {
          portfolioData[key].forEach((file) => {
            formData.append("files", file);
          });
        }
      } else {
        formData.append(key, portfolioData[key]);
      }
    });
    return api.patch(`/portfolios/users/${userId}/${portfolioId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  delete: (userId, portfolioId) =>
    api.delete(`/portfolios/users/${userId}/${portfolioId}`),
};

// Creatives API
export const creativesAPI = {
  getAll: (params) => api.get("/creatives", { params }),
  getByPortfolio: (portfolioId) =>
    api.get(`/creatives/portfolios/${portfolioId}`),
  getById: (portfolioId, creativeId) =>
    api.get(`/creatives/portfolios/${portfolioId}/${creativeId}`),
  create: (portfolioId, creativeData) => {
    const formData = new FormData();
    Object.keys(creativeData).forEach((key) => {
      if (key === "files") {
        if (creativeData[key] && creativeData[key].length > 0) {
          creativeData[key].forEach((file) => {
            formData.append("files", file);
          });
        }
      } else {
        formData.append(key, creativeData[key]);
      }
    });
    return api.post(`/creatives/portfolios/${portfolioId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  update: (portfolioId, creativeId, creativeData) => {
    const formData = new FormData();
    Object.keys(creativeData).forEach((key) => {
      if (key === "files") {
        if (creativeData[key] && creativeData[key].length > 0) {
          creativeData[key].forEach((file) => {
            formData.append("files", file);
          });
        }
      } else {
        formData.append(key, creativeData[key]);
      }
    });
    return api.patch(
      `/creatives/portfolios/${portfolioId}/${creativeId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  },
  delete: (portfolioId, creativeId) =>
    api.delete(`/creatives/portfolios/${portfolioId}/${creativeId}`),
};

// Users API
export const usersAPI = {
  getAll: (params) => api.get("/users", { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, userData) => api.patch(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
};

export default api;
