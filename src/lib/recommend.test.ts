import { describe, expect, it } from "vitest";
import { recommendInputSchema, recommendationSchema } from "./recommend";

const base = { spice: 3, tastes: [], eatWith: [], note: "" };

describe("recommendInputSchema", () => {
  it("accepts spice levels 1 to 5 only", () => {
    expect(recommendInputSchema.safeParse({ ...base, spice: 1 }).success).toBe(true);
    expect(recommendInputSchema.safeParse({ ...base, spice: 5 }).success).toBe(true);
    expect(recommendInputSchema.safeParse({ ...base, spice: 0 }).success).toBe(false);
    expect(recommendInputSchema.safeParse({ ...base, spice: 6 }).success).toBe(false);
  });
  it("rejects tastes not in the list", () => {
    expect(recommendInputSchema.safeParse({ ...base, tastes: ["เปรี้ยวจี๊ด"] }).success).toBe(true);
    expect(recommendInputSchema.safeParse({ ...base, tastes: ["ขม"] }).success).toBe(false);
  });
  it("limits the customer note to 200 characters", () => {
    expect(recommendInputSchema.safeParse({ ...base, note: "ก".repeat(200) }).success).toBe(true);
    expect(recommendInputSchema.safeParse({ ...base, note: "ก".repeat(201) }).success).toBe(false);
  });
});

describe("recommendationSchema", () => {
  it("only allows real โคตรกาก flavors", () => {
    const rec = { flavorId: "fire", sizeId: "jar", headline: "x", reasons: ["a"], pairing: "p", alsoTryId: null };
    expect(recommendationSchema.safeParse(rec).success).toBe(true);
    expect(recommendationSchema.safeParse({ ...rec, flavorId: "mala" }).success).toBe(false);
  });
});
