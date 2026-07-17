"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { BrandLogo } from "@/components/BrandLogo";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [challengeCode, setChallengeCode] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    async function redirectAuthenticatedUser() {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data } = await supabase.auth.getSession();

        if (active && data.session) {
          router.replace("/");
        }
      } catch {
        // The form remains available when the public Supabase client is unavailable.
      }
    }

    void redirectAuthenticatedUser();

    return () => {
      active = false;
    };
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const validationError = validateRegistrationForm({
      challengeCode,
      email,
      name,
      password,
      passwordConfirmation,
    });

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengeCode,
          email: normalizedEmail,
          name: name.trim(),
          password,
          passwordConfirmation,
        }),
      });
      const payload = (await response.json()) as { error?: string; ok?: boolean };

      if (!response.ok || !payload.ok) {
        setError(payload.error ?? "N\u00e3o foi poss\u00edvel criar sua conta agora.");
        return;
      }

      const supabase = getSupabaseBrowserClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (signInError || !data.session) {
        setError("Sua conta foi criada. Entre com seu e-mail e senha para continuar.");
        return;
      }

      router.replace("/");
      router.refresh();
    } catch {
      setError("N\u00e3o foi poss\u00edvel criar sua conta agora. Tente novamente em instantes.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main
      className="relative min-h-screen w-full overflow-hidden bg-[#0D0D0D] bg-cover bg-[25%_center] bg-no-repeat md:bg-[left_center] md:bg-fixed"
      style={{
        backgroundImage:
          'linear-gradient(90deg, rgba(13,13,13,.10) 0%, rgba(13,13,13,.30) 45%, rgba(13,13,13,.65) 70%, rgba(13,13,13,.88) 100%), url("/brand/login-hero.png")',
      }}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[#0D0D0D]/35 md:hidden" />
      <style>{`
        @keyframes registration-card-in {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div className="relative z-10 grid min-h-screen w-full grid-cols-1 items-center gap-12 px-5 py-10 sm:px-8 md:grid-cols-[minmax(0,40fr)_minmax(420px,60fr)] md:gap-[6vw] md:px-[7vw] md:py-12">
        <div className="flex min-w-0 items-center">
          <div className="max-w-full lg:max-w-[580px] xl:max-w-[680px]">
            <h1 className="max-w-full text-[2.5rem] font-bold leading-[1.08] tracking-normal text-white sm:text-[2.625rem] lg:max-w-[580px] lg:text-[2.875rem] lg:leading-[1.06] xl:max-w-[680px] xl:text-[3.375rem]">
              Transforme seu conhecimento
              <br />
              em um <span className="text-accent">produto digital.</span>
            </h1>
          </div>
        </div>

        <div className="flex w-full items-center justify-center md:justify-end">
          <form
            className="w-full max-w-[540px] rounded-[28px] border border-white/10 p-6 text-[#F7F5EF] shadow-[inset_0_1px_0_rgba(255,255,255,.06),0_30px_80px_rgba(0,0,0,.42)] backdrop-blur-[26px] sm:p-9 lg:p-[42px_44px]"
            onSubmit={handleSubmit}
            style={{
              WebkitBackdropFilter: "blur(26px)",
              animation: "registration-card-in 520ms ease-out both",
              background: "linear-gradient(180deg, rgba(26,26,26,.78) 0%, rgba(14,14,14,.88) 100%)",
            }}
          >
            <div className="mb-6 flex justify-center overflow-visible">
              <div className="flex sm:hidden">
                <BrandLogo height={58} width={196} variant="horizontal" />
              </div>
              <div className="hidden sm:flex">
                <BrandLogo height={68} width={228} variant="horizontal" />
              </div>
            </div>

            <h2 className="text-center text-[2rem] font-bold leading-[1.1] text-[#F7F5EF]">
              Crie <span className="text-accent">sua conta</span>
            </h2>
            <p className="mt-3 text-center text-sm leading-6 text-[#B0ABA4]">
              {"Use o C\u00f3digo do Desafio dispon\u00edvel na primeira aula."}
            </p>

            <div className="mt-7 grid gap-4">
              <RegistrationField
                autoComplete="name"
                label="Nome"
                onChange={setName}
                placeholder={"Como voc\u00ea quer ser chamado?"}
                value={name}
              />
              <RegistrationField
                autoComplete="email"
                label="E-mail"
                onChange={setEmail}
                placeholder="seuemail@exemplo.com"
                type="email"
                value={email}
              />
              <RegistrationField
                autoComplete="off"
                label={"C\u00f3digo do Desafio"}
                onChange={setChallengeCode}
                placeholder={"Digite o c\u00f3digo da primeira aula"}
                type="password"
                value={challengeCode}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <RegistrationField
                  autoComplete="new-password"
                  label="Senha"
                  onChange={setPassword}
                  placeholder={"M\u00ednimo de 8 caracteres"}
                  type="password"
                  value={password}
                />
                <RegistrationField
                  autoComplete="new-password"
                  label="Confirmar senha"
                  onChange={setPasswordConfirmation}
                  placeholder="Repita sua senha"
                  type="password"
                  value={passwordConfirmation}
                />
              </div>

              {error ? (
                <p className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm leading-5 text-red-100">
                  {error}
                </p>
              ) : null}
            </div>

            <button
              className="mt-6 h-[58px] w-full rounded-[14px] bg-[linear-gradient(135deg,#E5CB78_0%,#C9A84C_58%,#B98C2D_100%)] px-5 text-sm font-bold text-[#0D0D0D] shadow-lg shadow-[#C99A33]/10 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(201,154,51,.30)] focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:ring-offset-2 focus:ring-offset-[#111111] disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Criando sua conta..." : "Criar minha conta"}
            </button>

            <p className="mt-6 text-center text-sm text-[#A9A49D]">
              {"J\u00e1 possui uma conta? "}
              <Link
                className="font-semibold text-[#C9A84C] transition hover:text-[#E5CB78]"
                href="/"
              >
                Entrar
              </Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}

function RegistrationField({
  autoComplete,
  label,
  onChange,
  placeholder,
  type = "text",
  value,
}: {
  autoComplete: string;
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: "email" | "password" | "text";
  value: string;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-sm font-semibold text-[#F7F5EF]">{label}</span>
      <input
        autoComplete={autoComplete}
        className="h-[56px] w-full rounded-[14px] border border-white/10 bg-white/[.055] px-4 text-base text-[#F7F5EF] outline-none transition placeholder:text-[#9C9892] focus:border-[rgba(201,168,76,.75)] focus:shadow-[0_0_0_3px_rgba(201,168,76,.12)]"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        value={value}
      />
    </label>
  );
}

function validateRegistrationForm({
  challengeCode,
  email,
  name,
  password,
  passwordConfirmation,
}: {
  challengeCode: string;
  email: string;
  name: string;
  password: string;
  passwordConfirmation: string;
}) {
  if (!name.trim()) return "Informe seu nome.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return "Informe um e-mail v\u00e1lido.";
  }
  if (!challengeCode.trim()) return "Informe o C\u00f3digo do Desafio.";
  if (password.length < 8) return "Crie uma senha com pelo menos 8 caracteres.";
  if (password !== passwordConfirmation) return "As senhas n\u00e3o conferem.";
  return null;
}
