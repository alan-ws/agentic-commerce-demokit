export const brand = {
  key: "diageo",
  name: "Diageo",
  tagline: "Celebrating Life, Every Day, Everywhere",
  logo: "/logo.svg",
  theme: {
    primary: "#171717",
    secondary: "#F5F5F5",
    background: "#FFFFFF",
    foreground: "#1A1A1A",
    muted: "#F5F5F5",
  },
  agent: {
    name: "Diageo Discovery",
    avatar: "/agent-avatar.svg",
    toneOfVoice:
      "Warm, knowledgeable, and sophisticated. Like a trusted bartender who knows their craft.",
    greeting:
      "Welcome to Diageo Discovery. I can help you find the perfect spirit for any occasion. What are you looking for today?",
  },
  policyUrls: {
    privacy: "https://www.diageo.com/privacy-policy",
    terms: "https://www.diageo.com/terms-of-use",
    refunds: "",
    shipping: "",
  },
  mcpServerName: "Diageo UCP Commerce",
} as const;
