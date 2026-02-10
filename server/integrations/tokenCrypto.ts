/**
 * AES-256-GCM encrypt/decrypt for storing refresh tokens.
 * Requires INTEGRATION_ENCRYPTION_KEY env (32-byte hex or base64).
 */

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

const ALGO = "aes-256-gcm";
const KEY_LEN = 32;
const IV_LEN = 16;
const SALT_LEN = 16;
const TAG_LEN = 16;

function getKey(): Buffer {
  const raw = process.env.INTEGRATION_ENCRYPTION_KEY;
  if (!raw || raw.length < 32) {
    throw new Error("INTEGRATION_ENCRYPTION_KEY must be set and at least 32 characters (e.g. 64 hex chars)");
  }
  if (Buffer.isBuffer(raw)) return raw as Buffer;
  if (/^[0-9a-fA-F]+$/.test(raw) && raw.length >= 64) {
    return Buffer.from(raw.slice(0, 64), "hex");
  }
  return scryptSync(raw, "tapback-salt", KEY_LEN);
}

export function encryptRefreshToken(plain: string): string {
  const key = getKey();
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALGO, key, iv, { authTagLength: TAG_LEN });
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64");
}

export function decryptRefreshToken(encrypted: string): string {
  const key = getKey();
  const buf = Buffer.from(encrypted, "base64");
  if (buf.length < IV_LEN + TAG_LEN) throw new Error("Invalid encrypted token");
  const iv = buf.subarray(0, IV_LEN);
  const tag = buf.subarray(IV_LEN, IV_LEN + TAG_LEN);
  const enc = buf.subarray(IV_LEN + TAG_LEN);
  const decipher = createDecipheriv(ALGO, key, iv, { authTagLength: TAG_LEN });
  decipher.setAuthTag(tag);
  return decipher.update(enc).toString("utf8") + decipher.final("utf8");
}
