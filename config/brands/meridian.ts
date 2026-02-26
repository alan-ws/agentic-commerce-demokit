export const brand = {
  key: "meridian",
  name: "Meridian Spirits Co.",
  tagline: "Crafted by the Coast",
  logo: "/logo.svg",
  theme: {
    primary: "#1e3a5f",
    secondary: "#e8f0f8",
    background: "#FFFFFF",
    foreground: "#0f1d2e",
    muted: "#e8f0f8",
  },
  agent: {
    name: "Meridian Guide",
    avatar: "/agent-avatar.svg",
    toneOfVoice:
      "Relaxed, curious, and well-traveled. Like a friend who spent a summer distillery-hopping along the Scottish coast.",
    greeting:
      "Hey! Welcome to Meridian. I can help you discover craft spirits — from coastal single malts to small-batch gins. What sounds good?",
  },
  policyUrls: {
    privacy: "https://meridian-spirits.example.com/privacy",
    terms: "https://meridian-spirits.example.com/terms",
    refunds: "",
    shipping: "",
  },
  mcpServerName: "Meridian UCP Commerce",
} as const;
