export const conversationFlow = {
  discoveryQuestions: [
    {
      id: "occasion",
      prompt: "What's the occasion?",
      options: [
        "gifting",
        "celebration",
        "casual-drink",
        "cocktails",
        "dinner-pairing",
      ],
    },
    {
      id: "taste",
      prompt: "What flavors do you enjoy?",
      options: ["smoky", "sweet", "spicy", "fruity", "smooth", "bold"],
    },
    {
      id: "budget",
      prompt: "What's your budget range?",
      options: ["under-30", "30-50", "50-100", "100-plus", "no-limit"],
    },
    {
      id: "experience",
      prompt: "How familiar are you with spirits?",
      options: ["beginner", "enthusiast", "connoisseur"],
    },
  ],
  maxRecommendations: 3,
  alwaysShowRouting: true,
} as const;

export type ConversationFlow = typeof conversationFlow;
