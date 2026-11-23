// Client-safe order rules: validation and pricing (server re-prices every order).
import { z } from "zod";
import { FLAVORS, SIZES } from "@/lib/shop";

export const PAYMENT_METHODS = { cod: "เก็บเงินปลายทาง", transfer: "โอนเงิน (ร้านส่งเลขบัญชีให้)" } as const;
export const ORDER_STATUSES = { new: "ใหม่", confirmed: "ยืนยันแล้ว", shipped: "ส่งแล้ว", cancelled: "ยกเลิก" } as const;
export type OrderStatus = keyof typeof ORDER_STATUSES;

export const MAX_QTY_PER_LINE = 99;

export const cartLineSchema = z.object({
  flavorId: z.enum(FLAVORS.map((f) => f.id) as [string, ...string[]]),
  sizeId: z.enum(SIZES.map((s) => s.id) as [string, ...string[]]),
  qty: z.number().int().min(1).max(MAX_QTY_PER_LINE),
});
export type CartLine = z.infer<typeof cartLineSchema>;

export function normalizePhone(raw: string) {
  return raw.replace(/[\s-]/g, "");
}

export const orderInputSchema = z.object({
  name: z.string().trim().min(1, "กรอกชื่อด้วยนะ").max(80),
  phone: z
    .string()
    .transform(normalizePhone)
    .pipe(z.string().regex(/^0\d{8,9}$/, "เบอร์โทรต้องเป็นตัวเลข 9-10 หลัก ขึ้นต้นด้วย 0")),
  address: z.string().trim().min(10, "กรอกที่อยู่จัดส่งให้ครบหน่อยนะ").max(300),
  note: z.string().trim().max(300),
  payment: z.enum(["cod", "transfer"]),
  lines: z.array(cartLineSchema).min(1, "ตะกร้ายังว่างอยู่").max(20),
  website: z.string().max(0).optional(), // honeypot: real customers leave it empty
});
export type OrderInput = z.input<typeof orderInputSchema>;

export type PricedItem = {
  flavorId: string;
  flavorName: string;
  sizeId: string;
  sizeName: string;
  qty: number;
  price: number;
  subtotal: number;
};

/** Merge duplicate lines and price them from the shop catalog (never from client input). */
export function priceOrder(lines: CartLine[]) {
  const merged = new Map<string, CartLine>();
  for (const l of lines) {
    const key = `${l.flavorId}:${l.sizeId}`;
    const prev = merged.get(key);
    merged.set(key, { ...l, qty: Math.min(MAX_QTY_PER_LINE, (prev?.qty ?? 0) + l.qty) });
  }
  const items: PricedItem[] = [];
  for (const l of merged.values()) {
    const f = FLAVORS.find((x) => x.id === l.flavorId);
    const s = SIZES.find((x) => x.id === l.sizeId);
    if (!f || !s) continue;
    items.push({ flavorId: f.id, flavorName: f.name, sizeId: s.id, sizeName: s.name, qty: l.qty, price: s.price, subtotal: s.price * l.qty });
  }
  const itemCount = items.reduce((n, i) => n + i.qty, 0);
  const total = items.reduce((n, i) => n + i.subtotal, 0);
  return { items, itemCount, total, freeShipping: itemCount >= 5 };
}
