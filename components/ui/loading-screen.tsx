"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function LoadingScreen() {
  const [progress, setProgress] = useState(18);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 92) return 18;
        return Math.min(100, current + Math.floor(Math.random() * 12) + 6);
      });
    }, 350);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background px-4 py-12 text-center">
      <div className="flex w-full max-w-lg flex-col items-center gap-6 rounded-3xl border border-border/60 bg-muted/25 p-6 shadow-lg shadow-black/5 backdrop-blur-2xl">
        <div className="relative h-44 w-44">
          <Image
            src="/illustrations/sleeping.svg"
            alt="Ilustração de carregamento"
            fill
            className="object-contain"
            priority
          />
        </div>

        <div className="space-y-2 px-2">
          <p className="text-xl font-semibold text-foreground">Aguarde um instante...</p>
          <p className="text-sm text-muted-foreground">
            Estamos preparando tudo para você.
          </p>
        </div>

        <div className="w-full px-2">
          <div className="h-2 overflow-hidden rounded-full bg-border/20">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>{Math.round(progress)}%</span>
            <span>Carregando</span>
          </div>
        </div>
      </div>
    </div>
  );
}
