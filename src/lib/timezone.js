const VE_OFFSET_MS = 4 * 60 * 60 * 1000;

export function hoyVE() {
  const ve = new Date(Date.now() - VE_OFFSET_MS);
  return ve.toISOString().slice(0, 10);
}

export function inicioDiaVE_UTC(fecha = hoyVE()) {
  return `${fecha}T04:00:00.000Z`;
}

export function haceNdiasVE_UTC(n) {
  const d = new Date(inicioDiaVE_UTC());
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString();
}