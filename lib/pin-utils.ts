export function isValidPin(value: string) {
  return /^\d{4}$/.test(value);
}

export function normalizePinInput(value: string) {
  return value.replace(/\D/g, "").slice(0, 4);
}

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

export async function hashPin(pin: string) {
  const encoded = new TextEncoder().encode(pin);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return toHex(digest);
}

export async function verifyPin(pin: string, expectedHash: string) {
  return (await hashPin(pin)) === expectedHash;
}
