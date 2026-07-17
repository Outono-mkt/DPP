"use client";

import {
  FormEvent,
  KeyboardEvent,
  ReactNode,
  RefObject,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase";

export type AuthModalKind = "register" | "recover" | "new-password";

type ModalProps = {
  initialEmail?: string;
  kind: AuthModalKind;
  onAuthenticated: (email: string, displayName?: string) => void;
  onClose: () => void;
  onReturnToLogin: () => void;
  onSwitch: (kind: AuthModalKind) => void;
};

export function AuthModal(props: ModalProps) {
  if (props.kind === "register") return <RegistrationDialog {...props} />;
  if (props.kind === "recover") return <RecoveryDialog {...props} />;
  return <NewPasswordDialog {...props} />;
}

function RegistrationDialog({
  initialEmail = "",
  onAuthenticated,
  onClose,
  onReturnToLogin,
}: ModalProps) {
  const [form, setForm] = useState({
    name: "",
    email: initialEmail,
    challengeCode: "",
    password: "",
    passwordConfirmation: "",
  });
  const [error, setError] = useState<FieldError | null>(null);
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);
  const firstRef = useRef<HTMLInputElement>(null);
  const errorId = useId();

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validateRegistration(form);
    setError(validation);
    if (validation) return;
    setBusy(true);

    try {
      const normalizedEmail = form.email.trim().toLowerCase();
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, email: normalizedEmail, name: form.name.trim() }),
      });
      const payload = (await response.json()) as { error?: string; ok?: boolean };

      if (!response.ok || !payload.ok) {
        setError({
          field: response.status === 401 ? "challengeCode" : response.status === 409 ? "email" : "form",
          message: payload.error ?? "Não foi possível criar sua conta agora.",
        });
        return;
      }

      const supabase = getSupabaseBrowserClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: form.password,
      });

      if (signInError || !data.session?.user.email) {
        setError({
          field: "form",
          message: "Sua conta foi criada. Entre com seu e-mail e senha para continuar.",
        });
        return;
      }

      setSuccess(true);
      window.setTimeout(
        () => onAuthenticated(data.session?.user.email ?? normalizedEmail, form.name.trim()),
        650,
      );
    } catch {
      setError({
        field: "form",
        message: "Não foi possível criar sua conta agora. Tente novamente em instantes.",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      busy={busy || success}
      description="Preencha seus dados para acessar o Produto Pronto."
      firstRef={firstRef}
      onClose={onClose}
      title="Crie sua conta"
    >
      {success ? (
        <Notice tone="success">
          <strong className="block text-base">Conta criada com sucesso!</strong>
          <span className="mt-1 block">Redirecionando para o Produto Pronto...</span>
        </Notice>
      ) : (
        <form className="mt-6 grid gap-4" noValidate onSubmit={submit}>
          <Field
            autoComplete="name"
            errorId={fieldErrorId(error, "name", errorId)}
            inputRef={firstRef}
            label="Nome"
            onChange={(value) => update("name", value)}
            placeholder="Como você quer ser chamado?"
            value={form.name}
          />
          <Field
            autoComplete="email"
            errorId={fieldErrorId(error, "email", errorId)}
            label="E-mail"
            onChange={(value) => update("email", value)}
            placeholder="seuemail@exemplo.com"
            type="email"
            value={form.email}
          />
          <Field
            autoComplete="off"
            errorId={fieldErrorId(error, "challengeCode", errorId)}
            helper="O Código do Desafio está disponível na primeira aula da Hotmart."
            label="Código do Desafio"
            onChange={(value) => update("challengeCode", value)}
            placeholder="Digite o código da primeira aula"
            type="password"
            value={form.challengeCode}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              autoComplete="new-password"
              errorId={fieldErrorId(error, "password", errorId)}
              label="Senha"
              onChange={(value) => update("password", value)}
              placeholder="Mínimo de 8 caracteres"
              type="password"
              value={form.password}
            />
            <Field
              autoComplete="new-password"
              errorId={fieldErrorId(error, "passwordConfirmation", errorId)}
              label="Confirmar senha"
              onChange={(value) => update("passwordConfirmation", value)}
              placeholder="Repita sua senha"
              type="password"
              value={form.passwordConfirmation}
            />
          </div>
          {error ? <Notice id={errorId}>{error.message}</Notice> : null}
          <SubmitButton busy={busy} busyLabel="Criando sua conta...">Criar minha conta</SubmitButton>
          <TextButton onClick={onReturnToLogin}>Já possui uma conta? Entrar</TextButton>
        </form>
      )}
    </Dialog>
  );
}

function RecoveryDialog({ initialEmail = "", onClose, onReturnToLogin }: ModalProps) {
  const [email, setEmail] = useState(initialEmail);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const firstRef = useRef<HTMLInputElement>(null);
  const errorId = useId();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const normalizedEmail = email.trim().toLowerCase();
    if (!validEmail(normalizedEmail)) {
      setError("Informe um e-mail válido.");
      return;
    }
    setBusy(true);
    try {
      const { error: recoveryError } = await getSupabaseBrowserClient().auth.resetPasswordForEmail(
        normalizedEmail,
        { redirectTo: recoveryRedirectUrl() },
      );
      if (recoveryError) throw recoveryError;
      setSent(true);
    } catch {
      setError("Não foi possível enviar o link agora. Tente novamente em instantes.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      busy={busy}
      description="Informe o e-mail usado no seu cadastro. Enviaremos um link para você criar uma nova senha."
      firstRef={firstRef}
      onClose={onClose}
      title="Recuperar senha"
    >
      {sent ? (
        <div className="mt-6 grid gap-5">
          <Notice tone="success">
            Se este e-mail estiver cadastrado, você receberá um link para criar uma nova senha.
          </Notice>
          <TextButton onClick={onReturnToLogin}>Voltar para o login</TextButton>
        </div>
      ) : (
        <form className="mt-6 grid gap-5" noValidate onSubmit={submit}>
          <Field
            autoComplete="email"
            errorId={error ? errorId : undefined}
            inputRef={firstRef}
            label="E-mail"
            onChange={setEmail}
            placeholder="seuemail@exemplo.com"
            type="email"
            value={email}
          />
          {error ? <Notice id={errorId}>{error}</Notice> : null}
          <SubmitButton busy={busy} busyLabel="Enviando...">Enviar link de recuperação</SubmitButton>
          <TextButton onClick={onReturnToLogin}>Voltar para o login</TextButton>
        </form>
      )}
    </Dialog>
  );
}

function NewPasswordDialog({ onAuthenticated, onClose, onSwitch }: ModalProps) {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(() => recoveryUrlError());
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);
  const firstRef = useRef<HTMLInputElement>(null);
  const errorId = useId();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Crie uma senha com pelo menos 8 caracteres.");
      return;
    }
    if (password !== confirmation) {
      setError("As senhas não conferem.");
      return;
    }
    setBusy(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase.auth.getSession();
      if (!data.session?.access_token || !data.session.user.email) {
        setError(expiredLinkMessage());
        return;
      }
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(expiredLinkMessage());
        return;
      }
      await fetch("/api/customer-access/complete-first-access", {
        method: "POST",
        headers: { Authorization: "Bearer " + data.session.access_token },
      });
      window.history.replaceState({}, "", "/");
      setSuccess(true);
      const email = data.session.user.email;
      const displayName = getDisplayName(data.session.user.user_metadata);
      window.setTimeout(() => onAuthenticated(email, displayName), 650);
    } catch {
      setError("Não foi possível salvar sua senha agora. Solicite um novo link e tente novamente.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      busy={busy || success}
      description="Crie uma senha segura para acessar o Produto Pronto."
      firstRef={firstRef}
      onClose={onClose}
      title="Criar nova senha"
    >
      {success ? (
        <Notice tone="success"><strong>Senha alterada com sucesso!</strong></Notice>
      ) : (
        <form className="mt-6 grid gap-4" noValidate onSubmit={submit}>
          <Field
            autoComplete="new-password"
            errorId={error ? errorId : undefined}
            inputRef={firstRef}
            label="Nova senha"
            onChange={setPassword}
            placeholder="Mínimo de 8 caracteres"
            type="password"
            value={password}
          />
          <Field
            autoComplete="new-password"
            errorId={error ? errorId : undefined}
            label="Confirmar nova senha"
            onChange={setConfirmation}
            placeholder="Repita a nova senha"
            type="password"
            value={confirmation}
          />
          {error ? <Notice id={errorId}>{error}</Notice> : null}
          <SubmitButton busy={busy} busyLabel="Salvando...">Salvar nova senha</SubmitButton>
          {error === expiredLinkMessage() ? (
            <TextButton onClick={() => onSwitch("recover")}>Solicitar novo link</TextButton>
          ) : null}
        </form>
      )}
    </Dialog>
  );
}

