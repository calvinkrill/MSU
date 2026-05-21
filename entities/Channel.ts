export default {
  name: "Channel",
  type: "object",
  properties: {
    name: {
      type: "string",
      description: "Channel name",
    },
    description: {
      type: "string",
      description: "Channel description",
    },
    category: {
      type: "string",
      enum: ["academics", "clubs", "events", "campus", "interests", "general"],
      default: "general",
    },
    campus: {
      type: "string",
      description: "Associated campus if campus-specific",
    },
    creator_email: {
      type: "string",
      description: "Email of channel creator",
    },
    members: {
      type: "array",
      items: {
        type: "string",
      },
      description: "Member emails",
    },
    is_private: {
      type: "boolean",
      default: false,
    },
    banned_users: {
      type: "array",
      items: {
        type: "string",
      },
      description: "Banned user emails",
    },
    pinned_message: {
      type: "string",
      description: "Pinned message or rules",
    },
  },
  required: ["name"],
} as const;
