import { createServerFn } from "@tanstack/react-start";
import { orderInputSchema, priceOrder } from "@/lib/orders";

export type PlaceOrderResult =
  | { ok: true; orderNo: number; total: number; freeShipping: boolean }
  | { ok: false; error: string };

// Public on purpose: shoppers order without an account. Prices are computed here, never trusted from the browser.
export const placeOrder = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => orderInputSchema.parse(input))
  .handler(async ({ data }): Promise<PlaceOrderResult> => {
    if (data.website) return { ok: false, error: "ส่งออเดอร์ไม่สำเร็จ" };
    const priced = priceOrder(data.lines);
    if (priced.items.length === 0) return { ok: false, error: "ตะกร้ายังว่างอยู่" };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("orders")
      .insert({
        customer_name: data.name,
        phone: data.phone,
        address: data.address,
        note: data.note,
        payment_method: data.payment,
        items: priced.items,
        item_count: priced.itemCount,
        total: priced.total,
      })
      .select("order_no")
      .single();
    if (error || !row) {
      console.error("placeOrder insert failed", error);
      return { ok: false, error: "ส่งออเดอร์ไม่สำเร็จ ลองใหม่อีกครั้งนะ" };
    }
    return { ok: true, orderNo: row.order_no, total: priced.total, freeShipping: priced.freeShipping };
  });
