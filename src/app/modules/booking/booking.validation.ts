import { z } from 'zod';

const bookingValidationSchema = z.object({
  body: z.object({
    carId: z.string(),
    date: z.string(),
    startTime: z.string(),
    endTime: z.string().optional(),
    totalCost: z.number().optional(),
  }),
});
const returnValidationSchema = z.object({
  body: z.object({
    bookingId: z.string(),
    endTime: z.string(),
  }),
});

export const bookingCar = {
  bookingValidationSchema,
  returnValidationSchema,
};
