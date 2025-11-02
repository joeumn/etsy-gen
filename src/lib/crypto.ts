import crypto from "node:crypto";
import { env } from "../config/env";

const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const ALGORITHM = "aes-256-gcm";

const key = crypto
  .createHash("sha256")
  .update(env.APP_ENCRYPTION_KEY, "utf8")
  .digest();

const encode = (buffer: Buffer) => buffer.toString("base64");
const decode = (value: string) => Buffer.from(value, "base64");

export interface EncryptedSecret {
  value: string;
  iv: string;
  lastFour: string;
}

export const encryptSecret = (secret: string): EncryptedSecret => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const ciphertext = Buffer.concat([cipher.update(secret, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  const payload = Buffer.concat([ciphertext, authTag]);
  const lastFour = secret.slice(-4);

  return {
    value: encode(payload),
    iv: encode(iv),
    lastFour,
  };
};

export const decryptSecret = (encrypted: string, iv: string): string => {
  const payload = decode(encrypted);
  const authTag = payload.subarray(payload.length - AUTH_TAG_LENGTH);
  const ciphertext = payload.subarray(0, payload.length - AUTH_TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, decode(iv));
  decipher.setAuthTag(authTag);

  const plain = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return plain.toString("utf8");
};

export const maskSecret = (lastFour: string) => `****${lastFour || "????"}`;
