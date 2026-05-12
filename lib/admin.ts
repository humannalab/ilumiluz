/**
 * Lista canônica de e-mails com acesso admin.
 *
 * Adicionar/remover aqui — todas as rotas e o layout admin importam
 * deste único lugar pra manter sincronizado.
 *
 * Pra v2 (quando crescer): mover pra coluna `User.role` no banco.
 */
export const ADMIN_EMAILS = ["hugo.branco@humannalab.com"];

export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email);
}
