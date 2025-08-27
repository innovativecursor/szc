/**
 * API Parameter Schemas for Swagger Documentation
 * These schemas define the structure of request parameters and responses
 */

// Common parameter schemas
const commonParams = {
  // Pagination parameters
  pagination: {
    page: {
      type: "integer",
      minimum: 1,
      default: 1,
      description: "Page number for pagination",
    },
    limit: {
      type: "integer",
      minimum: 1,
      maximum: 100,
      default: 20,
      description: "Number of items per page",
    },
  },

  // Sorting parameters
  sorting: {
    sortBy: {
      type: "string",
      enum: ["createdAt", "updatedAt", "name", "title", "rating", "price"],
      default: "createdAt",
      description: "Field to sort by",
    },
    sortOrder: {
      type: "string",
      enum: ["asc", "desc"],
      default: "desc",
      description: "Sort order",
    },
  },

  // Search parameters
  search: {
    query: {
      type: "string",
      minLength: 1,
      maxLength: 100,
      description: "Search query string",
    },
    category: {
      type: "string",
      description: "Filter by category",
    },
    tags: {
      type: "array",
      items: { type: "string" },
      description: "Filter by tags",
    },
  },

  // Date range parameters
  dateRange: {
    startDate: {
      type: "string",
      format: "date",
      description: "Start date for filtering (YYYY-MM-DD)",
    },
    endDate: {
      type: "string",
      format: "date",
      description: "End date for filtering (YYYY-MM-DD)",
    },
  },
};

// User-related parameter schemas
const userParams = {
  // User registration
  userRegistration: {
    username: {
      type: "string",
      minLength: 3,
      maxLength: 50,
      pattern: "^[a-zA-Z0-9_]+$",
      description: "Unique username (alphanumeric and underscores only)",
    },
    email: {
      type: "string",
      format: "email",
      description: "Valid email address",
    },
    password: {
      type: "string",
      minLength: 8,
      maxLength: 128,
      description: "Password (minimum 8 characters)",
    },
    displayName: {
      type: "string",
      maxLength: 100,
      description: "Display name",
    },
    bio: {
      type: "string",
      maxLength: 1000,
      description: "User biography",
    },
    profileImageURL: {
      type: "string",
      format: "uri",
      description: "Profile image URL",
    },
    portfolioURL: {
      type: "string",
      format: "uri",
      description: "Portfolio URL",
    },
    phoneNumber: {
      type: "string",
      maxLength: 20,
      description: "Phone number",
    },
    alternateEmail: {
      type: "string",
      format: "email",
      description: "Alternate email address",
    },
    socialLinks: {
      type: "object",
      description: "Social media links",
    },
    roles: {
      type: "string",
      enum: ["super_admin", "admin", "user"],
      default: "user",
      description: "User roles",
    },
  },

  // User update
  userUpdate: {
    displayName: {
      type: "string",
      maxLength: 100,
      description: "Display name",
    },
    bio: {
      type: "string",
      maxLength: 1000,
      description: "User biography",
    },
    profileImageURL: {
      type: "string",
      format: "uri",
      description: "Profile image URL",
    },
    portfolioURL: {
      type: "string",
      format: "uri",
      description: "Portfolio URL",
    },
    phoneNumber: {
      type: "string",
      maxLength: 20,
      description: "Phone number",
    },
    alternateEmail: {
      type: "string",
      format: "email",
      description: "Alternate email address",
    },
    socialLinks: {
      type: "object",
      description: "Social media links",
    },
  },

  // User login
  userLogin: {
    email: {
      type: "string",
      format: "email",
      description: "User email address",
    },
    password: {
      type: "string",
      description: "User password",
    },
  },
};