function Dialog({
  busy,
  children,
  description,
  firstRef,
  onClose,
  title,
}: {
  busy: boolean;
  children: ReactNode;
  description: string;
  firstRef: RefObject<HTMLInputElement | null>;
  onClose: () => void;
  title: string;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.setTimeout(() => firstRef.current?.focus(), 0);
    return () => {
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [firstRef]);

  function keyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape" && !busy) {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key !== "Tab" || !dialogRef.current) return;
    const items = Array.from(
      dialogRef.current.querySelectorAll<HTMLElement>("button:not([disabled]), input:not([disabled])"),
    );
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/72 px-4 py-5 backdrop-blur-sm sm:px-6 sm:py-8">
      <div className="flex min-h-full items-center justify-center">
        <div
          aria-describedby={descriptionId}
          aria-labelledby={titleId}
          aria-modal="true"
          className="relative max-h-[calc(100vh-2.5rem)] w-full max-w-[560px] overflow-y-auto rounded-[28px] border border-white/12 bg-[linear-gradient(180deg,rgba(28,28,28,.98)_0%,rgba(13,13,13,.99)_100%)] p-6 text-[#F7F5EF] shadow-[0_32px_100px_rgba(0,0,0,.65),inset_0_1px_0_rgba(255,255,255,.07)] sm:max-h-[calc(100vh-4rem)] sm:p-9"
          onKeyDown={keyDown}
          ref={dialogRef}
          role="dialog"
        >
          <button
            aria-label="Fechar"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-[#B0ABA4] transition hover:border-[#C9A84C]/60 hover:text-[#E5CB78] focus:outline-none focus:ring-2 focus:ring-[#C9A84C] disabled:opacity-40"
            disabled={busy}
            onClick={onClose}
            title="Fechar"
            type="button"
          >
            <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
              <path d="m7 7 10 10M17 7 7 17" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
            </svg>
          </button>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#C9A84C]">Produto Pronto</p>
          <h2 className="mt-3 pr-12 text-[1.75rem] font-bold leading-tight sm:text-[2rem]" id={titleId}>{title}</h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-[#B0ABA4]" id={descriptionId}>{description}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

function Field({
  autoComplete,
  errorId,
  helper,
  inputRef,
  label,
  onChange,
  placeholder,
  type = "text",
  value,
}: {
  autoComplete: string;
  errorId?: string;
  helper?: string;
  inputRef?: RefObject<HTMLInputElement | null>;
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: "email" | "password" | "text";
  value: string;
}) {
  const id = useId();
  const helperId = useId();
  const describedBy = [helper ? helperId : null, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div>
      <label className="mb-2 block text-sm font-semibold" htmlFor={id}>
        {label}
      </label>
      <input
        aria-describedby={describedBy}
        aria-invalid={Boolean(errorId)}
        autoComplete={autoComplete}
        className="h-[56px] w-full rounded-[14px] border border-white/10 bg-white/[.055] px-4 text-base outline-none transition placeholder:text-[#8F8B85] focus:border-[rgba(201,168,76,.75)] focus:shadow-[0_0_0_3px_rgba(201,168,76,.12)]"
        id={id}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        ref={inputRef}
        type={type}
        value={value}
      />
      {helper ? (
        <p className="mt-2 text-xs leading-5 text-[#9F9A93]" id={helperId}>
          {helper}
        </p>
      ) : null}
    </div>
  );
}

function SubmitButton({
  busy,
  busyLabel,
  children,
}: {
  busy: boolean;
  busyLabel: string;
  children: ReactNode;
}) {
  return (
    <button
      className="mt-1 h-[56px] w-full rounded-[14px] bg-[linear-gradient(135deg,#E5CB78_0%,#C9A84C_58%,#B98C2D_100%)] px-5 text-sm font-bold text-[#0D0D0D] transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:ring-offset-2 focus:ring-offset-[#111] disabled:opacity-55 disabled:hover:translate-y-0"
      disabled={busy}
      type="submit"
    >
      {busy ? busyLabel : children}
    </button>
  );
}

function TextButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      className="text-sm font-semibold text-[#C9A84C] hover:text-[#E5CB78] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]"
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function Notice({
  children,
  id,
  tone = "error",
}: {
  children: ReactNode;
  id?: string;
  tone?: "error" | "success";
}) {
  const classes =
    tone === "success"
      ? "rounded-2xl border border-[#C9A84C]/25 bg-[#C9A84C]/10 px-4 py-3 text-sm leading-5 text-[#E5CB78]"
      : "rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm leading-5 text-red-100";
  return (
    <p aria-live="polite" className={classes} id={id}>
      {children}
    </p>
  );
}

type RegistrationField =
  | "name"
  | "email"
  | "challengeCode"
  | "password"
  | "passwordConfirmation"
  | "form";
type FieldError = { field: RegistrationField; message: string };

function validateRegistration(form: {
  name: string;
  email: string;
  challengeCode: string;
  password: string;
  passwordConfirmation: string;
}): FieldError | null {
  if (!form.name.trim()) return { field: "name", message: "Informe seu nome." };
  if (!validEmail(form.email.trim())) {
    return { field: "email", message: "Informe um e-mail v\u00e1lido." };
  }
  if (!form.challengeCode.trim()) {
    return { field: "challengeCode", message: "Informe o C\u00f3digo do Desafio." };
  }
  if (form.password.length < 8) {
    return { field: "password", message: "Crie uma senha com pelo menos 8 caracteres." };
  }
  if (form.password !== form.passwordConfirmation) {
    return { field: "passwordConfirmation", message: "As senhas n\u00e3o conferem." };
  }
  return null;
}

function fieldErrorId(error: FieldError | null, field: RegistrationField, id: string) {
  return error && (error.field === field || error.field === "form") ? id : undefined;
}

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function recoveryRedirectUrl() {
  const currentOrigin = window.location.origin;
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!configured) return currentOrigin + "/?auth=recovery";
  try {
    const configuredOrigin = new URL(configured).origin;
    return (configuredOrigin === currentOrigin ? configuredOrigin : currentOrigin) + "/?auth=recovery";
  } catch {
    return currentOrigin + "/?auth=recovery";
  }
}

function recoveryUrlError() {
  if (typeof window === "undefined") return null;
  const search = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  return search.get("error") || hash.get("error") ? expiredLinkMessage() : null;
}

function expiredLinkMessage() {
  return "Este link de recupera\u00e7\u00e3o \u00e9 inv\u00e1lido ou expirou. Solicite um novo link para continuar.";
}

function getDisplayName(metadata: unknown) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return undefined;
  const record = metadata as Record<string, unknown>;
  const value = record.name ?? record.full_name;
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}
