export default {
  name: "LostFound",
  type: "object",
  properties: {
    title: {
      type: "string",
      description: "Title of the lost/found item",
    },
    description: {
      type: "string",
      description: "Detailed description",
    },
    campus: {
      type: "string",
      description: "Campus where item was lost/found",
    },
    contact: {
      type: "string",
      description: "Contact information",
    },
    image_url: {
      type: "string",
      description: "Photo of the item",
    },
    type: {
      type: "string",
      enum: ["lost", "found"],
      default: "lost",
      description: "Whether item is lost or found",
    },
    is_resolved: {
      type: "boolean",
      default: false,
      description: "Whether the item has been returned",
    },
    poster_email: {
      type: "string",
      description: "Email of the poster",
    },
  },
  required: ["title", "description"],
} as const;
