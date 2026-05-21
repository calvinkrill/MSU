export default {
  name: "Feedback",
  type: "object",
  properties: {
    content: {
      type: "string",
      description: "Feedback content",
    },
    sender_name: {
      type: "string",
      description: "Name of the feedback sender",
    },
    sender_email: {
      type: "string",
      description: "Email of the sender",
    },
    status: {
      type: "string",
      enum: ["pending", "reviewed", "resolved"],
      default: "pending",
      description: "Status of the feedback",
    },
  },
  required: ["content"],
} as const;
