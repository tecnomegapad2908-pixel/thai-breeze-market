import { describe, expect, it } from "vitest";
import { orderInputSchema, priceOrder } from "./orders";

const valid = {
  name: "สมชาย",
  phone: "081-234-5678",
  address: "99/1 ถ.นิมมาน ต.สุเทพ อ.เมือง เชียงใหม่ 50200",
  note: "",
  payment: "cod",
  lines: [{ flavorId: "original", sizeId: "jar", qty: 1 }],
};

describe("priceOrder", () => {
  it("prices from the catalog: jar ฿89, mini ฿39, family ฿169", () => {
    const r = priceOrder([
      { flavorId: "original", sizeId: "jar", qty: 2 },
      { flavorId: "fire", sizeId: "mini", qty: 1 },
      { flavorId: "tomyum", sizeId: "family", qty: 1 },
    ]);
    expect(r.total).toBe(89 * 2 + 39 + 169);
    expect(r.itemCount).toBe(4);
  });
  it("merges the same flavor and size into one line", () => {
    const r = priceOrder([
      { flavorId: "fire", sizeId: "jar", qty: 1 },
      { flavorId: "fire", sizeId: "jar", qty: 2 },
    ]);
    expect(r.items).toHaveLength(1);
    expect(r.items[0]?.qty).toBe(3);
  });
  it("gives free shipping from 5 jars, not at 4", () => {
    expect(priceOrder([{ flavorId: "original", sizeId: "jar", qty: 4 }]).freeShipping).toBe(false);
    expect(priceOrder([{ flavorId: "original", sizeId: "jar", qty: 5 }]).freeShipping).toBe(true);
  });
});

describe("orderInputSchema", () => {
  it("accepts a normal order and strips dashes from the phone", () => {
    const r = orderInputSchema.parse(valid);
    expect(r.phone).toBe("0812345678");
  });
  it("rejects a phone that is not a Thai number", () => {
    expect(orderInputSchema.safeParse({ ...valid, phone: "12345" }).success).toBe(false);
  });
  it("rejects an empty cart", () => {
    expect(orderInputSchema.safeParse({ ...valid, lines: [] }).success).toBe(false);
  });
  it("rejects an unknown flavor", () => {
    expect(orderInputSchema.safeParse({ ...valid, lines: [{ flavorId: "mala", sizeId: "jar", qty: 1 }] }).success).toBe(false);
  });
});
