import { z } from 'zod';

const carCreateValidationSchema = z.object({
  body: z.object({
    name: z.string(),
    description: z.string(),
    color: z.string(),
    isElectric: z.boolean(),
    features: z.array(z.string()),
    pricePerHour: z.number(),
    status: z.enum(['available', 'unavailable']).optional(),
    isDeleted: z.boolean().optional(),
  }),
});

const carUpdateValidationSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    color: z.string().optional(),
    isElectric: z.boolean().optional(),
    features: z.array(z.string()).optional(),
    pricePerHour: z.number().optional(),
    status: z.enum(['available', 'unavailable']).optional(),
    isDeleted: z.boolean().optional(),
  }),
});

export default {
  carCreateValidationSchema,
  carUpdateValidationSchema,
};
