import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const shiftSchema = z.object({
  date: z.string(),
  hoursWorked: z.coerce.number().min(0),
  conversations: z.coerce.number().int().min(0),
  salesCount: z.coerce.number().int().min(0),
  totalCost: z
    .union([z.coerce.number().min(0), z.literal(''), z.null(), z.undefined()])
    .transform((val) => (val === '' || val === null || typeof val === 'undefined' ? null : val))
});

export const coachingNoteSchema = z.object({
  date: z.string(),
  stage: z.enum(['OPENING', 'QUALIFICATION', 'PITCH', 'OBJECTIONS', 'CLOSE', 'FOLLOW_UP']),
  reason: z.string().min(2),
  details: z.string().min(5)
});

export const sellerSchema = z.object({
  fullName: z.string().min(2),
  active: z.coerce.boolean(),
  companyId: z.string().min(1)
});
