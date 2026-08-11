const DEFAULT_COUNTRY_CODE = "58";

export function normalizePhone(raw) {
  if (!raw) return null;
  let digits = String(raw).replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("0")) {
    digits = DEFAULT_COUNTRY_CODE + digits.slice(1);
  } else if (!digits.startsWith(DEFAULT_COUNTRY_CODE) && digits.length <= 10) {
    digits = DEFAULT_COUNTRY_CODE + digits;
  }
  return digits;
}

export function buildWhatsappUrl(phone, message) {
  const normalized = normalizePhone(phone);
  if (!normalized) return null;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}