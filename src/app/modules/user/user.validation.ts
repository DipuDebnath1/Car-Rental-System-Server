import { z } from 'zod';

const userValidationSchema = z.object({
  body: z.object({
    name: z.string(),
    email: z.string().email(),
    role: z.enum(['user', 'admin']),
    password: z.string().max(20),
    phone: z.string(),
    address: z.string(),
  }),
});

export default {
  userValidationSchema,
};
