import crypto from "node:crypto";

/**
 * AES-256-GCM encryption pra dados sensíveis em repouso (TOTP secret,
 * futuramente outros).
 *
 * Chave derivada de AUTH_SECRET via SHA-256. AUTH_SECRET vive em Vercel
 * env vars (encrypted at rest), então quebra dupla: atacante precisa do
 * banco + da env var pra decifrar.
 *
 * Formato armazenado: base64url(iv[12] || authTag[16] || ciphertext).
 * Substitui AUTH_SECRET → todos os tokens encriptados ficam ilegíveis
 * (rotação requer re-encriptar — não implementado, mas raro).
 */

function getKey(): Buffer {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET é obrigatório pra cifragem");
  }
  return crypto.createHash("sha256").update(secret).digest();
}

export function encrypt(plaintext: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getKey(), iv);
  const ct = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ct]).toString("base64url");
}

export function decrypt(blob: string): string {
  const buf = Buffer.from(blob, "base64url");
  if (buf.length < 28) throw new Error("Ciphertext muito curto");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const ct = buf.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", getKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString(
    "utf8"
  );
}
