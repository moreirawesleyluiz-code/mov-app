import { createHash, randomBytes } from "crypto";

export function generateResetToken(): { raw: string; tokenHash: string } {
  const raw = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(raw).digest("hex");
  return { raw, tokenHash };
}

export function hashResetToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}
