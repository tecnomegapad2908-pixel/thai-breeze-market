// Shared (client-safe) options and validation for the AI flavor recommender.
import { z } from "zod";
import { FLAVORS, SIZES } from "@/lib/shop";

export const SPICE_LEVELS = [
  { level: 1, label: "ไม่ค่อยกินเผ็ด", emoji: "🌶️" },
  { level: 2, label: "เผ็ดนิดๆ", emoji: "🌶️🌶️" },
  { level: 3, label: "เผ็ดกลาง", emoji: "🌶️🌶️🌶️" },
  { level: 4, label: "เผ็ดมาก", emoji: "🌶️🌶️🌶️🌶️" },
  { level: 5, label: "พ่นไฟได้!", emoji: "🔥🔥🔥🔥🔥" },
] as const;

export const TASTES = ["เปรี้ยวจี๊ด", "เค็มกลมกล่อม", "หวานนิดๆ", "หอมกระเทียมเจียว", "หอมสมุนไพร", "เน้นกากกรอบๆ"] as const;
export const EAT_WITH = ["ข้าวสวยร้อนๆ", "ข้าวเหนียว", "มาม่า/เส้น", "ไข่เจียว", "กินเล่นเป็นสแน็ก", "ซื้อเป็นของฝาก"] as const;

export const recommendInputSchema = z.object({
  spice: z.number().int().min(1).max(5),
  tastes: z.array(z.enum(TASTES)).max(TASTES.length),
  eatWith: z.array(z.enum(EAT_WITH)).max(EAT_WITH.length),
  note: z.string().trim().max(200),
});
export type RecommendInput = z.infer<typeof recommendInputSchema>;

const FLAVOR_IDS = FLAVORS.map((f) => f.id) as [string, ...string[]];
const SIZE_IDS = SIZES.map((s) => s.id) as [string, ...string[]];

// Strict-compatible structured output: object root, every field required.
export const recommendationSchema = z.object({
  flavorId: z.enum(FLAVOR_IDS),
  sizeId: z.enum(SIZE_IDS),
  headline: z.string(),
  reasons: z.array(z.string()),
  pairing: z.string(),
  alsoTryId: z.enum(FLAVOR_IDS).nullable(),
});
export type Recommendation = z.infer<typeof recommendationSchema>;

export type RecommendResult = { ok: true; rec: Recommendation } | { ok: false; error: string };
