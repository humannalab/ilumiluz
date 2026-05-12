import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

/**
 * Hash bcrypt de uma senha em texto puro.
 * Use sempre antes de salvar User.passwordHash.
 */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

/**
 * Verifica se uma senha em texto puro confere com o hash salvo.
 * Retorna false se hash for null/undefined (usuário só tem OAuth).
 */
export async function verifyPassword(
  plain: string,
  hash: string | null | undefined
): Promise<boolean> {
  if (!hash) return false;
  return bcrypt.compare(plain, hash);
}

/**
 * Validação de força mínima de senha. Regras conservadoras pra app
 * financeiro: ≥8 caracteres, ao menos 1 letra e 1 número.
 */
export function validatePasswordStrength(password: string): string | null {
  if (password.length < 8) return "Senha deve ter no mínimo 8 caracteres.";
  if (!/[A-Za-z]/.test(password)) return "Senha precisa ter ao menos 1 letra.";
  if (!/\d/.test(password)) return "Senha precisa ter ao menos 1 número.";
  return null;
}
