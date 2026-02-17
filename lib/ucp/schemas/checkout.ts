/**
 * UCP Checkout Zod Schemas — spec version 2026-01-11
 * Validates request bodies only (responses are built by handler).
 */

import { z } from "zod/v4";

export const CreateCheckoutRequestSchema = z.object({
  line_items: z
    .array(
      z.object({
        item: z.object({ id: z.string() }),
        quantity: z.int().min(1),
      })
    )
    .min(1),
  buyer: z
    .object({
      first_name: z.string().optional(),
      last_name: z.string().optional(),
      email: z.email().optional(),
      phone_number: z.string().optional(),
      consent: z
        .object({
          analytics: z.boolean().optional(),
          preferences: z.boolean().optional(),
          marketing: z.boolean().optional(),
          sale_of_data: z.boolean().optional(),
        })
        .optional(),
    })
    .optional(),
  context: z
    .object({
      geo: z
        .object({
          country: z.string().optional(),
          region: z.string().optional(),
        })
        .optional(),
      locale: z.string().optional(),
    })
    .optional(),
});

export const UpdateCheckoutRequestSchema = z.object({
  line_items: z
    .array(
      z.object({
        id: z.string().optional(),
        item: z.object({ id: z.string() }),
        quantity: z.int().min(1),
      })
    )
    .optional(),
  buyer: z
    .object({
      first_name: z.string().optional(),
      last_name: z.string().optional(),
      email: z.email().optional(),
      phone_number: z.string().optional(),
      consent: z
        .object({
          analytics: z.boolean().optional(),
          preferences: z.boolean().optional(),
          marketing: z.boolean().optional(),
          sale_of_data: z.boolean().optional(),
        })
        .optional(),
    })
    .optional(),
  context: z
    .object({
      geo: z
        .object({
          country: z.string().optional(),
          region: z.string().optional(),
        })
        .optional(),
      locale: z.string().optional(),
    })
    .optional(),
});

export const CompleteCheckoutRequestSchema = z.object({
  payment: z
    .object({
      instruments: z
        .array(
          z.object({
            id: z.string(),
            handler_id: z.string(),
            type: z.enum(["card", "wallet", "mandate"]),
            selected: z.boolean().optional(),
            credential: z
              .object({
                type: z.string(),
                token: z.string(),
              })
              .optional(),
          })
        )
        .optional(),
    })
    .optional(),
  risk_signals: z.record(z.string(), z.unknown()).optional(),
});
