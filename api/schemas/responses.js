/**
 * API Response Schemas for Swagger Documentation
 * These schemas define the structure of API responses
 */

// Common response schemas
const commonResponses = {
  // Success response wrapper
  success: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Operation completed successfully",
      },
      data: {
        type: "object",
        description: "Response data",
      },
    },
  },

  // Error response wrapper
  error: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: false,
      },
      message: {
        type: "string",
        example: "An error occurred",
      },
      error: {
        type: "string",
        example: "VALIDATION_ERROR",
      },
      details: {
        type: "array",
        items: {
          type: "object",
          properties: {
            field: { type: "string" },
            message: { type: "string" },
          },
        },
      },
    },
  },

  // Paginated response wrapper
  paginated: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      data: {
        type: "array",
        description: "Array of items",
      },
      pagination: {
        type: "object",
        properties: {
          page: { type: "integer", example: 1 },
          limit: { type: "integer", example: 20 },
          total: { type: "integer", example: 100 },
          pages: { type: "integer", example: 5 },
          hasNext: { type: "boolean", example: true },
          hasPrev: { type: "boolean", example: false },
        },
      },
    },
  },
};

// User response schemas
const userResponses = {
  // User object
  user: {
    type: "object",
    properties: {
      id: {
        type: "string",
        format: "uuid",
        example: "123e4567-e89b-12d3-a456-426614174000",
      },
      username: {
        type: "string",
        example: "john_doe",
      },
      email: {
        type: "string",
        format: "email",
        example: "john@example.com",
      },
      displayName: {
        type: "string",
        example: "John Doe",
      },
      bio: {
        type: "string",
        example: "Creative professional with 5+ years of experience",
      },
      profileImageURL: {
        type: "string",
        format: "uri",
        example: "https://example.com/avatar.jpg",
      },
      portfolioURL: {
        type: "string",
        format: "uri",
        example: "https://johndoe.com",
      },
      phoneNumber: {
        type: "string",
        example: "+1-555-123-4567",
      },
      alternateEmail: {
        type: "string",
        format: "email",
        example: "john.alt@example.com",
      },
      socialLinks: {
        type: "object",
        example: {
          twitter: "https://twitter.com/johndoe",
          linkedin: "https://linkedin.com/in/johndoe",
          instagram: "https://instagram.com/johndoe",
        },
      },
      googleId: {
        type: "string",
        example: "123456789012345678901",
        description: "Google OAuth ID for OAuth users",
      },
      roles: {
        type: "string",
        enum: ["super_admin", "admin", "user"],
        example: "user",
      },
      isVerified: {
        type: "boolean",
        example: true,
      },
      isActive: {
        type: "boolean",
        example: true,
      },
      lastLogin: {
        type: "string",
        format: "date-time",
        example: "2024-01-15T10:30:00Z",
      },
      createdAt: {
        type: "string",
        format: "date-time",
        example: "2024-01-01T00:00:00Z",
      },
      updatedAt: {
        type: "string",
        format: "date-time",
        example: "2024-01-15T10:30:00Z",
      },
    },
  },

  // User with profile
  userWithProfile: {
    allOf: [
      { $ref: "#/components/schemas/user" },
      {
        type: "object",
        properties: {
          creativeProfile: { $ref: "#/components/schemas/creative" },
          brandProfile: { $ref: "#/components/schemas/brand" },
          adminProfile: { $ref: "#/components/schemas/admin" },
          portfolios: {
            type: "array",
            items: { $ref: "#/components/schemas/portfolio" },
          },
        },
      },
    ],
  },

  // User authentication response
  authResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Authentication successful",
      },
      data: {
        type: "object",
        properties: {
          user: { $ref: "#/components/schemas/user" },
          token: {
            type: "string",
            example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          },
          refreshToken: {
            type: "string",
            example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          },
        },
      },
    },
  },
};

