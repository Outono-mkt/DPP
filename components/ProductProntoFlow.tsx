"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase";
import type { ProductGenerationInput, ProductGenerationResult } from "@/types";

type Step = "access" | "onboarding" | "loading" | "result";

type QuestionOption = {
  label: string;
  value: string;
};

type Question = {
  id: keyof OnboardingAnswers;
  title: string;
  helper: string;
  kind: "text" | "options";
  maxLength?: number;
  examples?: string[];
  options?: QuestionOption[];
};

type OnboardingAnswers = {
  skill: string;
  audience: string;
  audiencePain: string;
  transformation: string;
  preferredFormat: string;
  experienceLevel: string;
};

type ResultBlock = {
  title: string;
  eyebrow: string;
  content: string | string[];
};

const questions: Question[] = [
  {
    id: "skill",
    title: "O que voce sabe fazer bem?",
    helper:
      "Pode ser uma habilidade profissional, algo que voce aprendeu na vida ou um problema que voce ja resolveu.",
    kind: "text",
    maxLength: 150,
    examples: [
      "Organizar financas pessoais",
      "Ensinar ingles para criancas",
      "Gestao de pequenas empresas",
      "Cuidar da saude e bem-estar",
    ],
  },
  {
    id: "audience",
    title: "Para quem voce quer ajudar?",
    helper: "Escolha a opcao que mais se aproxima do publico que voce quer atender.",
    kind: "options",
    options: [
      { label: "Maes", value: "Maes" },
      { label: "Profissionais que querem renda extra", value: "Profissionais que querem renda extra" },
      { label: "Pequenos empreendedores", value: "Pequenos empreendedores" },
      { label: "Pessoas endividadas", value: "Pessoas endividadas" },
      { label: "Jovens iniciantes", value: "Jovens iniciantes" },
      { label: "Outro", value: "Outro" },
    ],
  },
  {
    id: "audiencePain",
    title: "Qual e a maior dor dessa pessoa?",
    helper: "O que ela perde, sofre ou teme por nao ter o conhecimento que voce tem?",
    kind: "text",
    maxLength: 200,
    examples: [
      "Gasta mais do que ganha e nao consegue sair das dividas",
      "Quer empreender mas nao sabe por onde comecar",
      "Nao consegue aprender ingles com metodos tradicionais",
    ],
  },
  {
    id: "transformation",
    title: "Qual transformacao voce entrega?",
    helper: "Complete a frase: depois de aprender comigo, meu cliente vai conseguir...",
    kind: "text",
    maxLength: 200,
    examples: [
      "Organizar as financas e guardar dinheiro todo mes",
      "Criar e vender o primeiro produto digital",
      "Falar ingles no trabalho sem ter vergonha",
    ],
  },
  {
    id: "preferredFormat",
    title: "Como voce prefere entregar esse conhecimento?",
    helper: "Escolha o formato mais natural para o seu produto.",
    kind: "options",
    options: [
      { label: "Video aulas gravadas", value: "Video aulas gravadas" },
      { label: "E-book ou guia em PDF", value: "E-book ou guia em PDF" },
      { label: "Checklist + templates prontos", value: "Checklist + templates prontos" },
      { label: "Ferramenta ou sistema", value: "Ferramenta ou sistema" },
      { label: "Deixa a IA decidir", value: "Deixa a IA decidir o melhor formato" },
    ],
  },
  {
    id: "experienceLevel",
    title: "Qual e o seu nivel de experiencia com infoprodutos?",
    helper: "Isso ajuda a ajustar a complexidade da recomendacao.",
    kind: "options",
    options: [
      { label: "Nunca criei nada", value: "Nunca criei nada" },
      { label: "Ja tentei mas nao vendi", value: "Ja tentei mas nao vendi" },
      { label: "Ja vendi mas quero melhorar", value: "Ja vendi mas quero melhorar" },
    ],
  },
];

const initialAnswers: OnboardingAnswers = {
  skill: "",
  audience: "",
  audiencePain: "",
  transformation: "",
  preferredFormat: "",
  experienceLevel: "",
};

