export default {
  name: "Group",
  type: "object",
  properties: {
    name: {
      type: "string",
      description: "Group name",
    },
    description: {
      type: "string",
      description: "Group description",
    },
    campus: {
      type: "string",
      description: "Associated campus",
    },
    logo_url: {
      type: "string",
      description: "Group logo/image URL",
    },
    members: {
      type: "array",
      items: {
        type: "string",
      },
      description: "List of member emails",
    },
  },
  required: ["name"],
} as const;