// Brief-related parameter schemas
const briefParams = {
  // Brief creation
  briefCreation: {
    title: {
      type: "string",
      minLength: 5,
      maxLength: 200,
      description: "Brief title",
    },
    description: {
      type: "string",
      minLength: 10,
      maxLength: 5000,
      description: "Detailed description of the project",
    },
    isPaid: {
      type: "boolean",
      default: false,
      description: "Whether this is a paid brief",
    },
    prizeAmount: {
      type: "number",
      minimum: 0,
      description: "Prize amount in USD",
    },
    submissionDeadline: {
      type: "string",
      format: "date-time",
      description: "Submission deadline",
    },
    votingStart: {
      type: "string",
      format: "date-time",
      description: "Voting start date",
    },
    votingEnd: {
      type: "string",
      format: "date-time",
      description: "Voting end date",
    },
    winnerUserId: {
      type: "string",
      format: "uuid",
      description: "ID of the winning user",
    },
    status: {
      type: "string",
      enum: ["draft", "active", "in_progress", "completed", "cancelled"],
      default: "draft",
      description: "Brief status",
    },
    crmUserId: {
      type: "string",
      format: "uuid",
      description: "ID of the CRM user",
    },
    tags: {
      type: "array",
      items: {
        type: "object",
        required: ["id", "name"],
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          description: { type: "string" },
          userId: { type: "string", format: "uuid" },
        },
      },
      description: "Array of tag objects",
    },
  },

  // Brief update
  briefUpdate: {
    title: {
      type: "string",
      minLength: 5,
      maxLength: 200,
      description: "Brief title",
    },
    description: {
      type: "string",
      minLength: 10,
      maxLength: 5000,
      description: "Detailed description of the project",
    },
    isPaid: {
      type: "boolean",
      description: "Whether this is a paid brief",
    },
    prizeAmount: {
      type: "number",
      minimum: 0,
      description: "Prize amount in USD",
    },
    submissionDeadline: {
      type: "string",
      format: "date-time",
      description: "Submission deadline",
    },
    votingStart: {
      type: "string",
      format: "date-time",
      description: "Voting start date",
    },
    votingEnd: {
      type: "string",
      format: "date-time",
      description: "Voting end date",
    },
    winnerUserId: {
      type: "string",
      format: "uuid",
      description: "ID of the winning user",
    },
    status: {
      type: "string",
      enum: ["draft", "active", "in_progress", "completed", "cancelled"],
      description: "Brief status",
    },
    crmUserId: {
      type: "string",
      format: "uuid",
      description: "ID of the CRM user",
    },
  },

  // Brief filtering
  briefFiltering: {
    isPaid: {
      type: "boolean",
      description: "Filter by paid status",
    },
    status: {
      type: "string",
      enum: ["draft", "active", "in_progress", "completed", "cancelled"],
      description: "Filter by status",
    },
    submissionDeadline: {
      type: "string",
      format: "date",
      description: "Filter by submission deadline (YYYY-MM-DD)",
    },
    votingStart: {
      type: "string",
      format: "date",
      description: "Filter by voting start date (YYYY-MM-DD)",
    },
    votingEnd: {
      type: "string",
      format: "date",
      description: "Filter by voting end date (YYYY-MM-DD)",
    },
    crmUserId: {
      type: "string",
      format: "uuid",
      description: "Filter by CRM user ID",
    },
  },
};

// Submission-related parameter schemas
const submissionParams = {
  // Submission creation
  submissionCreation: {
    brief_id: {
      type: "string",
      format: "uuid",
      description: "ID of the brief this submission is for",
    },
    user_id: {
      type: "string",
      format: "uuid",
      description: "ID of the user submitting",
    },
    description: {
      type: "string",
      maxLength: 2000,
      description: "Submission description",
    },
    is_finalist: {
      type: "boolean",
      default: false,
      description: "Whether this submission is a finalist",
    },
    is_winner: {
      type: "boolean",
      default: false,
      description: "Whether this submission is the winner",
    },
    files: {
      type: "array",
      items: {
        type: "object",
        required: ["id", "filename", "size", "type", "url", "hash"],
        properties: {
          id: { type: "string", format: "uuid" },
          filename: { type: "string" },
          size: { type: "number", minimum: 0 },
          type: { type: "string", format: "mime-type" },
          url: { type: "string", format: "uri" },
          hash: { type: "string" },
        },
      },
      minItems: 1,
      description: "Array of file objects",
    },
    thumbnail: {
      type: "string",
      format: "uri",
      description: "Thumbnail image URL",
    },
    tags: {
      type: "array",
      items: { type: "string" },
      description: "Array of relevant tags",
    },
    estimatedHours: {
      type: "integer",
      minimum: 1,
      description: "Estimated hours to complete",
    },
    price: {
      type: "number",
      minimum: 0,
      description: "Proposed price in USD",
    },
    notes: {
      type: "string",
      maxLength: 1000,
      description: "Additional notes",
    },
  },

  // Submission update
  submissionUpdate: {
    title: {
      type: "string",
      minLength: 5,
      maxLength: 200,
      description: "Submission title",
    },
    description: {
      type: "string",
      maxLength: 2000,
      description: "Submission description",
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
      description: "Submission status",
    },
  },
};