const loadingPhrases = [
  "Analisando seu conhecimento...",
  "Identificando oportunidades de mercado...",
  "Desenhando a estrutura do seu produto...",
  "Criando sugestoes de nome...",
  "Quase pronto...",
];

export function ProductProntoFlow() {
  const [step, setStep] = useState<Step>("access");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>(initialAnswers);
  const [loadingIndex, setLoadingIndex] = useState(0);
  const [copiedBlock, setCopiedBlock] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generationResult, setGenerationResult] = useState<ProductGenerationResult | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const resetFlowToAccess = useCallback(() => {
    setAnswers(initialAnswers);
    setCurrentQuestion(0);
    setCopiedBlock(null);
    setGenerationError(null);
    setGenerationResult(null);
    setLoginError(null);
    setUserEmail(null);
    setStep("access");
  }, []);

  useEffect(() => {
    let active = true;

    async function checkSession() {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data } = await supabase.auth.getSession();

        if (!active) {
          return;
        }

        const email = data.session?.user.email ?? null;
        setUserEmail(email);
        setStep(email ? "onboarding" : "access");
        setIsCheckingSession(false);
      } catch {
        if (!active) {
          return;
        }

        setIsCheckingSession(false);
        setUserEmail(null);
        setStep("access");
      }
    }

    try {
      const supabase = getSupabaseBrowserClient();
      const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
        const email = session?.user.email ?? null;
        setUserEmail(email);

        if (!email) {
          resetFlowToAccess();
        }
      });

      void checkSession();

      return () => {
        active = false;
        subscription.subscription.unsubscribe();
      };
    } catch {
      void checkSession();
    }
  }, [resetFlowToAccess]);

  useEffect(() => {
    if (step !== "loading") {
      return;
    }

    let active = true;
    const phraseTimer = window.setInterval(() => {
      setLoadingIndex((index) => (index + 1) % loadingPhrases.length);
    }, 900);

    generateProduct(answers)
      .then((result) => {
        if (!active) {
          return;
        }

        setGenerationResult(result);
        setStep("result");
      })
      .catch(() => {
        if (!active) {
          return;
        }

        setGenerationError(
          "Nao foi possivel gerar seu produto agora. Revise suas respostas e tente novamente.",
        );
        setStep("result");
      });

    return () => {
      active = false;
      window.clearInterval(phraseTimer);
    };
  }, [answers, step]);

  const progress = useMemo(
    () => Math.round(((currentQuestion + 1) / questions.length) * 100),
    [currentQuestion],
  );

  function updateAnswer(id: keyof OnboardingAnswers, value: string) {
    setAnswers((current) => ({ ...current, [id]: value }));
  }

  async function enterExperience(email: string, password: string) {
    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.session?.user.email) {
        setLoginError("Nao encontramos esse acesso. Confira o e-mail e a senha enviados apos a compra.");
        return;
      }

      setUserEmail(data.session.user.email);
      setStep("onboarding");
    } catch {
      setLoginError("Nao encontramos esse acesso. Confira o e-mail e a senha enviados apos a compra.");
    } finally {
      setIsLoggingIn(false);
    }
  }

  function goBack() {
    setCurrentQuestion((current) => Math.max(current - 1, 0));
  }

  function goForward() {
    if (currentQuestion === questions.length - 1) {
      setLoadingIndex(0);
      setGenerationError(null);
      setGenerationResult(null);
      setStep("loading");
      return;
    }

    setCurrentQuestion((current) => current + 1);
  }

  function restart() {
    setAnswers(initialAnswers);
    setCurrentQuestion(0);
    setCopiedBlock(null);
    setGenerationError(null);
    setGenerationResult(null);
    setStep("onboarding");
  }

  async function signOut() {
    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
    } finally {
      resetFlowToAccess();
    }
  }

  async function copyBlock(block: ResultBlock) {
    const text = Array.isArray(block.content)
      ? `${block.eyebrow}\n${block.title}\n${block.content.join("\n")}`
      : `${block.eyebrow}\n${block.title}\n${block.content}`;

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      setCopiedBlock(block.eyebrow);
      window.setTimeout(() => setCopiedBlock(null), 1600);
    }
  }

  if (isCheckingSession) {
    return (
      <main className="min-h-screen bg-background px-5 py-8 text-foreground">
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[600px] items-center justify-center">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-accent">
            Produto Pronto
          </p>
        </div>
      </main>
    );
  }

  const isAuthenticated = Boolean(userEmail);

  return (
    <main className="min-h-screen bg-background px-5 py-8 text-foreground">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[600px] flex-col justify-center">
        {isAuthenticated ? (
          <div className="mb-6 flex items-center justify-between gap-4 text-xs text-white/50">
            <span className="truncate">{userEmail}</span>
            <button
              className="font-medium text-white/60 underline decoration-white/20 underline-offset-4 transition hover:text-accent"
              onClick={signOut}
              type="button"
            >
              Sair
            </button>
          </div>
        ) : null}

        {!isAuthenticated && (
          <AccessScreen
            error={loginError}
            isSubmitting={isLoggingIn}
            onEnter={enterExperience}
          />
        )}
        {isAuthenticated && step === "onboarding" && (
          <OnboardingScreen
            answers={answers}
            currentQuestion={currentQuestion}
            onBack={goBack}
            onForward={goForward}
            onUpdateAnswer={updateAnswer}
            progress={progress}
          />
        )}
        {isAuthenticated && step === "loading" && (
          <LoadingScreen phrase={loadingPhrases[loadingIndex]} />
        )}
        {isAuthenticated && step === "result" && (
          <ResultScreen
            copiedBlock={copiedBlock}
            error={generationError}
            onCopyBlock={copyBlock}
            onRestart={restart}
            result={generationResult}
          />
        )}
      </div>
    </main>
  );
}

