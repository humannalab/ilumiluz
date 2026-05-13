import { redirect } from "next/navigation";

// Esta rota foi renomeada para /conta/pedidos — histórico de pedidos Ilumiluz.
// O redirect garante que links antigos (bookmark, email) funcionem.
export default function BillingRedirectPage() {
  redirect("/conta/pedidos");
}