// Brief response schemas
const briefResponses = {
  // Brief object
  brief: {
    type: "object",
    properties: {
      id: {
        type: "string",
        format: "uuid",
        example: "123e4567-e89b-12d3-a456-426614174000",
      },
      brand_id: {
        type: "string",
        format: "uuid",
        example: "123e4567-e89b-12d3-a456-426614174001",
        description: "Brand ID - mandatory field for brief creation",
      },
      title: {
        type: "string",
        example: "Logo Design for Tech Startup",
      },
      description: {
        type: "string",
        example:
          "We need a modern, professional logo for our new tech startup...",
      },
      is_paid: {
        type: "boolean",
        example: true,
      },
      prize_amount: {
        type: "number",
        example: 1500.0,
      },
      submission_deadline: {
        type: "string",
        format: "date-time",
        example: "2024-02-15T23:59:59Z",
      },
      voting_start: {
        type: "string",
        format: "date-time",
        example: "2024-02-20T00:00:00Z",
      },
      voting_end: {
        type: "string",
        format: "date-time",
        example: "2024-02-25T23:59:59Z",
      },
      winner_user_id: {
        type: "string",
        format: "uuid",
        example: "123e4567-e89b-12d3-a456-426614174002",
      },
      status: {
        type: "string",
        enum: ["submission", "in_review", "winner"],
        example: "submission",
      },
      crm_user_id: {
        type: "string",
        format: "uuid",
        example: "123e4567-e89b-12d3-a456-426614174003",
      },
      is_active: {
        type: "boolean",
        example: true,
        description: "Whether the brief is active and visible to users",
      },
      files: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            filename: { type: "string" },
            size: { type: "integer" },
            type: { type: "string" },
            url: { type: "string", format: "uri" },
            hash: { type: "string" },
          },
        },
        example: [
          {
            id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
            filename: "logo_design_brief.pdf",
            size: 1024000,
            type: "application/pdf",
            url: "https://s3.amazonaws.com/bucket/briefs/logo_design_brief.pdf",
            hash: "abc123def456",
          },
        ],
      },
      tags: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            description: { type: "string" },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
          },
        },
        example: [
          {
            id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
            name: "logo",
            description: "Logo design projects",
            created_at: "2025-08-26T19:10:04.433Z",
            updated_at: "2025-08-26T19:10:04.433Z",
          },
        ],
      },
      created_at: {
        type: "string",
        format: "date-time",
        example: "2024-01-01T00:00:00Z",
      },
      updated_at: {
        type: "string",
        format: "date-time",
        example: "2024-01-15T10:30:00Z",
      },
    },
  },

  // Brief with submissions info
  briefWithSubmissions: {
    allOf: [
      { $ref: "#/components/schemas/brief" },
      {
        type: "object",
        properties: {
          submissions: {
            type: "array",
            items: { $ref: "#/components/schemas/submission" },
          },
        },
      },
    ],
  },
};