async function generateProduct(
  answers: ProductGenerationInput,
): Promise<ProductGenerationResult> {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(answers),
  });

  if (!response.ok) {
    throw new Error("Product generation failed.");
  }

  return response.json() as Promise<ProductGenerationResult>;
}

function AccessScreen({
  error,
  isSubmitting,
  onEnter,
}: {
  error: string | null;
  isSubmitting: boolean;
  onEnter: (email: string, password: string) => Promise<void>;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <section className="w-full">
      <div className="mb-10 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-accent">
          Produto Pronto
        </p>
        <h1 className="mt-5 text-4xl font-semibold leading-tight text-foreground">
          Entre para desenhar seu primeiro produto digital.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-white/66">
          Use o e-mail da compra e a senha enviada apos a confirmacao do pagamento.
        </p>
      </div>

      <form
        className="space-y-4 rounded-lg border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-black/30"
        onSubmit={(event) => {
          event.preventDefault();
          void onEnter(email, password);
        }}
      >
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-white/78">E-mail</span>
          <input
            className="h-12 w-full rounded-md border border-white/10 bg-black/30 px-4 text-base text-white outline-none transition focus:border-accent"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="seuemail@exemplo.com"
            type="email"
            value={email}
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-white/78">Senha</span>
          <input
            className="h-12 w-full rounded-md border border-white/10 bg-black/30 px-4 text-base text-white outline-none transition focus:border-accent"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Senha enviada por e-mail"
            type="password"
            value={password}
          />
        </label>

        {error ? (
          <p className="rounded-md border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm leading-5 text-red-100">
            {error}
          </p>
        ) : null}

        <button
          className="h-12 w-full rounded-md bg-accent px-5 text-sm font-bold uppercase tracking-[0.16em] text-[#0d0d0d] transition hover:bg-[#d8b95d] focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-55"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </section>
  );
}

