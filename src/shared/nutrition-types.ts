import z from "zod";

export const NutritionProfileSchema = z.object({
  id: z.number(),
  user_id: z.string().nullable(),
  age: z.number(),
  gender: z.enum(['Masculino', 'Feminino']),
  weight_kg: z.number(),
  height_cm: z.number(),
  activity_level: z.enum(['Sedentário', 'Leve', 'Moderado', 'Intenso', 'Muito Intenso']),
  goal: z.enum(['Perder Peso', 'Manter Peso', 'Ganhar Peso']),
  tmb: z.number(),
  ndc: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const MealLogSchema = z.object({
  id: z.number(),
  profile_id: z.number(),
  meal_type: z.enum(['Café da Manhã', 'Lanche da Manhã', 'Almoço', 'Lanche da Tarde', 'Jantar', 'Ceia']),
  logged_at: z.string(),
  total_calories: z.number(),
  total_protein: z.number(),
  total_carbs: z.number(),
  total_fat: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const FoodItemSchema = z.object({
  id: z.number(),
  meal_log_id: z.number(),
  name: z.string(),
  portion_size: z.string(),
  calories: z.number(),
  protein: z.number(),
  carbs: z.number(),
  fat: z.number(),
  image_key: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const DietPlanSchema = z.object({
  id: z.number(),
  profile_id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  daily_calories: z.number(),
  daily_protein: z.number(),
  daily_carbs: z.number(),
  daily_fat: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const DietPlanMealSchema = z.object({
  id: z.number(),
  diet_plan_id: z.number(),
  meal_type: z.string(),
  meal_name: z.string(),
  foods: z.string(),
  calories: z.number(),
  protein: z.number(),
  carbs: z.number(),
  fat: z.number(),
  order_index: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type NutritionProfile = z.infer<typeof NutritionProfileSchema>;
export type MealLog = z.infer<typeof MealLogSchema>;
export type FoodItem = z.infer<typeof FoodItemSchema>;
export type DietPlan = z.infer<typeof DietPlanSchema>;
export type DietPlanMeal = z.infer<typeof DietPlanMealSchema>;
