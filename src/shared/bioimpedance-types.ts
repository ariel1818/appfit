import z from "zod";

export const BioimpedanceRecordSchema = z.object({
  id: z.number(),
  profile_id: z.number().nullable(),
  weight_kg: z.number(),
  body_fat_percentage: z.number(),
  muscle_mass_kg: z.number(),
  water_percentage: z.number(),
  bone_mass_kg: z.number().nullable(),
  visceral_fat_level: z.number().nullable(),
  bmr: z.number().nullable(),
  metabolic_age: z.number().nullable(),
  measured_at: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type BioimpedanceRecord = z.infer<typeof BioimpedanceRecordSchema>;
