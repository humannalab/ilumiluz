import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CheckCircle2,
  XCircle,
  KeyRound,
  Lock,
  ShieldCheck,
  ShieldOff,
  type LucideIcon,
} from "lucide-react";

interface ActivityEvent {
  id: string;
  action: string;
  ip: string | null;
  userAgent: string | null;
  createdAt: Date;
}

interface Props {
  events: ActivityEvent[];
}

interface DisplayMeta {
  label: string;
  icon: LucideIcon;
  tone: "ok" | "warn" | "neutral";
}

// Mapeia cada action pra label PT + ícone + cor.
function meta(action: string): DisplayMeta {
  switch (action) {
    case "auth.login.success":
      return { label: "Login bem-sucedido", icon: CheckCircle2, tone: "ok" };
    case "auth.login.failure":
      return { label: "Tentativa de login com senha errada", icon: XCircle, tone: "warn" };
    case "auth.login.locked":
      return { label: "Conta bloqueada por excesso de tentativas", icon: Lock, tone: "warn" };
    case "auth.password.set":
      return { label: "Senha cadastrada", icon: KeyRound, tone: "ok" };
    case "auth.password.change":
      return { label: "Senha alterada", icon: KeyRound, tone: "ok" };
    case "auth.password.reset.request":
      return { label: "Solicitação de redefinição de senha", icon: KeyRound, tone: "neutral" };
    case "auth.password.reset.complete":
      return { label: "Senha redefinida via e-mail", icon: KeyRound, tone: "ok" };
    case "auth.2fa.enabled":
      return { label: "2FA ativado", icon: ShieldCheck, tone: "ok" };
    case "auth.2fa.disabled":
      return { label: "2FA desativado", icon: ShieldOff, tone: "warn" };
    case "auth.2fa.success":
      return { label: "Login confirmado por 2FA", icon: ShieldCheck, tone: "ok" };
    case "auth.2fa.failure":
      return { label: "Código 2FA inválido", icon: XCircle, tone: "warn" };
    case "auth.2fa.backup_used":
      return { label: "Login com código de recuperação", icon: ShieldCheck, tone: "neutral" };
    default:
      return { label: action, icon: CheckCircle2, tone: "neutral" };
  }
}

// Tenta extrair "Chrome no macOS" do user-agent. Heurística simples,
// não usamos lib porque o ganho de precisão não vale 30kb extra.
function describeDevice(ua: string | null): string {
  if (!ua) return "Dispositivo desconhecido";
  let browser = "Browser";
  if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/Chrome\//i.test(ua) && !/Edg/i.test(ua)) browser = "Chrome";
  else if (/Firefox\//i.test(ua)) browser = "Firefox";
  else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) browser = "Safari";

  let os = "";
  if (/iPhone|iPad/i.test(ua)) os = "iOS";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/Mac OS X|Macintosh/i.test(ua)) os = "macOS";
  else if (/Windows/i.test(ua)) os = "Windows";
  else if (/Linux/i.test(ua)) os = "Linux";

  return os ? `${browser} no ${os}` : browser;
}

function toneClass(tone: DisplayMeta["tone"]): string {
  switch (tone) {
    case "ok":
      return "text-income";
    case "warn":
      return "text-expense";
    default:
      return "text-muted-foreground";
  }
}

export function RecentActivity({ events }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividade recente</CardTitle>
        <CardDescription>
          Últimas ações de segurança na sua conta. Se ver algo que você não
          reconhece, troque a senha imediatamente.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Sem atividade ainda. Aparece aqui quando você logar, trocar senha,
            ativar 2FA, etc.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {events.map((event) => {
              const m = meta(event.action);
              const Icon = m.icon;
              return (
                <li key={event.id} className="flex items-start gap-3 py-3">
                  <Icon
                    className={`mt-0.5 h-5 w-5 shrink-0 ${toneClass(m.tone)}`}
                  />
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p className="text-sm font-medium text-foreground">
                      {m.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {describeDevice(event.userAgent)}
                      {event.ip && (
                        <>
                          {" · IP "}
                          <code className="text-xs">{event.ip}</code>
                        </>
                      )}
                    </p>
                  </div>
                  <time className="shrink-0 text-xs text-muted-foreground">
                    {new Intl.DateTimeFormat("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(event.createdAt)}
                  </time>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
