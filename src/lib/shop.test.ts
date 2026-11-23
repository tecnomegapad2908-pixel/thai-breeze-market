import { describe, it, expect } from "vitest";
import { orderTotal, SIZES } from "./shop";
describe("orderTotal", () => {
  it("multiplies price by quantity", () => expect(orderTotal(89, 3)).toBe(267));
  it("uses at least one item", () => expect(orderTotal(89, 0)).toBe(89));
  it("jar costs 89", () => expect(SIZES.find((s) => s.id === "jar")?.price).toBe(89));
});
