"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { BrandLogo } from "@/components/BrandLogo";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export default function SetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (password.length < 8) {
      setError("Crie uma senha com pelo menos 8 caracteres.");
      return;
    }

    if (password !== passwordConfirmation) {
      setError("As senhas nao conferem.");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session?.access_token) {
        setError("Seu link expirou ou e invalido. Solicite um novo acesso.");
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        setError("Nao foi possivel salvar sua senha. Solicite um novo link e tente novamente.");
        return;
      }

      await fetch("/api/customer-access/complete-first-access", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
      });

      setMessage("Senha cadastrada com sucesso. Redirecionando...");
      router.replace("/");
    } catch {
      setError("Nao foi possivel concluir seu primeiro acesso agora.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0D0D0D] px-4 py-10 text-[#F7F5EF]">
      <section className="w-full max-w-[520px] rounded-[30px] border border-white/10 bg-[#151515] p-6 shadow-2xl shadow-black/30 sm:p-10">
        <div className="flex justify-center">
          <BrandLogo height={72} width={240} variant="horizontal" />
        </div>
        <h1 className="mt-8 text-center text-3xl font-bold leading-tight">
          Crie sua senha de acesso
        </h1>
        <p className="mt-3 text-center text-sm leading-6 text-[#A7A7A7]">
          Use uma senha segura para entrar no Produto Pronto sempre que quiser.
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Nova senha</span>
            <input
              className="h-[56px] w-full rounded-2xl border border-white/10 bg-white/[.055] px-4 text-base outline-none transition placeholder:text-[#9C9892] focus:border-[#C9A84C] focus:ring-4 focus:ring-[#C9A84C]/15"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Digite sua nova senha"
              type="password"
              value={password}
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Confirmar senha</span>
            <input
              className="h-[56px] w-full rounded-2xl border border-white/10 bg-white/[.055] px-4 text-base outline-none transition placeholder:text-[#9C9892] focus:border-[#C9A84C] focus:ring-4 focus:ring-[#C9A84C]/15"
              onChange={(event) => setPasswordConfirmation(event.target.value)}
              placeholder="Repita a nova senha"
              type="password"
              value={passwordConfirmation}
            />
          </label>

          {error ? (
            <p className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {error}
            </p>
          ) : null}

          {message ? (
            <p className="rounded-2xl border border-[#C9A84C]/25 bg-[#C9A84C]/10 px-4 py-3 text-sm text-[#E5CB78]">
              {message}
            </p>
          ) : null}

          <button
            className="h-[56px] w-full rounded-2xl bg-[linear-gradient(135deg,#E5CB78_0%,#C9A84C_58%,#B98C2D_100%)] px-5 text-sm font-bold text-[#0D0D0D] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Salvando..." : "Salvar senha e entrar"}
          </button>
        </form>
      </section>
    </main>
  );
}
