import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

/**
 * Input primitive.
 *
 * Defaults:
 * - autoComplete="off"  → desliga o histórico do browser por padrão
 * - autoCorrect="off"   → sem correção automática de mobile
 * - spellCheck={false}  → sem sublinhado vermelho de "erro de ortografia"
 *
 * Esses defaults evitam poluição de sugestões do browser em campos como
 * Banco, Título de transação, Apelido de conta, etc.
 *
 * Casos que PRECISAM de autocomplete (login: email, senha; perfil:
 * name) podem sobrescrever passando autoComplete="email" /
 * "current-password" / "name" explicitamente.
 *
 * Para campos com <datalist>, o atributo `list` continua funcionando
 * mesmo com autoComplete="off" — o datalist é um mecanismo separado
 * que oferece sugestões custom sem depender do histórico do browser.
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, autoComplete, autoCorrect, spellCheck, ...props }, ref) => (
    <input
      type={type}
      autoComplete={autoComplete ?? "off"}
      autoCorrect={autoCorrect ?? "off"}
      spellCheck={spellCheck ?? false}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
