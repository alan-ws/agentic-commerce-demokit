export const brand = {
  key: "oegaid",
  name: "Oegaid",
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
    name: "Oegaid Discovery",
    avatar: "/agent-avatar.svg",
    toneOfVoice:
      "Warm, knowledgeable, and sophisticated. Like a trusted bartender who knows their craft.",
    greeting:
      "Welcome to Oegaid Discovery. I can help you find the perfect spirit for any occasion. What are you looking for today?",
  },
  policyUrls: {
    privacy: "https://www.oegaid.com/privacy-policy",
    terms: "https://www.oegaid.com/terms-of-use",
    refunds: "",
    shipping: "",
  },
  mcpServerName: "Oegaid UCP Commerce",
} as const;
