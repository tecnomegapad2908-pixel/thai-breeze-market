import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { FLAVORS, SIZES } from "@/lib/shop";
import { EAT_WITH, SPICE_LEVELS, TASTES, type RecommendResult } from "@/lib/recommend";
import { getFlavorRecommendation } from "@/lib/recommend.functions";

type Props = { onPick: (flavorId: string, sizeId: string) => void };

function toggle<T>(list: T[], v: T) {
  return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
}

export function FlavorQuiz({ onPick }: Props) {
  const recommend = useServerFn(getFlavorRecommendation);
  const [spice, setSpice] = useState(3);
  const [tastes, setTastes] = useState<(typeof TASTES)[number][]>([]);
  const [eatWith, setEatWith] = useState<(typeof EAT_WITH)[number][]>([]);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RecommendResult | null>(null);

  async function submit() {
    setLoading(true);
    setResult(null);
    try {
      setResult(await recommend({ data: { spice, tastes, eatWith, note } }));
    } catch {
      setResult({ ok: false, error: "เชื่อมต่อไม่ได้ ลองใหม่อีกครั้งนะ" });
    } finally {
      setLoading(false);
    }
  }

  const rec = result?.ok ? result.rec : null;
  const flavor = rec ? FLAVORS.find((f) => f.id === rec.flavorId) : undefined;
  const size = rec ? SIZES.find((s) => s.id === rec.sizeId) : undefined;
  const also = rec?.alsoTryId ? FLAVORS.find((f) => f.id === rec.alsoTryId) : undefined;
  const spiceInfo = SPICE_LEVELS.find((s) => s.level === spice)!;

  return (
    <section id="quiz" className="scroll-mt-20 border-b-[3px] border-foreground bg-secondary py-16">
      <div className="mx-auto max-w-6xl px-4">
        <span className="pop inline-block -rotate-2 rounded-full bg-primary px-4 py-1 text-sm font-medium text-primary-foreground">AI ช่วยเลือก ✨</span>
        <h2 className="mt-4 text-4xl font-black md:text-5xl">ไม่รู้จะเอารสไหน? ให้น้องกากเลือกให้!</h2>
        <p className="mt-2 text-muted-foreground">บอกความเผ็ดกับรสที่ชอบ แล้วรับคำแนะนำพร้อมเหตุผลในไม่กี่วินาที</p>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="pop space-y-6 rounded-3xl bg-card p-6">
            <div>
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-display text-xl font-extrabold">1. เผ็ดได้แค่ไหน?</h3>
                <span className="font-display font-semibold text-primary">{spiceInfo.emoji} {spiceInfo.label}</span>
              </div>
              <input
                type="range" min={1} max={5} step={1} value={spice}
                onChange={(e) => setSpice(Number(e.target.value))}
                aria-label="ระดับความเผ็ด"
                className="mt-3 w-full accent-primary"
              />
              <div className="mt-1 flex justify-between text-xs text-muted-foreground"><span>ไม่เผ็ด</span><span>พ่นไฟ</span></div>
            </div>

            <div>
              <h3 className="font-display text-xl font-extrabold">2. ชอบรสแบบไหน? <span className="text-sm font-normal text-muted-foreground">(เลือกได้หลายข้อ)</span></h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {TASTES.map((t) => (
                  <button key={t} type="button" aria-pressed={tastes.includes(t)} onClick={() => setTastes((l) => toggle(l, t))}
                    className={`pop rounded-full px-4 py-1.5 text-sm font-medium ${tastes.includes(t) ? "bg-foreground text-background" : "bg-background"}`}>{t}</button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-display text-xl font-extrabold">3. กินคู่กับอะไร?</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {EAT_WITH.map((t) => (
                  <button key={t} type="button" aria-pressed={eatWith.includes(t)} onClick={() => setEatWith((l) => toggle(l, t))}
                    className={`pop rounded-full px-4 py-1.5 text-sm font-medium ${eatWith.includes(t) ? "bg-foreground text-background" : "bg-background"}`}>{t}</button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="quiz-note" className="font-display text-xl font-extrabold">อยากบอกอะไรเพิ่ม? <span className="text-sm font-normal text-muted-foreground">(ไม่บังคับ)</span></label>
              <textarea id="quiz-note" value={note} maxLength={200} onChange={(e) => setNote(e.target.value)} rows={2}
                placeholder="เช่น ซื้อฝากแม่ ไม่ชอบหวาน"
                className="pop mt-3 w-full rounded-2xl bg-background px-4 py-3 text-base outline-none focus:ring-2 focus:ring-ring" />
            </div>

            <button type="button" onClick={submit} disabled={loading}
              className="pop pop-hover w-full rounded-full bg-primary px-6 py-3 font-display text-lg font-semibold text-primary-foreground disabled:opacity-70">
              {loading ? "น้องกากกำลังชิม..." : "แนะนำรสที่ใช่ให้หน่อย!"}
            </button>
          </div>

          <div className="pop flex min-h-[320px] flex-col rounded-3xl bg-card p-6" aria-live="polite">
            {loading && (
              <div className="m-auto text-center">
                <div className="wiggle text-6xl">🌶️</div>
                <p className="mt-3 font-display text-xl font-bold">กำลังคั่วคำตอบ...</p>
              </div>
            )}
            {!loading && !result && (
              <div className="m-auto text-center text-muted-foreground">
                <div className="text-6xl">🤔</div>
                <p className="mt-3">เลือกด้านซ้าย แล้วกดปุ่มเพื่อดูรสที่เหมาะกับคุณ</p>
              </div>
            )}
            {!loading && result && !result.ok && (
              <div className="m-auto text-center">
                <div className="text-6xl">😵</div>
                <p className="mt-3 font-medium">{result.error}</p>
              </div>
            )}
            {!loading && rec && flavor && size && (
              <div className="flex flex-1 flex-col">
                <p className="text-sm font-medium text-muted-foreground">น้องกากแนะนำ</p>
                <h3 className="mt-1 text-4xl font-black text-primary">รส{flavor.name}</h3>
                <p className="text-sm font-medium">{flavor.spice} · {size.name} ฿{size.price}</p>
                <p className="mt-4 font-display text-xl font-bold">“{rec.headline}”</p>
                <ul className="mt-3 space-y-2">
                  {rec.reasons.map((r) => (
                    <li key={r} className="flex gap-2"><span aria-hidden>✅</span><span>{r}</span></li>
                  ))}
                </ul>
                <p className="mt-4 rounded-2xl bg-secondary p-3 text-sm"><span className="font-semibold">กินคู่แนะนำ:</span> {rec.pairing}</p>
                {also && <p className="mt-2 text-sm text-muted-foreground">ถ้าติดใจ ลองรส{also.name}ต่อได้นะ</p>}
                <button type="button" onClick={() => onPick(flavor.id, size.id)}
                  className="pop pop-hover mt-auto w-full rounded-full bg-foreground px-6 py-3 font-display text-lg font-semibold text-background max-lg:mt-6">
                  เลือกรสนี้แล้วไปสั่งเลย →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
