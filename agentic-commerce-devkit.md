## Overview

The Agentic Commerce DevKit is a **Next.js starter kit on Vercel** that lets any field engineer clone a repo, swap in a customer's brand and product data, and have a working, deployable POC running within a couple of hours. It is not a template — it is a **production-grade reference architecture** that sells the concept by letting prospects *feel* it.

The kit demonstrates how a single commerce backend can power **three deployment surfaces** — an embeddable widget, a standalone agentic app, and an agent API — using the same product catalogue, routing logic, and compliance rules.

---

## Goals

- [ ]  Deliver a clickable prototype of **Use Case 1: Guided Product Discovery**
- [ ]  Prove the Vercel platform story end-to-end (Next.js, AI SDK, Edge Middleware)
- [ ]  Ship a kit that is re-skinnable for any vertical — spirits, beauty, consumer electronics
- [ ]  Demonstrate the progression from embedded widget → standalone app → agent-as-a-service

---

## Architecture

### Stack (bottom to top)

**1. Commerce API Layer (foundation)**

Well-scoped REST API routes exposing core commerce primitives:

- Product catalogue — search, filter, detail
- Availability & pricing — by market, by channel
- Routing logic — D2C vs. retailer, with rules per locale
- Booking & reservation — for Brand Homes and experiences
- Compliance rules — age-gating, market restrictions, content suppression

**2. UCP — Standard Interface**

Wrap the Commerce API in **UCP** so any compliant agent platform can discover and call it without custom integration. This makes the catalogue *browsable and transactable* by ChatGPT, Gemini, Google Merchant Center, or any agent that speaks UCP.

**3. MCP — Extension Point**

For richer, multi-step interactions — occasion planning, itinerary building, conversational discovery — expose **MCP tools** on top of the same underlying APIs. MCP enables agents to chain actions (search → recommend → check availability → route to checkout).

**4. Surfaces**

