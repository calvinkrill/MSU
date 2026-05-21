export default {
  name: "Message",
  type: "object",
  properties: {
    sender_name: {
      type: "string",
      description: "Display name of the sender",
    },
    sender_email: {
      type: "string",
      description: "Email of the sender",
    },
    content: {
      type: "string",
      description: "Message content",
    },
    room_id: {
      type: "string",
      description: "Channel or DM room identifier",
    },
    media_url: {
      type: "string",
      description: "Optional media attachment URL",
    },
    media_type: {
      type: "string",
      enum: ["image", "video", "file"],
      description: "Type of media attachment",
    },
  },
  required: ["content", "room_id"],
} as const;
