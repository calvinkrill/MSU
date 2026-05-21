export default {
  name: "FreedomPost",
  type: "object",
  properties: {
    alias: {
      type: "string",
      description: "Anonymous alias for the poster",
    },
    content: {
      type: "string",
      description: "Confession/post content",
    },
    campus: {
      type: "string",
      description: "Campus this post belongs to",
    },
    image_url: {
      type: "string",
      description: "Optional image URL",
    },
    likes: {
      type: "number",
      default: 0,
      description: "Number of likes",
    },
    liked_by: {
      type: "array",
      items: {
        type: "string",
      },
      description: "Emails of users who liked",
    },
    reports: {
      type: "number",
      default: 0,
      description: "Number of reports",
    },
  },
  required: ["content"],
} as const;
