// Store links — replace with the real shop URLs.
export const SHOP_LINKS = {
  tiktok: "https://www.tiktok.com/@khotkak",
  shopee: "https://shopee.co.th/khotkak",
  lineId: "@khotkak",
};

export const FLAVORS = [
  { id: "original", name: "ออริจินัล", spice: "เผ็ดกลาง 🌶️🌶️", desc: "กลมกล่อม หอมเจียว พริกไทย กินง่ายทุกมื้อ" },
  { id: "fire", name: "แซ่บพ่นไฟ", spice: "เผ็ดมาก 🌶️🌶️🌶️🌶️", desc: "พริกคั่วเข้มข้น จัดจ้านถึงใจสายแซ่บ" },
  { id: "tomyum", name: "ต้มยำแซ่บ", spice: "เผ็ดน้อย 🌶️", desc: "เปรี้ยวเผ็ดหอมสมุนไพร เคี้ยวเพลินเป็นสแน็ก" },
] as const;

export const SIZES = [
  { id: "mini", name: "ซองพกพา 50g", price: 39 },
  { id: "jar", name: "กระปุก 120g", price: 89 },
  { id: "family", name: "กระปุกใหญ่ 250g", price: 169 },
] as const;

export function orderTotal(sizePrice: number, qty: number) {
  return sizePrice * Math.max(1, Math.floor(qty));
}
