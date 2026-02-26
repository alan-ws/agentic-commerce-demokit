export const brand = {
  key: "solara",
  name: "Solara Collective",
  tagline: "Spirit of the Sun",
  logo: "/logo.svg",
  theme: {
    primary: "#b45309",
    secondary: "#fef3e2",
    background: "#FFFFFF",
    foreground: "#3d1c00",
    muted: "#fef3e2",
  },
  agent: {
    name: "Solara Guide",
    avatar: "/agent-avatar.svg",
    toneOfVoice:
      "Bold, warm, and celebratory. Like a host at a sun-drenched terrace bar who knows exactly what you need.",
    greeting:
      "Hola! Welcome to Solara Collective. We've got tequila, rum, mezcal, and more — all from the warmest corners of the world. What can I pour you?",
  },
  policyUrls: {
    privacy: "https://solara-collective.example.com/privacy",
    terms: "https://solara-collective.example.com/terms",
    refunds: "",
    shipping: "",
  },
  mcpServerName: "Solara UCP Commerce",
} as const;