function OnboardingScreen({
  answers,
  currentQuestion,
  onBack,
  onForward,
  onUpdateAnswer,
  progress,
}: {
  answers: OnboardingAnswers;
  currentQuestion: number;
  onBack: () => void;
  onForward: () => void;
  onUpdateAnswer: (id: keyof OnboardingAnswers, value: string) => void;
  progress: number;
}) {
  const question = questions[currentQuestion];
  const value = answers[question.id];
  const canContinue = value.trim().length > 0;

  return (
    <section className="w-full">
      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between text-xs font-medium uppercase tracking-[0.18em] text-white/54">
          <span>
            Pergunta {currentQuestion + 1} de {questions.length}
          </span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-accent transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-black/30">
        <h2 className="text-2xl font-semibold leading-tight text-white">{question.title}</h2>
        <p className="mt-3 text-sm leading-6 text-white/64">{question.helper}</p>

        <div className="mt-6">
          {question.kind === "text" ? (
            <TextQuestion
              examples={question.examples ?? []}
              maxLength={question.maxLength}
              onChange={(nextValue) => onUpdateAnswer(question.id, nextValue)}
              value={value}
            />
          ) : (
            <div className="space-y-3">
              <OptionQuestion
                onChange={(nextValue) => onUpdateAnswer(question.id, nextValue)}
                options={question.options ?? []}
                value={value.startsWith("Outro:") ? "Outro" : value}
              />
              {question.id === "audience" && (value === "Outro" || value.startsWith("Outro:")) ? (
                <input
                  className="h-11 w-full rounded-md border border-white/10 bg-black/30 px-4 text-sm text-white outline-none transition focus:border-accent"
                  onChange={(event) => onUpdateAnswer(question.id, `Outro: ${event.target.value}`)}
                  placeholder="Descreva seu publico"
                  value={value.startsWith("Outro:") ? value.replace("Outro: ", "") : ""}
                />
              ) : null}
            </div>
          )}
        </div>

        <div className="mt-8 flex gap-3">
          <button
            className="h-11 flex-1 rounded-md border border-white/12 px-4 text-sm font-semibold text-white/78 transition hover:border-white/26 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
            disabled={currentQuestion === 0}
            onClick={onBack}
            type="button"
          >
            Voltar
          </button>
          <button
            className="h-11 flex-1 rounded-md bg-accent px-4 text-sm font-bold uppercase tracking-[0.14em] text-[#0d0d0d] transition hover:bg-[#d8b95d] disabled:cursor-not-allowed disabled:opacity-45"
            disabled={!canContinue}
            onClick={onForward}
            type="button"
          >
            {currentQuestion === questions.length - 1 ? "Gerar meu produto" : "Continuar"}
          </button>
        </div>
      </div>
    </section>
  );
}

