export interface ServiceItem {
  name: string;
  /** Display-only text (e.g. "110K", "200–300K", "10K/1 NGÓN"); never parsed or summed. */
  priceLabel: string;
}

export interface ServiceCategory {
  id: string;
  title: string;
  services: ServiceItem[];
  note?: string;
  /** Where the note renders relative to the list. Defaults to "bottom". */
  notePosition?: "top" | "bottom";
}

/**
 * Price menu shown on the landing page. Informational only: prices are display strings, nothing is calculated
 * and services are not part of the appointment request. Update here when the salon changes its menu.
 */
export const serviceCategories: ServiceCategory[] = [
  {
    id: "classic",
    title: "CLASSIC",
    services: [
      { name: "Sơn Gel Hàn", priceLabel: "110K" },
      { name: "Sơn Gel nhũ - flash", priceLabel: "120K" },
      { name: "Sơn Gel thạch", priceLabel: "120K" },
      { name: "Sơn Gel mắt mèo", priceLabel: "150K" },
    ],
    note: "(Đã bao gồm nền)",
  },
  {
    id: "nail-care",
    title: "NAIL CARE",
    services: [
      { name: "Cắt da Tay/Chân", priceLabel: "30K" },
      { name: "Tháo sơn gel", priceLabel: "20K" },
      { name: "Tháo móng Đắp/Úp", priceLabel: "50K" },
      { name: "Phục hồi móng gãy", priceLabel: "10K/1 NGÓN" },
    ],
  },
  {
    id: "extensions",
    title: "EXTENSIONS",
    services: [
      { name: "Đắp Gel", priceLabel: "200–300K" },
      { name: "Úp móng Gel X", priceLabel: "120K" },
      { name: "Refill Gel", priceLabel: "150K" },
      { name: "Cứng móng móng", priceLabel: "40K" },
      { name: "Cứng móng tạo cầu", priceLabel: "80–150K" },
      { name: "Claw Nails", priceLabel: "400–700K" },
    ],
  },
  {
    id: "designs",
    title: "DESIGNS",
    services: [
      { name: "Tráng gương", priceLabel: "15K/1 NGÓN" },
      { name: "Ombre", priceLabel: "10–15K" },
      { name: "Air Brush", priceLabel: "15–20K" },
      { name: "Gel nổi", priceLabel: "15–60K" },
      { name: "Loang màu", priceLabel: "15–30K" },
      { name: "Ẩn phụ kiện, Foil", priceLabel: "10–30K" },
      { name: "Đính đá/Charm", priceLabel: "3–70K" },
      { name: "Vẽ", priceLabel: "10–200K" },
    ],
  },
];

export const discountNotice = "Giảm 10% đối với HSSV có mang thẻ và khách hàng trong tháng sinh nhật.";

export const warrantyNotice = "Bảo hành sản phẩm trong 7 ngày";
