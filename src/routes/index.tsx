import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import hero from "@/assets/hero.jpg";
import { FLAVORS, SIZES, SHOP_LINKS, orderTotal } from "@/lib/shop";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "โคตรกาก — น้ำพริกกากหมูเครื่องแน่น น้ำมันใหม่ทุกกระทะ" },
      { name: "description", content: "โคตรกาก แต่โคตรอร่อย น้ำพริกกากหมูเครื่องแน่น วัตถุดิบท้องถิ่น ทอดน้ำมันใหม่ สั่งได้ทาง TikTok Shop, Shopee และ LINE" },
      { property: "og:title", content: "โคตรกาก — น้ำพริกกากหมูเครื่องแน่น" },
      { property: "og:description", content: "เครื่องแน่น กรอบสนั่น น้ำมันใหม่ทุกกระทะ สั่งเลยทาง TikTok Shop และ Shopee" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const POINTS = [
  { icon: "🔥", title: "น้ำมันใหม่ทุกกระทะ", text: "ไม่ใช้น้ำมันซ้ำ ไร้กลิ่นหืน กรอบเบาไม่อมน้ำมัน" },
  { icon: "🧄", title: "เครื่องแน่นจุกๆ", text: "หอมแดง กระเทียมไทย พริกคั่ว จากวัตถุดิบท้องถิ่น" },
  { icon: "✅", title: "สะอาด ปลอดภัย", text: "คุมความสะอาดทุกขั้นตอน ซีลกระปุกล็อคความกรอบ" },
];

function Index() {
  const [flavor, setFlavor] = useState<string>(FLAVORS[0].id);
  const [size, setSize] = useState<string>(SIZES[1].id);
  const [qty, setQty] = useState(1);
  const f = FLAVORS.find((x) => x.id === flavor)!;
  const s = SIZES.find((x) => x.id === size)!;
  const total = orderTotal(s.price, qty);
  const lineMsg = encodeURIComponent(`สั่งโคตรกาก รส${f.name} ${s.name} x${qty} รวม ${total} บาท`);
  const lineUrl = `https://line.me/R/oaMessage/${encodeURIComponent(SHOP_LINKS.lineId)}/?${lineMsg}`;

  return (
    <main className="overflow-x-hidden">
      <header className="sticky top-0 z-20 border-b-[3px] border-foreground bg-secondary">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <span className="font-display text-2xl font-black text-primary">โคตรกาก</span>
          <a href="#order" className="pop pop-hover rounded-full bg-primary px-4 py-1.5 font-display font-semibold text-primary-foreground">สั่งเลย</a>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 md:grid-cols-2 md:py-20">
        <div>
          <span className="pop inline-block -rotate-3 rounded-full bg-secondary px-4 py-1 text-sm font-medium">น้ำพริกกากหมู สูตรแซ่บวัยรุ่น</span>
          <h1 className="mt-5 text-6xl font-black leading-[0.95] md:text-8xl">
            โคตร<span className="text-primary">กาก</span>
            <span className="mt-3 block text-3xl font-extrabold md:text-4xl">แต่โคตรอร่อย!</span>
          </h1>
          <p className="mt-5 max-w-md text-lg text-muted-foreground">เครื่องแน่น กรอบสนั่น น้ำมันใหม่ทุกกระทะ — กินกับข้าว ไข่เจียว มาม่า ก็ฟิน</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ShopButtons />
          </div>
        </div>
        <div className="relative">
          <img src={hero} alt="น้ำพริกกากหมูโคตรกาก เครื่องแน่น" width={1254} height={1254} className="pop rotate-2 rounded-3xl" />
          <div className="pop wiggle absolute -bottom-5 -left-3 rounded-2xl bg-primary px-4 py-2 font-display text-xl font-black text-primary-foreground">กรุบ! กรุบ!</div>
        </div>
      </section>

      <section className="border-y-[3px] border-foreground bg-primary py-14 text-primary-foreground">
        <div className="mx-auto grid max-w-6xl gap-5 px-4 md:grid-cols-3">
          {POINTS.map((p) => (
            <div key={p.title} className="pop rounded-2xl bg-card p-6 text-card-foreground">
              <div className="text-4xl">{p.icon}</div>
              <h3 className="mt-3 text-2xl font-extrabold">{p.title}</h3>
              <p className="mt-1 text-muted-foreground">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="order" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16">
        <h2 className="text-4xl font-black md:text-5xl">เลือกความแซ่บของคุณ</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {FLAVORS.map((x) => (
            <button key={x.id} onClick={() => setFlavor(x.id)}
              className={`pop pop-hover rounded-2xl p-5 text-left ${flavor === x.id ? "bg-secondary" : "bg-card"}`}>
              <h3 className="text-2xl font-extrabold">{x.name}</h3>
              <p className="text-sm font-medium text-primary">{x.spice}</p>
              <p className="mt-2 text-muted-foreground">{x.desc}</p>
            </button>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {SIZES.map((x) => (
            <button key={x.id} onClick={() => setSize(x.id)}
              className={`pop rounded-full px-5 py-2 font-medium ${size === x.id ? "bg-foreground text-background" : "bg-card"}`}>
              {x.name} · ฿{x.price}
            </button>
          ))}
        </div>

        <div className="pop mt-8 flex flex-col gap-5 rounded-3xl bg-card p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <button aria-label="ลดจำนวน" onClick={() => setQty((q) => Math.max(1, q - 1))} className="pop size-11 rounded-full bg-secondary text-2xl font-bold">−</button>
            <span className="w-8 text-center font-display text-3xl font-black">{qty}</span>
            <button aria-label="เพิ่มจำนวน" onClick={() => setQty((q) => q + 1)} className="pop size-11 rounded-full bg-secondary text-2xl font-bold">+</button>
            <div className="ml-2">
              <p className="text-sm text-muted-foreground">{f.name} · {s.name}</p>
              <p className="font-display text-3xl font-black text-primary">฿{total}</p>
            </div>
          </div>
          <a href={lineUrl} target="_blank" rel="noreferrer" className="pop pop-hover rounded-full bg-line px-6 py-3 text-center font-display text-lg font-semibold text-primary-foreground">สั่งผ่าน LINE</a>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">ซื้อครบ 5 กระปุก ส่งฟรี! 🛵</p>
      </section>

      <section className="border-t-[3px] border-foreground bg-secondary py-14">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h2 className="text-4xl font-black">ช้อปง่ายในแอปที่คุณใช้</h2>
          <p className="mt-2 text-muted-foreground">มีโค้ดส่วนลดและไลฟ์ขายทุกสัปดาห์</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4"><ShopButtons big /></div>
        </div>
      </section>

      <footer className="bg-foreground py-6 text-center text-sm text-background">© โคตรกาก · LINE {SHOP_LINKS.lineId}</footer>
    </main>
  );
}

function ShopButtons({ big = false }: { big?: boolean }) {
  const pad = big ? "px-8 py-4 text-xl" : "px-6 py-3 text-lg";
  return (
    <>
      <a href={SHOP_LINKS.tiktok} target="_blank" rel="noreferrer" className={`pop pop-hover rounded-full bg-tiktok font-display font-semibold text-background ${pad}`}>TikTok Shop</a>
      <a href={SHOP_LINKS.shopee} target="_blank" rel="noreferrer" className={`pop pop-hover rounded-full bg-shopee font-display font-semibold text-primary-foreground ${pad}`}>Shopee</a>
    </>
  );
}