function TextQuestion({
  examples,
  maxLength,
  onChange,
  value,
}: {
  examples: string[];
  maxLength?: number;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <div className="space-y-4">
      <textarea
        className="min-h-32 w-full resize-none rounded-md border border-white/10 bg-black/30 px-4 py-3 text-base leading-6 text-white outline-none transition focus:border-accent"
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Escreva sua resposta aqui"
        value={value}
      />
      {maxLength ? (
        <p className="text-right text-xs text-white/42">
          {value.length}/{maxLength}
        </p>
      ) : null}

      <div className="grid gap-2">
        {examples.map((example) => (
          <button
            className="rounded-md border border-white/10 px-3 py-2 text-left text-sm text-white/72 transition hover:border-accent/70 hover:text-white"
            key={example}
            onClick={() => onChange(example)}
            type="button"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}

function OptionQuestion({
  onChange,
  options,
  value,
}: {
  onChange: (value: string) => void;
  options: QuestionOption[];
  value: string;
}) {
  return (
    <div className="grid gap-3">
      {options.map((option) => {
        const selected = option.value === value;

        return (
          <button
            className={`rounded-md border px-4 py-3 text-left text-sm font-medium transition ${
              selected
                ? "border-accent bg-accent/12 text-white"
                : "border-white/10 bg-black/20 text-white/72 hover:border-accent/70 hover:text-white"
            }`}
            key={option.value}
            onClick={() => onChange(option.value)}
            type="button"
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function LoadingScreen({ phrase }: { phrase: string }) {
  return (
    <section className="w-full text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-accent">
        Produto Pronto
      </p>
      <div className="mx-auto mt-10 h-16 w-16 rounded-full border border-accent/20 border-t-accent animate-spin" />
      <h2 className="mt-8 text-2xl font-semibold text-white">Criando seu produto</h2>
      <p className="mt-3 min-h-6 text-sm text-white/64">{phrase}</p>
    </section>
  );
}

function ResultScreen({
  copiedBlock,
  error,
  onCopyBlock,
  onRestart,
  result,
}: {
  copiedBlock: string | null;
  error: string | null;
  onCopyBlock: (block: ResultBlock) => void;
  onRestart: () => void;
  result: ProductGenerationResult | null;
}) {
  const resultBlocks = result ? productResultToBlocks(result) : [];

  return (
    <section className="w-full py-6">
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-accent">
            Resultado
          </p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight text-white">
            Seu produto esta desenhado.
          </h1>
        </div>
        <button
          className="text-left text-sm font-medium text-white/58 underline decoration-white/20 underline-offset-4 transition hover:text-accent"
          onClick={onRestart}
          type="button"
        >
          Quero recomecar com um produto diferente
        </button>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-400/20 bg-red-500/10 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-red-200">
            Geracao interrompida
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-white">
            Nao conseguimos gerar seu produto agora.
          </h2>
          <p className="mt-3 text-sm leading-6 text-white/68">{error}</p>
          <button
            className="mt-5 h-11 rounded-md bg-accent px-4 text-sm font-bold uppercase tracking-[0.12em] text-[#0d0d0d] transition hover:bg-[#d8b95d]"
            onClick={onRestart}
            type="button"
          >
            Tentar novamente
          </button>
        </div>
      ) : null}

      {!error && result ? (
        <div className="space-y-4">
          {resultBlocks.map((block) => (
          <article
            className="rounded-lg border border-white/10 bg-white/[0.045] p-5 shadow-xl shadow-black/20"
            key={block.eyebrow}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">
                  {block.eyebrow}
                </p>
                <h2 className="mt-2 text-xl font-semibold leading-snug text-white">
                  {block.title}
                </h2>
              </div>
              <button
                className="rounded-md border border-white/12 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/70 transition hover:border-accent hover:text-accent"
                onClick={() => onCopyBlock(block)}
                type="button"
              >
                {copiedBlock === block.eyebrow ? "Copiado" : "Copiar"}
              </button>
            </div>

            {Array.isArray(block.content) ? (
              <ul className="mt-4 space-y-2 text-sm leading-6 text-white/68">
                {block.content.map((item) => (
                  <li className="rounded-md bg-black/20 px-3 py-2" key={item}>
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm leading-6 text-white/68">{block.content}</p>
            )}
          </article>
          ))}
        </div>
      ) : null}

      {!error && result ? (
        <div className="sticky bottom-4 mt-6 grid gap-3 rounded-lg border border-white/10 bg-[#111]/95 p-3 shadow-2xl shadow-black/40 backdrop-blur sm:grid-cols-2">
        <button
          className="h-11 rounded-md bg-accent px-4 text-sm font-bold uppercase tracking-[0.12em] text-[#0d0d0d] transition hover:bg-[#d8b95d]"
          onClick={() => window.alert("PDF real sera implementado em uma etapa futura.")}
          type="button"
        >
          Salvar meu resultado em PDF
        </button>
        <button
          className="h-11 rounded-md border border-white/12 px-4 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:border-accent hover:text-accent"
          onClick={() => window.alert("WhatsApp sera conectado em uma etapa futura.")}
          type="button"
        >
          Falar com Gabriel no WhatsApp
        </button>
        </div>
      ) : null}
    </section>
  );
}

function productResultToBlocks(result: ProductGenerationResult): ResultBlock[] {
  return [
    {
      eyebrow: "Seu Nicho",
      title: "Seu produto vai atender",
      content: result.nicho,
    },
    {
      eyebrow: "A Ideia do Produto",
      title: "Seu produto sera",
      content: result.ideia,
    },
    {
      eyebrow: "Sugestoes de Nome",
      title: "Escolha um nome ou use como inspiracao",
      content: result.nomes,
    },
    {
      eyebrow: "A Promessa Principal",
      title: "O que seu produto promete",
      content: result.promessa,
    },
    {
      eyebrow: "Estrutura do Conteudo",
      title: "Seu produto tera a seguinte estrutura",
      content: result.estrutura,
    },
    {
      eyebrow: "Preco Sugerido",
      title: "Preco ideal para lancamento",
      content: result.preco,
    },
    {
      eyebrow: "Proximo Passo",
      title: "Seu produto esta desenhado",
      content: result.proximo_passo,
    },
  ];
}
