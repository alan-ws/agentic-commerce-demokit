export const wizardSteps = [
  {
    id: "occasion",
    prompt: "What's the occasion?",
    description: "Help us find the perfect spirit for your moment",
    options: [
      { value: "gifting", label: "Gifting", icon: "Gift", description: "A special present for someone" },
      { value: "celebration", label: "Celebration", icon: "PartyPopper", description: "Marking a milestone or event" },
      { value: "casual-drink", label: "Casual Drink", icon: "Wine", description: "Relaxing at home or with friends" },
      { value: "cocktails", label: "Cocktails", icon: "GlassWater", description: "Mixing something creative" },
      { value: "dinner-pairing", label: "Dinner Pairing", icon: "UtensilsCrossed", description: "Complementing a meal" },
    ],
  },
  {
    id: "taste",
    prompt: "What flavors do you enjoy?",
    description: "Select the taste profile that appeals to you most",
    options: [
      { value: "smoky", label: "Smoky", icon: "Flame", description: "Rich peat and campfire warmth" },
      { value: "sweet", label: "Sweet", icon: "Candy", description: "Honey, caramel, and toffee" },
      { value: "spicy", label: "Spicy", icon: "FlameKindling", description: "Pepper, cinnamon, and rye bite" },
      { value: "fruity", label: "Fruity", icon: "Cherry", description: "Orchard fruits and citrus" },
      { value: "smooth", label: "Smooth", icon: "Droplets", description: "Silky and easy-drinking" },
      { value: "bold", label: "Bold", icon: "Zap", description: "Full-bodied and intense" },
    ],
  },
  {
    id: "budget",
    prompt: "What's your budget range?",
    description: "We have options at every price point",
    options: [
      { value: "under-30", label: "Under £30", icon: "Coins", description: "Great quality, great value" },
      { value: "30-50", label: "£30 – £50", icon: "Banknote", description: "Premium everyday spirits" },
      { value: "50-100", label: "£50 – £100", icon: "Gem", description: "Special occasion worthy" },
      { value: "100-plus", label: "£100+", icon: "Crown", description: "The finest and rarest" },
      { value: "no-limit", label: "No Limit", icon: "Sparkles", description: "Show me the best" },
    ],
  },
  {
    id: "market",
    prompt: "Where are you shopping?",
    description: "We'll show prices and availability for your region",
    options: [
      { value: "GB", label: "United Kingdom", icon: "MapPin", description: "Prices in GBP (£)" },
      { value: "US", label: "United States", icon: "MapPin", description: "Prices in USD ($)" },
      { value: "DE", label: "Germany", icon: "MapPin", description: "Prices in EUR (€)" },
      { value: "FR", label: "France", icon: "MapPin", description: "Prices in EUR (€)" },
    ],
  },
] as const;

export type WizardStep = (typeof wizardSteps)[number];
export type WizardStepId = WizardStep["id"];

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