// Portfolio-related parameter schemas
const portfolioParams = {
  // Portfolio creation
  portfolioCreation: {
    title: {
      type: "string",
      maxLength: 200,
      description: "Portfolio title",
    },
    description: {
      type: "string",
      maxLength: 2000,
      description: "Portfolio description",
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
      description: "Array of file objects",
    },
  },
};

// Creative parameter schemas
const creativeParams = {
  // Creative creation
  creativeCreation: {
    portfolioId: {
      type: "string",
      format: "uuid",
      description: "ID of the portfolio this creative belongs to",
    },
    title: {
      type: "string",
      maxLength: 200,
      description: "Creative title",
    },
    description: {
      type: "string",
      maxLength: 2000,
      description: "Creative description",
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
      description: "Array of file objects",
    },
  },
};

// Reaction parameter schemas
const reactionParams = {
  // Reaction creation
  reactionCreation: {
    submissionId: {
      type: "string",
      format: "uuid",
      description: "ID of the submission being reacted to",
    },
    userId: {
      type: "string",
      format: "uuid",
      description: "ID of the user reacting",
    },
    portfolioId: {
      type: "string",
      format: "uuid",
      description: "ID of the portfolio being reacted to",
    },
    type: {
      type: "string",
      enum: ["like", "vote"],
      description: "Type of reaction",
    },
  },
};

// Message parameter schemas
const messageParams = {
  // Message creation
  messageCreation: {
    recipientId: {
      type: "string",
      format: "uuid",
      description: "ID of the message recipient",
    },
    subject: {
      type: "string",
      maxLength: 200,
      description: "Message subject",
    },
    content: {
      type: "string",
      minLength: 1,
      maxLength: 5000,
      description: "Message content",
    },
    messageType: {
      type: "string",
      enum: ["text", "image", "file", "system", "notification"],
      default: "text",
      description: "Type of message",
    },
    attachments: {
      type: "array",
      items: {
        type: "object",
        properties: {
          url: { type: "string", format: "uri" },
          filename: { type: "string" },
          fileType: { type: "string" },
          size: { type: "number" },
        },
      },
      description: "Array of file attachments",
    },
    replyToId: {
      type: "string",
      format: "uuid",
      description: "ID of the message being replied to",
    },
  },
};

// Tag-related parameter schemas
const tagParams = {
  // Tag creation
  tagCreation: {
    name: {
      type: "string",
      minLength: 2,
      maxLength: 100,
      description: "Tag name (unique)",
    },
    description: {
      type: "string",
      maxLength: 1000,
      description: "Tag description",
    },
  },
  // Tag update
  tagUpdate: {
    description: {
      type: "string",
      maxLength: 1000,
      description: "Tag description",
    },
  },
};

// Brand-related parameter schemas
const brandParams = {
  // Brand creation
  brandCreation: {
    name: {
      type: "string",
      minLength: 2,
      maxLength: 100,
      description: "Brand name",
    },
    contact_email: {
      type: "string",
      format: "email",
      description: "Contact email address",
    },
    registered_office: {
      type: "string",
      maxLength: 200,
      description: "Registered office address",
    },
    address: {
      type: "string",
      maxLength: 500,
      description: "Business address",
    },
    business_field: {
      type: "string",
      maxLength: 100,
      description: "Field of business",
    },
    logo_url: {
      type: "string",
      format: "uri",
      description: "Logo image URL",
    },
    website_url: {
      type: "string",
      format: "uri",
      description: "Website URL",
    },
  },

  // Brand filtering
  brandFiltering: {
    business_field: {
      type: "string",
      description: "Filter by business field (case-insensitive partial match)",
    },
    brand_id: {
      type: "string",
      format: "uuid",
      description: "Filter by specific brand ID",
    },
  },
};

// Export all parameter schemas
module.exports = {
  commonParams,
  userParams,
  briefParams,
  submissionParams,
  portfolioParams,
  creativeParams,
  reactionParams,
  messageParams,
  brandParams,
  tagParams,
};