// Submission response schemas
const submissionResponses = {
  // Submission object
  submission: {
    type: "object",
    properties: {
      id: {
        type: "string",
        format: "uuid",
        example: "123e4567-e89b-12d3-a456-426614174000",
      },
      briefId: {
        type: "string",
        format: "uuid",
        example: "123e4567-e89b-12d3-a456-426614174001",
      },
      creativeId: {
        type: "string",
        format: "uuid",
        example: "123e4567-e89b-12d3-a456-426614174002",
      },
      title: {
        type: "string",
        example: "Modern Tech Logo Design",
      },
      description: {
        type: "string",
        example: "A clean, modern logo design that represents innovation...",
      },
      concept: {
        type: "string",
        example: "The concept focuses on geometric shapes and clean lines...",
      },
      files: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            filename: { type: "string" },
            size: { type: "number" },
            type: { type: "string" },
            url: { type: "string", format: "uri" },
            hash: { type: "string" },
          },
        },
        example: [
          {
            id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
            filename: "logo.png",
            size: 1024000,
            type: "image/png",
            url: "https://example.com/logo.png",
            hash: "abc123def456",
          },
        ],
      },
      thumbnail: {
        type: "string",
        format: "uri",
        example: "https://example.com/thumbnail.jpg",
      },
      status: {
        type: "string",
        enum: [
          "draft",
          "submitted",
          "under_review",
          "shortlisted",
          "selected",
          "rejected",
          "withdrawn",
        ],
        example: "submitted",
      },
      submissionDate: {
        type: "string",
        format: "date-time",
        example: "2024-01-15T10:30:00Z",
      },
      rating: {
        type: "integer",
        minimum: 1,
        maximum: 5,
        example: 4,
      },
      isFinalist: {
        type: "boolean",
        example: false,
      },
      isWinner: {
        type: "boolean",
        example: false,
      },
      tags: {
        type: "array",
        items: { type: "string" },
        example: ["logo", "modern", "tech"],
      },
      estimatedHours: {
        type: "integer",
        example: 20,
      },
      price: {
        type: "number",
        example: 1200.0,
      },
      createdAt: {
        type: "string",
        format: "date-time",
        example: "2024-01-15T10:30:00Z",
      },
      updatedAt: {
        type: "string",
        format: "date-time",
        example: "2024-01-15T10:30:00Z",
      },
    },
  },

  // Submission with brief and creative info
  submissionWithDetails: {
    allOf: [
      { $ref: "#/components/schemas/submission" },
      {
        type: "object",
        properties: {
          brief: { $ref: "#/components/schemas/brief" },
          creative: { $ref: "#/components/schemas/user" },
        },
      },
    ],
  },
};

// Portfolio response schemas
const portfolioResponses = {
  // Portfolio object
  portfolio: {
    type: "object",
    properties: {
      id: {
        type: "string",
        format: "uuid",
        example: "123e4567-e89b-12d3-a456-426614174000",
      },
      userId: {
        type: "string",
        format: "uuid",
        example: "123e4567-e89b-12d3-a456-426614174001",
        field: "user_id",
      },
      title: {
        type: "string",
        example: "Creative Design Portfolio",
      },
      description: {
        type: "string",
        example: "A showcase of my best creative work...",
      },
      likeCount: {
        type: "integer",
        example: 25,
        field: "like_count",
      },
      files: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            filename: { type: "string" },
            size: { type: "number" },
            type: { type: "string" },
            url: { type: "string", format: "uri" },
            hash: { type: "string" },
          },
        },
        example: [
          {
            id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
            filename: "portfolio.jpg",
            size: 2048000,
            type: "image/jpeg",
            url: "https://example.com/portfolio.jpg",
            hash: "abc123def456",
          },
        ],
      },
      createdAt: {
        type: "string",
        format: "date-time",
        example: "2024-01-01T00:00:00Z",
        field: "created_at",
      },
    },
  },
};

// Creative response schemas
const creativeResponses = {
  // Creative object
  creative: {
    type: "object",
    properties: {
      id: {
        type: "string",
        format: "uuid",
        example: "123e4567-e89b-12d3-a456-426614174000",
      },
      portfolioId: {
        type: "string",
        format: "uuid",
        example: "123e4567-e89b-12d3-a456-426614174002",
        field: "portfolio_id",
      },
      title: {
        type: "string",
        example: "Modern Logo Design",
      },
      description: {
        type: "string",
        example: "A clean, modern logo design concept...",
      },
      files: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            filename: { type: "string" },
            size: { type: "number" },
            type: { type: "string" },
            url: { type: "string", format: "uri" },
            hash: { type: "string" },
          },
        },
        example: [
          {
            id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
            filename: "logo.png",
            size: 1024000,
            type: "image/png",
            url: "https://example.com/logo.png",
            hash: "abc123def456",
          },
        ],
      },
      createdAt: {
        type: "string",
        format: "date-time",
        example: "2024-01-01T00:00:00Z",
        field: "created_at",
      },
    },
  },
};

