import { createOpenAI } from "@ai-sdk/openai";
import { APICallError, NoObjectGeneratedError, Output, streamText } from "ai";
import { FLAVORS, SIZES } from "@/lib/shop";
import { SPICE_LEVELS, recommendationSchema, type RecommendInput, type RecommendResult } from "@/lib/recommend";
import { createLovableAiGatewayRunIdFetch, getLovableAiGatewayRunId } from "@/lib/run-id.server";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1";
const MODEL = "openai/gpt-6.1-sol";

const INSTRUCTIONS = `คุณคือ "น้องกาก" ผู้ช่วยเลือกน้ำพริกกากหมูของแบรนด์ โคตรกาก (สไตล์สนุก แซ่บ วัยรุ่น เป็นกันเอง)
จุดเด่นแบรนด์: เครื่องแน่น วัตถุดิบท้องถิ่น ทอดน้ำมันใหม่ทุกกระทะ สะอาดปลอดภัย

สินค้าที่มี (เลือกได้เฉพาะ id เหล่านี้เท่านั้น):
${FLAVORS.map((f) => `- id "${f.id}": รส${f.name} (${f.spice}) — ${f.desc}`).join("\n")}

ขนาด:
${SIZES.map((s) => `- id "${s.id}": ${s.name} ราคา ${s.price} บาท`).join("\n")}

หลักการเลือก:
- ความเผ็ดระดับ 1-2 → ส่วนใหญ่ "tomyum"; ระดับ 3 → "original"; ระดับ 4-5 → "fire" แต่ปรับตามรสที่ชอบได้ (เช่น ชอบเปรี้ยว/สมุนไพร เหมาะ tomyum, ชอบเค็มกลมกล่อม/กระเทียมเจียว เหมาะ original)
- ขนาด: กินเล่น/ลองชิม → "mini", กินกับข้าวประจำ → "jar", ครอบครัว/ของฝาก → "family"
- headline: ประโยคสั้นติดหู ไม่เกิน 12 คำ
- reasons: 2-3 ข้อ สั้น อ้างอิงสิ่งที่ลูกค้าเลือกจริงๆ
- pairing: แนะนำเมนูกินคู่ 1 ประโยค
- alsoTryId: รสอื่นที่น่าลองต่อ (ต้องไม่ซ้ำ flavorId) หรือ null
ตอบเป็นภาษาไทยเท่านั้น ห้ามแต่งข้อมูลสินค้าหรือราคาที่ไม่มีในรายการ`;

function describe(input: RecommendInput) {
  const spice = SPICE_LEVELS.find((s) => s.level === input.spice);
  return [
    `ระดับความเผ็ดที่ชอบ: ${input.spice}/5 (${spice?.label ?? ""})`,
    `รสชาติที่ชอบ: ${input.tastes.length ? input.tastes.join(", ") : "ไม่ระบุ"}`,
    `ชอบกินคู่กับ/โอกาส: ${input.eatWith.length ? input.eatWith.join(", ") : "ไม่ระบุ"}`,
    `ข้อความเพิ่มเติมจากลูกค้า: ${input.note || "-"}`,
  ].join("\n");
}

function errorMessage(status?: number): string {
  if (status === 429) return "ตอนนี้มีคนถามน้องกากเยอะมาก ลองใหม่อีกสักครู่นะ";
  if (status === 402 || status === 403) return "ระบบแนะนำรสชาติปิดให้บริการชั่วคราว เลือกรสเองด้านล่างได้เลย";
  return "น้องกากคิดไม่ออกชั่วคราว ลองใหม่อีกครั้งนะ";
}

export async function recommendFlavor(request: Request | undefined, input: RecommendInput): Promise<RecommendResult> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return { ok: false, error: "ระบบแนะนำยังไม่พร้อมใช้งาน" };

  const runIdFetch = createLovableAiGatewayRunIdFetch(request ? getLovableAiGatewayRunId(request) : undefined);
  const provider = createOpenAI({
    baseURL: GATEWAY_URL,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });

  try {
    const result = streamText({
      model: provider.responses(MODEL),
      instructions: INSTRUCTIONS,
      messages: [{ role: "user", content: describe(input) }],
      output: Output.object({ schema: recommendationSchema }),
      maxRetries: 0,
      ...(request ? { abortSignal: request.signal } : {}),
      providerOptions: {
        openai: {
          forceReasoning: true,
          reasoningEffort: "low",
          reasoningSummary: "auto",
          store: false,
          include: ["reasoning.encrypted_content"],
        },
      },
    });
    const rec = await result.output;
    if (rec.alsoTryId === rec.flavorId) rec.alsoTryId = null;
    rec.reasons = rec.reasons.slice(0, 3);
    return { ok: true, rec };
  } catch (err) {
    const cause = err instanceof Error && "cause" in err ? (err as { cause?: unknown }).cause : undefined;
    const apiErr = APICallError.isInstance(err) ? err : APICallError.isInstance(cause) ? cause : undefined;
    console.error("recommendFlavor failed", NoObjectGeneratedError.isInstance(err) ? "no object" : apiErr?.statusCode, err);
    return { ok: false, error: errorMessage(apiErr?.statusCode) };
  }
}
