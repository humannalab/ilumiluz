import { generateSecret, generateURI, verifySync } from "otplib";
import QRCode from "qrcode";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { encrypt, decrypt } from "@/lib/crypto";

/**
 * TOTP RFC 6238 (Google Authenticator, 1Password, Authy, etc.)
 *
 * Setup config:
 * - Algorithm: SHA-1 (default — máximo de compatibilidade)
 * - Digits: 6
 * - Period: 30s
 * - epochTolerance: 30s (aceita código atual + 1 step antes/depois = ±30s drift)
 */

const ISSUER = "Ilumiluz";
const BACKUP_CODES_COUNT = 10;
const BACKUP_CODE_LENGTH = 10; // chars
const EPOCH_TOLERANCE_SECONDS = 30;

/**
 * Gera um secret novo (criptograficamente seguro, base32) pra um usuário.
 * Retorna formato pronto pra encriptar e salvar no banco.
 */
export function generateTotpSecret(): string {
  return generateSecret();
}

/**
 * URI no padrão otpauth:// que apps escaneiam via QR.
 * Format: otpauth://totp/{ISSUER}:{accountName}?secret=...&issuer=...
 */
export function buildOtpAuthUrl(accountName: string, secret: string): string {
  return generateURI({ issuer: ISSUER, label: accountName, secret });
}

/**
 * Gera QR code (data URL base64 PNG) pro URI otpauth.
 * Usado na tela de setup pra usuário escanear com app autenticador.
 */
export async function buildQrCode(otpAuthUrl: string): Promise<string> {
  return QRCode.toDataURL(otpAuthUrl, {
    errorCorrectionLevel: "M",
    width: 240,
    margin: 1,
  });
}

/**
 * Verifica se o código TOTP fornecido é válido pro secret dado.
 * Tolera drift de ±30s via epochTolerance.
 */
export function verifyTotp(code: string, secret: string): boolean {
  const clean = code.replace(/\D/g, "");
  if (clean.length !== 6) return false;
  try {
    const result = verifySync({
      token: clean,
      secret,
      epochTolerance: EPOCH_TOLERANCE_SECONDS,
    });
    return result.valid;
  } catch {
    return false;
  }
}

// ─── Backup codes ──────────────────────────────────────────────────────────
//
// Gerados na ativação do 2FA. 10 códigos. Cada um é usável 1x.
// Mostrados ao usuário UMA VEZ — depois só ficam hash bcrypt no banco.

/**
 * Gera N códigos aleatórios formato "xxxx-xxxx-xx" (chars alfanuméricos
 * sem ambiguidade — sem 0/O/I/l/1).
 */
export function generateBackupCodes(): string[] {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // sem 0,O,I,1,L
  const codes: string[] = [];
  for (let i = 0; i < BACKUP_CODES_COUNT; i++) {
    const chars: string[] = [];
    for (let j = 0; j < BACKUP_CODE_LENGTH; j++) {
      chars.push(alphabet[crypto.randomInt(alphabet.length)]);
    }
    // Formato visual: ABCD-EFGH-IJ (mais fácil de ler/digitar)
    const code = chars.join("");
    codes.push(`${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8)}`);
  }
  return codes;
}

/**
 * Hash bcrypt de um backup code pra salvar no banco.
 * Salt rounds 10 (mesmo da senha — bom equilíbrio CPU/segurança).
 */
export async function hashBackupCode(code: string): Promise<string> {
  // Normaliza: upper case, sem espaços nem hífens (usuário pode digitar de várias formas)
  const normalized = normalizeBackupCode(code);
  return bcrypt.hash(normalized, 10);
}

export function normalizeBackupCode(code: string): string {
  return code.toUpperCase().replace(/[\s-]/g, "");
}

/**
 * Tenta usar um backup code: compara contra hashes salvos. Se match,
 * retorna o hash usado pra remoção. Caso contrário, null.
 *
 * Chamador deve remover o hash da array do User pra invalidar o código.
 */
export async function consumeBackupCode(
  candidate: string,
  hashes: string[]
): Promise<string | null> {
  const normalized = normalizeBackupCode(candidate);
  if (normalized.length !== BACKUP_CODE_LENGTH) return null;
  for (const hash of hashes) {
    if (await bcrypt.compare(normalized, hash)) {
      return hash;
    }
  }
  return null;
}

// ─── Wrappers de encrypt/decrypt do secret ─────────────────────────────────

export function encryptSecret(secret: string): string {
  return encrypt(secret);
}

export function decryptSecret(blob: string): string {
  return decrypt(blob);
}
