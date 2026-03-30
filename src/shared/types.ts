import z from "zod";

export const ExerciseSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  instructions: z.string(),
  muscle_group: z.string(),
  equipment: z.string().nullable(),
  difficulty: z.string(),
  image_url: z.string().nullable(),
  video_url: z.string().nullable(),
  sport_category: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Exercise = z.infer<typeof ExerciseSchema>;