| **Surface** | **Protocol** | **Example** |
| --- | --- | --- |
| Own storefront (embedded agent) | Direct API or MCP | Chat widget on [diageo.com](http://diageo.com) |
| Standalone agentic app | MCP | "Diageo Cocktail Planner" deployed on Vercel |
| GPT ChatApps / plugins | UCP | User asks ChatGPT to plan a whisky tasting |
| Google Merchant Center | UCP / structured feeds | Products discoverable via Google Shopping's agent layer |
| Third-party AI assistants | UCP + optional MCP | Alexa, Siri, or any future agent |

> **Key insight:** Build the APIs once, expose them twice (UCP for broad discovery, MCP for deep interaction). Every surface — first-party or third-party — is just a consumer.
> 

---

## Swappable Config Layer

Everything a field engineer touches to re-skin the kit for a new prospect:

| Config | What it controls | Format |
| --- | --- | --- |
| **Brand identity** | Logo, colours, tone of voice for the agent | Single config file or env vars |
| **Product catalogue** | 20–30 products with name, category, price, image, channels | JSON file or CMS-backed data layer |
| **Routing rules** | Which products are D2C vs. retailer, per market | JSON rules file |
| **Compliance rules** | Age-gating threshold, restricted markets, suppressed features per locale | JSON rules file |
| **Conversation flow** | Discovery questions the agent asks (occasion, taste, budget, etc.) | Configurable prompt config |
| **UI component catalogue** | `ProductCard`, `RecipeCard`, `BookingSlot`, `ComparisonGrid`, etc. | Zod-typed React components via `json-render` |

---

## Fixed Platform Layer

The parts that stay the same across every deployment:

- **AI SDK conversational engine** — streaming, tool-calling, structured output
- **Edge Middleware** — locale detection enforced at the infrastructure level
- **UCP** - compliance enforced (age-gating)
- **Routing logic pattern** — architecture for deciding where to send the user post-recommendation
- **UI shell** — polished, minimal chat + product card interface
- **`json-render` runtime** — Vercel Labs' Generative UI framework for streaming rich, schema-constrained UI

---

## Generative UI via `json-render`

The agent does not return plain text. It generates **rich, contextual UI on the fly** using `json-render`, which constrains AI output to a catalogue of allowed React components (Zod-typed, safe by design).

| **Scenario** | **Text response** | **json-render response** |
| --- | --- | --- |
| Product recommendation | "Try Johnnie Walker Black Label, £35" | Product card with image, price, tasting notes, and "Add to cart" button wired to routing logic |
| Cocktail planning | A bulleted list of recipes | Interactive recipe cards with ingredient quantities, serving size adjuster, and "Buy ingredients" action |
| Brand Home booking | "Tours available Saturday at 2pm and 4pm" | Booking widget with time slots, capacity indicators, and "Book now" action |
| Gift finder | "Here are 3 options…" | Comparison grid with filters for price, category, and delivery options |

The component **catalogue is part of the swappable config layer**. A field engineer defines:

- **Components** — `ProductCard`, `RecipeCard`, `BookingSlot`, `ComparisonGrid` (Zod-typed props)
- **Actions** — `addToCart`, `bookTour`, `routeToRetailer` (wired to Commerce API)
- **Registry** — maps component names to React implementations

Customers swap component implementations (card designs, brand styling) without touching the AI or commerce logic.

---

## Three Deployment Models

### Layer 1 — Embeddable Widget

*5 minutes to deploy on any site.*

An AI-powered conversational layer on the customer's existing storefront. The customer's site remains the primary surface — the agent enhances it.

### Layer 2 — Standalone Agentic App

*Clone, configure, deploy as its own product.*

A purpose-built application where the agent *is* the product. Deployed at its own URL as a microsite or campaign experience.

### Layer 3 — Agent API via UCP + MCP

*Expose commerce logic as callable tools for external agents.*

The agent is packaged as a plugin, action, or skill inside someone else's agent ecosystem. Products and commerce logic become accessible to ChatGPT, Gemini, Alexa, or any agent that can call tools — with a well-known manifest describing what's available.

All three layers share the same core. The difference is the **surface**. That's the platform story: *build once, deploy to every surface where agents operate.*

---

## What Ships in the Kit

- [ ]  **Mock Commerce API** — JSON data layer structured as proper Next.js API routes
- [ ]  **UCP manifest** — makes the demo immediately discoverable by external agents
- [ ]  **MCP server** — wraps the same API routes as callable tools
- [ ]  **Embedded widget surface** — drop-in chat component
- [ ]  **Standalone app surface** — full-page agentic experience
- [ ]  **Agent API surface** — headless endpoint for third-party consumers
- [ ]  **Edge Middleware** — locale detection, age-gating, market compliance
- [ ]  **`json-render` component catalogue** — ProductCard, RecipeCard, BookingSlot, ComparisonGrid
- [ ]  **Brand config system** — single-file re-skinning for field engineers

---

## Use Case 1 Prototype: Guided Product Discovery

The initial prototype to validate the concept. A conversational agent on a single page that:

1. Enforces a basic **age gate** at the start (demonstrating the compliance layer)
2. Asks 3–4 contextual questions — occasion, taste profile, budget, market
3. Returns 2–3 **product recommendations** from a mocked catalogue
4. Shows a **routing decision** — "available on D2C" vs. "available at retailer" — based on mock availability data
5. Renders recommendations as **rich product cards** via `json-render`

---

## Why This Architecture Wins

Vercel's value proposition is not just hosting a storefront — it is hosting the **agent infrastructure**: the APIs, the edge compliance layer, the MCP server, the UCP endpoints — all deployed, scaled, and kept fast on one platform.

When a field engineer demos this kit, they are not showing a chatbot. They are showing a prospect how their products become accessible to the **entire agentic internet**. That is the story that wins the *platform* deal, not the feature deal.