// Tag response schemas
const tagResponses = {
  // Tag object
  tag: {
    type: "object",
    properties: {
      id: {
        type: "string",
        format: "uuid",
        example: "123e4567-e89b-12d3-a456-426614174000",
      },
      name: {
        type: "string",
        example: "logo_design",
      },
      description: {
        type: "string",
        example: "Logo design projects and concepts",
      },
      created_at: {
        type: "string",
        format: "date-time",
        example: "2024-01-01T00:00:00Z",
      },
      updated_at: {
        type: "string",
        format: "date-time",
        example: "2024-01-15T10:30:00Z",
      },
    },
  },
};

// Brand response schemas
const brandResponses = {
  // Brand object
  brand: {
    type: "object",
    properties: {
      id: {
        type: "string",
        format: "uuid",
        example: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      },
      name: {
        type: "string",
        example: "TechCorp",
      },
      contact_email: {
        type: "string",
        format: "email",
        example: "user@example.com",
      },
      registered_office: {
        type: "string",
        example: "123 Business Street, Tech City",
      },
      address: {
        type: "string",
        example: "456 Innovation Avenue, Startup District",
      },
      business_field: {
        type: "string",
        example: "Technology",
      },
      logo_url: {
        type: "string",
        format: "uri",
        example: "https://example.com/logo.png",
      },
      website_url: {
        type: "string",
        format: "uri",
        example: "https://techcorp.com",
      },
      created_at: {
        type: "string",
        format: "date-time",
        example: "2024-01-01T00:00:00Z",
      },
      updated_at: {
        type: "string",
        format: "date-time",
        example: "2024-01-15T10:30:00Z",
      },
    },
  },
};

// Admin response schemas
const adminResponses = {
  // Admin object
  admin: {
    type: "object",
    properties: {
      id: {
        type: "string",
        format: "uuid",
        example: "123e4567-e89b-12d3-a456-426614174000",
      },
      userId: {
        type: "string",
        format: "uuid",
        example: "123e4567-e89b-12d3-a456-426614174001",
      },
      adminLevel: {
        type: "string",
        enum: ["super_admin", "admin", "moderator"],
        example: "admin",
      },
      permissions: {
        type: "object",
        example: {
          canManageUsers: true,
          canManageContent: true,
          canViewAnalytics: false,
        },
      },
      canManageUsers: {
        type: "boolean",
        example: true,
      },
      canManageContent: {
        type: "boolean",
        example: true,
      },
      canManageBrands: {
        type: "boolean",
        example: false,
      },
      canViewAnalytics: {
        type: "boolean",
        example: false,
      },
      lastAdminAction: {
        type: "string",
        format: "date-time",
        example: "2024-01-15T10:30:00Z",
      },
      isActive: {
        type: "boolean",
        example: true,
      },
      createdAt: {
        type: "string",
        format: "date-time",
        example: "2024-01-01T00:00:00Z",
      },
      updatedAt: {
        type: "string",
        format: "date-time",
        example: "2024-01-15T10:30:00Z",
      },
    },
  },
};

// Reaction response schemas
const reactionResponses = {
  // Reaction object
  reaction: {
    type: "object",
    properties: {
      id: {
        type: "string",
        format: "uuid",
        example: "123e4567-e89b-12d3-a456-426614174000",
      },
      submissionId: {
        type: "string",
        format: "uuid",
        example: "123e4567-e89b-12d3-a456-426614174001",
      },
      userId: {
        type: "string",
        format: "uuid",
        example: "123e4567-e89b-12d3-a456-426614174002",
      },
      portfolioId: {
        type: "string",
        format: "uuid",
        example: "123e4567-e89b-12d3-a456-426614174003",
      },
      type: {
        type: "string",
        enum: ["like", "vote"],
        example: "like",
      },
      createdAt: {
        type: "string",
        format: "date-time",
        example: "2024-01-15T10:30:00Z",
      },
    },
  },
};

// Export all response schemas
module.exports = {
  commonResponses,
  userResponses,
  briefResponses,
  submissionResponses,
  portfolioResponses,
  creativeResponses,
  brandResponses,
  adminResponses,
  reactionResponses,
  tagResponses,
};
