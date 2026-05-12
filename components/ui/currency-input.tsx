"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";

function formatBRL(reais: number) {
  return reais.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export interface CurrencyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> {
  /** Valor em reais (BRL). Ex: 12.34 */
  value: number;
  onChange: (value: number) => void;
}

/**
 * Input com máscara R$ aplicada DENTRO do próprio campo (sem help text).
 * O usuário digita apenas dígitos; o componente formata como moeda em tempo real.
 *
 * Comportamento:
 * - Digita "1234" → exibe "R$ 12,34"
 * - Backspace remove um dígito (não um caractere visual)
 * - Campo vazio quando value === 0
 */
export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, placeholder = "R$ 0,00", className, ...props }, ref) => {
    const display = value > 0 ? formatBRL(value) : "";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const digits = e.target.value.replace(/\D/g, "");
      if (digits.length === 0) {
        onChange(0);
        return;
      }
      const cents = parseInt(digits, 10);
      onChange(cents / 100);
    };

    return (
      <Input
        ref={ref}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={display}
        placeholder={placeholder}
        onChange={handleChange}
        className={className}
        {...props}
      />
    );
  }
);
CurrencyInput.displayName = "CurrencyInput";
