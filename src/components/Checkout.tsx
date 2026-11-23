import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { PAYMENT_METHODS, orderInputSchema, priceOrder, type CartLine } from "@/lib/orders";
import { placeOrder, type PlaceOrderResult } from "@/lib/orders.functions";

type Props = {
  lines: CartLine[];
  onRemove: (index: number) => void;
  onPlaced: () => void;
};

const field = "pop w-full rounded-2xl bg-background px-4 py-3 text-base outline-none focus:ring-2 focus:ring-ring";

export function Checkout({ lines, onRemove, onPlaced }: Props) {
  const submit = useServerFn(placeOrder);
  const [form, setForm] = useState({ name: "", phone: "", address: "", note: "", payment: "cod" as "cod" | "transfer", website: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<Extract<PlaceOrderResult, { ok: true }> | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const priced = priceOrder(lines);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFailed(null);
    const input = { ...form, lines };
    const parsed = orderInputSchema.safeParse(input);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        errs[key] ??= issue.message.startsWith("Invalid") || issue.message.startsWith("String") ? "ข้อมูลไม่ถูกต้อง" : issue.message;
      }
      setErrors(errs);
      return;
    }
    setErrors({});
    setSending(true);
    try {
      const res = await submit({ data: input });
      if (res.ok) {
        setDone(res);
        onPlaced();
        setForm((f) => ({ ...f, note: "" }));
      } else setFailed(res.error);
    } catch {
      setFailed("ส่งออเดอร์ไม่สำเร็จ ลองใหม่อีกครั้งนะ");
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <div id="checkout" className="pop mt-8 scroll-mt-20 rounded-3xl bg-secondary p-8 text-center" role="status">
        <div className="text-6xl">🎉</div>
        <h3 className="mt-3 text-3xl font-black">ได้รับออเดอร์ #{done.orderNo} แล้ว!</h3>
        <p className="mt-2">ยอดสินค้า ฿{done.total} {done.freeShipping ? "· ส่งฟรี!" : "· ร้านจะโทรแจ้งค่าส่งและยืนยันออเดอร์"}</p>
        <p className="mt-1 text-muted-foreground">ร้านจะติดต่อกลับทางเบอร์ที่ให้ไว้เร็วๆ นี้ ขอบคุณที่อุดหนุนโคตรกาก 🌶️</p>
        <button type="button" onClick={() => setDone(null)} className="pop pop-hover mt-6 rounded-full bg-card px-6 py-2 font-display font-semibold">สั่งเพิ่มอีก</button>
      </div>
    );
  }

  return (
    <div id="checkout" className="mt-8 grid scroll-mt-20 gap-6 lg:grid-cols-[1fr_1.2fr]">
      <div className="pop rounded-3xl bg-card p-6">
        <h3 className="text-2xl font-extrabold">ตะกร้าของคุณ 🛒</h3>
        {priced.items.length === 0 ? (
          <p className="mt-4 text-muted-foreground">ยังไม่มีสินค้า — เลือกรสและขนาดด้านบน แล้วกด "ใส่ตะกร้า"</p>
        ) : (
          <ul className="mt-4 divide-y-2 divide-dashed divide-border">
            {lines.map((l, i) => {
              const it = priceOrder([l]).items[0];
              if (!it) return null;
              return (
                <li key={`${l.flavorId}-${l.sizeId}-${i}`} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <p className="font-display font-bold">รส{it.flavorName}</p>
                    <p className="text-sm text-muted-foreground">{it.sizeName} × {it.qty}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-display font-bold">฿{it.subtotal}</span>
                    <button type="button" aria-label={`ลบรส${it.flavorName} ${it.sizeName}`} onClick={() => onRemove(i)} className="rounded-full px-2 text-xl text-muted-foreground hover:text-primary">×</button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <div className="mt-4 flex items-end justify-between border-t-[3px] border-foreground pt-4">
          <div>
            <p className="text-sm text-muted-foreground">ยอดสินค้า ({priced.itemCount} ชิ้น)</p>
            <p className="text-sm font-medium">{priced.freeShipping ? "ส่งฟรี! 🛵" : "ค่าส่งร้านแจ้งให้ทราบ · ครบ 5 ชิ้นส่งฟรี"}</p>
          </div>
          <p className="font-display text-3xl font-black text-primary">฿{priced.total}</p>
        </div>
        {errors["lines"] && <p className="mt-2 text-sm font-medium text-destructive">{errors["lines"]}</p>}
      </div>

      <form onSubmit={onSubmit} noValidate className="pop space-y-4 rounded-3xl bg-card p-6">
        <h3 className="text-2xl font-extrabold">ข้อมูลจัดส่ง</h3>
        <div>
          <label htmlFor="co-name" className="font-medium">ชื่อผู้รับ</label>
          <input id="co-name" autoComplete="name" value={form.name} onChange={set("name")} className={`${field} mt-1`} />
          {errors["name"] && <p className="mt-1 text-sm text-destructive">{errors["name"]}</p>}
        </div>
        <div>
          <label htmlFor="co-phone" className="font-medium">เบอร์โทร</label>
          <input id="co-phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="08x-xxx-xxxx" value={form.phone} onChange={set("phone")} className={`${field} mt-1`} />
          {errors["phone"] && <p className="mt-1 text-sm text-destructive">{errors["phone"]}</p>}
        </div>
        <div>
          <label htmlFor="co-address" className="font-medium">ที่อยู่จัดส่ง</label>
          <textarea id="co-address" autoComplete="street-address" rows={3} value={form.address} onChange={set("address")} className={`${field} mt-1`} />
          {errors["address"] && <p className="mt-1 text-sm text-destructive">{errors["address"]}</p>}
        </div>
        <fieldset>
          <legend className="font-medium">ชำระเงิน</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {(Object.keys(PAYMENT_METHODS) as (keyof typeof PAYMENT_METHODS)[]).map((k) => (
              <label key={k} className={`pop cursor-pointer rounded-full px-4 py-2 text-sm font-medium ${form.payment === k ? "bg-foreground text-background" : "bg-background"}`}>
                <input type="radio" name="payment" value={k} checked={form.payment === k} onChange={() => setForm((f) => ({ ...f, payment: k }))} className="sr-only" />
                {PAYMENT_METHODS[k]}
              </label>
            ))}
          </div>
        </fieldset>
        <div>
          <label htmlFor="co-note" className="font-medium">หมายเหตุ <span className="text-sm font-normal text-muted-foreground">(ไม่บังคับ)</span></label>
          <input id="co-note" value={form.note} onChange={set("note")} placeholder="เช่น ฝากไว้ที่ป้อมยาม" className={`${field} mt-1`} />
        </div>
        <input tabIndex={-1} autoComplete="off" aria-hidden="true" value={form.website} onChange={set("website")} className="hidden" name="website" />
        {failed && <p className="rounded-2xl bg-destructive/10 p-3 text-sm font-medium text-destructive">{failed}</p>}
        <button type="submit" disabled={sending} className="pop pop-hover w-full rounded-full bg-primary px-6 py-3 font-display text-lg font-semibold text-primary-foreground disabled:opacity-70">
          {sending ? "กำลังส่งออเดอร์..." : `ยืนยันสั่งซื้อ ฿${priced.total}`}
        </button>
      </form>
    </div>
  );
}
