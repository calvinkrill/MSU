export default {
  name: "Notification",
  type: "object",
  properties: {
    recipient_email: {
      type: "string",
      description: "Who receives this notification",
    },
    type: {
      type: "string",
      enum: ["message", "freedom_post", "lost_found", "announcement"],
      description: "Notification type",
    },
    title: {
      type: "string",
    },
    body: {
      type: "string",
    },
    link_page: {
      type: "string",
      description: "Page to navigate to",
    },
    is_read: {
      type: "boolean",
      default: false,
    },
    campus: {
      type: "string",
      description: "Campus context if relevant",
    },
  },
  required: ["recipient_email", "type", "title", "body"],
} as const;
