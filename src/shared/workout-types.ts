import z from "zod";

export const WorkoutProfileSchema = z.object({
  id: z.number(),
  user_id: z.string().nullable(),
  experience_level: z.enum(['Iniciante', 'Intermediário', 'Avançado']),
  primary_goal: z.enum(['Hipertrofia', 'Força', 'Resistência', 'Perda de Peso', 'Condicionamento Geral']),
  training_days: z.number().min(1).max(7),
  created_at: z.string(),
  updated_at: z.string(),
});

export const WorkoutPlanSchema = z.object({
  id: z.number(),
  profile_id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const WorkoutPlanExerciseSchema = z.object({
  id: z.number(),
  plan_id: z.number(),
  exercise_id: z.number(),
  day_number: z.number(),
  sets: z.number(),
  reps: z.string(),
  rest_seconds: z.number().nullable(),
  order_index: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type WorkoutProfile = z.infer<typeof WorkoutProfileSchema>;
export type WorkoutPlan = z.infer<typeof WorkoutPlanSchema>;
export type WorkoutPlanExercise = z.infer<typeof WorkoutPlanExerciseSchema>;

export interface WorkoutPlanWithExercises extends WorkoutPlan {
  days: {
    day_number: number;
    exercises: Array<WorkoutPlanExercise & { exercise: any }>;
  }[];
}
