"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase";
import type {
  DiscoveryInput,
  DiscoveryResult,
  FinalGenerationInput,
  ProductResult,
  SavedProductSummary,
} from "@/types";

type Step = "access" | "dashboard" | "creation" | "loading" | "result" | "savedResult";
type LoadingMode = "discovery" | "product";

type QuestionOption = {
  label: string;
  value: string;
};

type OnboardingAnswers = {
  profile: string;
  targetAudienceDescription: string;
  selectedAudience: string;
  selectedPain: string;
  selectedTransformation: string;
  experienceLevel: string;
  selectedFormat: string;
};

type CustomAnswers = {
  audience: string;
  pain: string;
  transformation: string;
};

type ResultBlock = {
  title: string;
  eyebrow: string;
  content: string | string[];
  action?: "whatsapp";
};

const CUSTOM_AUDIENCE = "__custom_audience__";
const CUSTOM_PAIN = "__custom_pain__";
const CUSTOM_TRANSFORMATION = "__custom_transformation__";
const totalOnboardingSteps = 7;

const initialAnswers: OnboardingAnswers = {
  profile: "",
  targetAudienceDescription: "",
  selectedAudience: "",
  selectedPain: "",
  selectedTransformation: "",
  experienceLevel: "",
  selectedFormat: "",
};

const initialCustomAnswers: CustomAnswers = {
  audience: "",
  pain: "",
  transformation: "",
};

const experienceOptions: QuestionOption[] = [
  { label: "Nunca criei nada", value: "Nunca criei nada" },
  { label: "Ja tentei mas nao vendi", value: "Ja tentei mas nao vendi" },
  { label: "Ja vendi e quero melhorar", value: "Ja vendi e quero melhorar" },
];

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
  const [customAnswers, setCustomAnswers] = useState<CustomAnswers>(initialCustomAnswers);
  const [discoveryResult, setDiscoveryResult] = useState<DiscoveryResult | null>(null);
  const [loadingIndex, setLoadingIndex] = useState(0);
  const [loadingMode, setLoadingMode] = useState<LoadingMode>("product");
  const [copiedBlock, setCopiedBlock] = useState<string | null>(null);
  const [flowError, setFlowError] = useState<string | null>(null);
  const [generationResult, setGenerationResult] = useState<ProductResult | null>(null);
  const [savedProducts, setSavedProducts] = useState<SavedProductSummary[]>([]);
  const [activeResultId, setActiveResultId] = useState<string | null>(null);
  const [persistenceMessage, setPersistenceMessage] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const resetCreationFlow = useCallback(() => {
    setAnswers(initialAnswers);
    setCustomAnswers(initialCustomAnswers);
    setCurrentQuestion(0);
    setDiscoveryResult(null);
    setCopiedBlock(null);
    setFlowError(null);
    setGenerationResult(null);
    setActiveResultId(null);
    setPersistenceMessage(null);
  }, []);

  const resetFlowToAccess = useCallback(() => {
    resetCreationFlow();
    setLoginError(null);
    setUserEmail(null);
    setSavedProducts([]);
    setHistoryError(null);
    setStep("access");
  }, [resetCreationFlow]);

  useEffect(() => {
    let active = true;

    async function checkSession() {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data } = await supabase.auth.getSession();

        if (!active) return;

        const email = data.session?.user.email ?? null;
        setUserEmail(email);
        setStep(email ? "dashboard" : "access");
        setIsCheckingSession(false);

        if (email) {
          void refreshSavedProducts();
        }
      } catch {
        if (!active) return;

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

        if (!email) resetFlowToAccess();
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
    if (step !== "loading") return;

    const phraseTimer = window.setInterval(() => {
      setLoadingIndex((index) => (index + 1) % loadingPhrases.length);
    }, 900);

    return () => window.clearInterval(phraseTimer);
  }, [step]);

  const progress = useMemo(
    () => Math.round(((currentQuestion + 1) / totalOnboardingSteps) * 100),
    [currentQuestion],
  );

  function updateAnswer(id: keyof OnboardingAnswers, value: string) {
    setAnswers((current) => ({ ...current, [id]: value }));
  }

  function updateCustomAnswer(id: keyof CustomAnswers, value: string) {
    setCustomAnswers((current) => ({ ...current, [id]: value }));
  }

  async function enterExperience(email: string, password: string) {
    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error || !data.session?.user.email) {
        setLoginError("Nao encontramos esse acesso. Confira o e-mail e a senha enviados apos a compra.");
        return;
      }

      setUserEmail(data.session.user.email);
      void refreshSavedProducts();
      setStep("dashboard");
    } catch {
      setLoginError("Nao encontramos esse acesso. Confira o e-mail e a senha enviados apos a compra.");
    } finally {
      setIsLoggingIn(false);
    }
  }

  function goBack() {
    setFlowError(null);
    setCurrentQuestion((current) => Math.max(current - 1, 0));
  }

  async function goForward() {
    setFlowError(null);

    if (currentQuestion === 1) {
      await discoverStrategicOptions();
      return;
    }

    if (currentQuestion === totalOnboardingSteps - 1) {
      await generateFinalProduct();
      return;
    }

    setCurrentQuestion((current) => current + 1);
  }

  async function discoverStrategicOptions() {
    setLoadingMode("discovery");
    setLoadingIndex(0);
    setStep("loading");

    try {
      const result = await requestDiscovery({
        profile: answers.profile,
        targetAudienceDescription: answers.targetAudienceDescription,
      });
      setDiscoveryResult(result);
      setCurrentQuestion(2);
      setStep("creation");
    } catch {
      setFlowError("Nao conseguimos gerar sugestoes agora. Revise suas respostas e tente novamente.");
      setStep("creation");
    }
  }

  async function generateFinalProduct() {
    setLoadingMode("product");
    setLoadingIndex(0);
    setGenerationResult(null);
    setActiveResultId(null);
    setPersistenceMessage(null);
    setStep("loading");

    try {
      const input = buildFinalGenerationInput(answers, customAnswers);
      const result = await requestProductGeneration(input);
      setGenerationResult(result);
      setStep("result");
      void saveGeneratedProduct(input, result);
    } catch {
      setFlowError("Nao foi possivel gerar seu produto agora. Revise suas respostas e tente novamente.");
      setStep("result");
    }
  }

  async function refreshSavedProducts() {
    try {
      setHistoryError(null);
      const products = await requestSavedProducts();
      setSavedProducts(products);
    } catch {
      setHistoryError("Nao foi possivel carregar seus produtos criados agora.");
    }
  }

  async function saveGeneratedProduct(input: FinalGenerationInput, result: ProductResult) {
    try {
      const savedProduct = await requestSaveProduct(input, result);
      setActiveResultId(savedProduct.id);
      setSavedProducts((current) => [savedProduct, ...current.filter((item) => item.id !== savedProduct.id)].slice(0, 2));
      setPersistenceMessage("Produto salvo automaticamente.");
    } catch (error) {
      setPersistenceMessage(
        error instanceof Error
          ? error.message
          : "Nao foi possivel salvar este produto automaticamente.",
      );
      void refreshSavedProducts();
    }
  }

  function viewSavedProduct(product: SavedProductSummary) {
    setGenerationResult(product.generated_result);
    setActiveResultId(product.id);
    setPersistenceMessage(null);
    setFlowError(null);
    setStep("savedResult");
  }

  function startNewProduct() {
    if (savedProducts.length >= 2) {
      setPersistenceMessage(
        "Você já criou seus 2 produtos disponíveis neste acesso. Para criar outro, exclua um produto antigo ou fale comigo.",
      );
      return;
    }

    resetCreationFlow();
    setStep("creation");
  }

  function backToDashboard() {
    resetCreationFlow();
    setStep("dashboard");
    void refreshSavedProducts();
  }

  async function downloadSavedProductPdf(productId: string) {
    setIsDownloadingPdf(true);

    try {
      await requestProductPdf(productId);
    } catch {
      setPersistenceMessage("Nao foi possivel gerar o PDF agora.");
    } finally {
      setIsDownloadingPdf(false);
    }
  }

  async function deleteSavedProduct(productId: string) {
    try {
      setPersistenceMessage(null);
      await requestDeleteProduct(productId);
      setSavedProducts((current) => current.filter((product) => product.id !== productId));

      if (activeResultId === productId) {
        setActiveResultId(null);
        setGenerationResult(null);
        setStep("dashboard");
      }
    } catch {
      setPersistenceMessage("Nao foi possivel excluir este produto agora.");
    }
  }

  async function downloadPdf() {
    if (!activeResultId) {
      setPersistenceMessage("Salve o produto antes de gerar o PDF.");
      return;
    }

    setIsDownloadingPdf(true);

    try {
      await requestProductPdf(activeResultId);
    } catch {
      setPersistenceMessage("Nao foi possivel gerar o PDF agora.");
    } finally {
      setIsDownloadingPdf(false);
    }
  }

  function restart() {
    startNewProduct();
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
          <AccessScreen error={loginError} isSubmitting={isLoggingIn} onEnter={enterExperience} />
        )}
        {isAuthenticated && step === "dashboard" && (
          <ProductsDashboard
            error={historyError}
            isDownloadingPdf={isDownloadingPdf}
            message={persistenceMessage}
            onCreateNew={startNewProduct}
            onDeleteProduct={deleteSavedProduct}
            onDownloadPdf={downloadSavedProductPdf}
            onViewProduct={viewSavedProduct}
            products={savedProducts}
          />
        )}
        {isAuthenticated && step === "creation" && (
          <OnboardingScreen
            answers={answers}
            currentQuestion={currentQuestion}
            customAnswers={customAnswers}
            discoveryResult={discoveryResult}
            error={flowError}
            onBack={goBack}
            onForward={goForward}
            onUpdateAnswer={updateAnswer}
            onUpdateCustomAnswer={updateCustomAnswer}
            progress={progress}
          />
        )}
        {isAuthenticated && step === "loading" && (
          <LoadingScreen mode={loadingMode} phrase={loadingPhrases[loadingIndex]} />
        )}
        {isAuthenticated && (step === "result" || step === "savedResult") && (
          <ResultScreen
            activeResultId={activeResultId}
            copiedBlock={copiedBlock}
            error={flowError}
            isDownloadingPdf={isDownloadingPdf}
            isSavedResult={step === "savedResult"}
            onCopyBlock={copyBlock}
            onBackToDashboard={backToDashboard}
            onDownloadPdf={downloadPdf}
            onRestart={restart}
            persistenceMessage={persistenceMessage}
            result={generationResult}
          />
        )}
      </div>
    </main>
  );
}

async function requestDiscovery(input: DiscoveryInput): Promise<DiscoveryResult> {
  const response = await fetch("/api/discovery", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) throw new Error("Discovery failed.");

  return response.json() as Promise<DiscoveryResult>;
}

async function requestProductGeneration(input: FinalGenerationInput): Promise<ProductResult> {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) throw new Error("Product generation failed.");

  return response.json() as Promise<ProductResult>;
}

async function requestSavedProducts(): Promise<SavedProductSummary[]> {
  const response = await fetch("/api/product-results", {
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Could not load saved products.");
  }

  const payload = (await response.json()) as { results: SavedProductSummary[] };
  return payload.results;
}

async function requestSaveProduct(
  input: FinalGenerationInput,
  result: ProductResult,
): Promise<SavedProductSummary> {
  const response = await fetch("/api/product-results", {
    method: "POST",
    headers: {
      ...(await getAuthHeaders()),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...input,
      generatedResult: result,
    }),
  });

  const payload = (await response.json()) as {
    error?: string;
    result?: SavedProductSummary;
  };

  if (!response.ok || !payload.result) {
    throw new Error(payload.error ?? "Nao foi possivel salvar este produto automaticamente.");
  }

  return payload.result;
}

async function requestProductPdf(resultId: string) {
  const response = await fetch(`/api/product-results/${resultId}/pdf`, {
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Could not generate PDF.");
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `produto-pronto-${resultId}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

async function requestDeleteProduct(resultId: string) {
  const response = await fetch(`/api/product-results/${resultId}`, {
    method: "DELETE",
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Could not delete product.");
  }
}

async function getAuthHeaders() {
  const supabase = getSupabaseBrowserClient();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  if (!token) {
    throw new Error("Missing user session.");
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

function buildFinalGenerationInput(
  answers: OnboardingAnswers,
  customAnswers: CustomAnswers,
): FinalGenerationInput {
  return {
    profile: answers.profile,
    targetAudienceDescription: answers.targetAudienceDescription,
    selectedAudience: resolveCustomValue(answers.selectedAudience, CUSTOM_AUDIENCE, customAnswers.audience),
    selectedPain: resolveCustomValue(answers.selectedPain, CUSTOM_PAIN, customAnswers.pain),
    selectedTransformation: resolveCustomValue(
      answers.selectedTransformation,
      CUSTOM_TRANSFORMATION,
      customAnswers.transformation,
    ),
    experienceLevel: answers.experienceLevel,
    selectedFormat: answers.selectedFormat,
  };
}

function resolveCustomValue(value: string, marker: string, customValue: string) {
  return value === marker ? customValue.trim() : value;
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
  customAnswers,
  discoveryResult,
  error,
  onBack,
  onForward,
  onUpdateAnswer,
  onUpdateCustomAnswer,
  progress,
}: {
  answers: OnboardingAnswers;
  currentQuestion: number;
  customAnswers: CustomAnswers;
  discoveryResult: DiscoveryResult | null;
  error: string | null;
  onBack: () => void;
  onForward: () => void;
  onUpdateAnswer: (id: keyof OnboardingAnswers, value: string) => void;
  onUpdateCustomAnswer: (id: keyof CustomAnswers, value: string) => void;
  progress: number;
}) {
  const canContinue = canContinueFromStep(currentQuestion, answers, customAnswers);

  return (
    <section className="w-full">
      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between text-xs font-medium uppercase tracking-[0.18em] text-white/54">
          <span>Etapa {currentQuestion + 1} de {totalOnboardingSteps}</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-accent transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-black/30">
        {renderOnboardingStep({
          answers,
          currentQuestion,
          customAnswers,
          discoveryResult,
          onUpdateAnswer,
          onUpdateCustomAnswer,
        })}

        {error ? (
          <p className="mt-5 rounded-md border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm leading-5 text-red-100">
            {error}
          </p>
        ) : null}

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
            onClick={() => void onForward()}
            type="button"
          >
            {currentQuestion === totalOnboardingSteps - 1 ? "Gerar meu produto" : "Continuar"}
          </button>
        </div>
      </div>
    </section>
  );
}

function renderOnboardingStep({
  answers,
  currentQuestion,
  customAnswers,
  discoveryResult,
  onUpdateAnswer,
  onUpdateCustomAnswer,
}: {
  answers: OnboardingAnswers;
  currentQuestion: number;
  customAnswers: CustomAnswers;
  discoveryResult: DiscoveryResult | null;
  onUpdateAnswer: (id: keyof OnboardingAnswers, value: string) => void;
  onUpdateCustomAnswer: (id: keyof CustomAnswers, value: string) => void;
}) {
  if (currentQuestion === 0) {
    return (
      <TextStep
        helper="Quanto mais detalhes voce der, melhor a IA vai transformar seu conhecimento em um produto."
        onChange={(value) => onUpdateAnswer("profile", value)}
        title="Quem e voce, qual sua profissao, o que voce faz bem e o que gostaria de ensinar?"
        value={answers.profile}
      />
    );
  }

  if (currentQuestion === 1) {
    return (
      <TextStep
        helper="Pode descrever uma pessoa, um grupo, uma situacao ou um tipo de cliente."
        onChange={(value) => onUpdateAnswer("targetAudienceDescription", value)}
        title="Quem voce gostaria de ajudar ou transformar com seu conhecimento?"
        value={answers.targetAudienceDescription}
      />
    );
  }

  if (currentQuestion === 2) {
    return (
      <CardStep
        customLabel="Nenhuma dessas. Quero descrever meu publico."
        customPlaceholder="Descreva seu publico com suas palavras"
        customValue={customAnswers.audience}
        helper="Escolha o caminho com mais potencial para o seu produto."
        items={(discoveryResult?.publicos ?? []).map((item) => ({
          title: item.titulo,
          description: `${item.descricao} ${item.porque_escolher}`,
          value: item.titulo,
        }))}
        marker={CUSTOM_AUDIENCE}
        onChange={(value) => onUpdateAnswer("selectedAudience", value)}
        onCustomChange={(value) => onUpdateCustomAnswer("audience", value)}
        selectedValue={answers.selectedAudience}
        title="Escolha seu melhor publico"
      />
    );
  }

  if (currentQuestion === 3) {
    return (
      <CardStep
        customLabel="Quero descrever a dor com minhas palavras."
        customPlaceholder="Descreva a dor principal"
        customValue={customAnswers.pain}
        helper="A dor certa deixa a promessa do produto mais clara e desejada."
        items={(discoveryResult?.dores ?? []).map((item) => ({
          title: item.titulo,
          description: `${item.descricao} Urgencia: ${item.urgencia}. Frase real: "${item.frases_reais[0]}"`,
          value: item.titulo,
        }))}
        marker={CUSTOM_PAIN}
        onChange={(value) => onUpdateAnswer("selectedPain", value)}
        onCustomChange={(value) => onUpdateCustomAnswer("pain", value)}
        selectedValue={answers.selectedPain}
        title="Escolha a dor principal"
      />
    );
  }

  if (currentQuestion === 4) {
    return (
      <CardStep
        customLabel="Quero descrever a transformacao com minhas palavras."
        customPlaceholder="Descreva a transformacao desejada"
        customValue={customAnswers.transformation}
        helper="Escolha o resultado que seu aluno mais gostaria de conquistar."
        items={(discoveryResult?.transformacoes ?? []).map((item) => ({
          title: item.titulo,
          description: `${item.descricao} Resultado final: ${item.resultado_final}`,
          value: item.titulo,
        }))}
        marker={CUSTOM_TRANSFORMATION}
        onChange={(value) => onUpdateAnswer("selectedTransformation", value)}
        onCustomChange={(value) => onUpdateCustomAnswer("transformation", value)}
        selectedValue={answers.selectedTransformation}
        title="Escolha a transformacao"
      />
    );
  }

  if (currentQuestion === 5) {
    return (
      <OptionsStep
        helper="Isso ajuda a ajustar a complexidade da recomendacao."
        onChange={(value) => onUpdateAnswer("experienceLevel", value)}
        options={experienceOptions}
        title="Voce ja criou algum produto digital antes?"
        value={answers.experienceLevel}
      />
    );
  }

  return (
    <CardStep
      helper="Analisando seu conhecimento e seu objetivo, estes sao os formatos com melhor encaixe para comecar rapido sem perder estrategia."
      items={(discoveryResult?.formatos ?? []).map((item) => ({
        title: item.nome,
        description: `${item.motivo} ${item.porque_esse_formato}`,
        value: item.nome,
      }))}
      onChange={(value) => onUpdateAnswer("selectedFormat", value)}
      selectedValue={answers.selectedFormat}
      title="Escolha o formato recomendado"
    />
  );
}

function canContinueFromStep(
  stepIndex: number,
  answers: OnboardingAnswers,
  customAnswers: CustomAnswers,
) {
  const valueByStep: Record<number, string> = {
    0: answers.profile,
    1: answers.targetAudienceDescription,
    2: resolveCustomValue(answers.selectedAudience, CUSTOM_AUDIENCE, customAnswers.audience),
    3: resolveCustomValue(answers.selectedPain, CUSTOM_PAIN, customAnswers.pain),
    4: resolveCustomValue(
      answers.selectedTransformation,
      CUSTOM_TRANSFORMATION,
      customAnswers.transformation,
    ),
    5: answers.experienceLevel,
    6: answers.selectedFormat,
  };

  return (valueByStep[stepIndex] ?? "").trim().length > 0;
}

function TextStep({
  helper,
  onChange,
  title,
  value,
}: {
  helper: string;
  onChange: (value: string) => void;
  title: string;
  value: string;
}) {
  return (
    <div>
      <h2 className="text-2xl font-semibold leading-tight text-white">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-white/64">{helper}</p>
      <textarea
        className="mt-6 min-h-40 w-full resize-none rounded-md border border-white/10 bg-black/30 px-4 py-3 text-base leading-6 text-white outline-none transition focus:border-accent"
        onChange={(event) => onChange(event.target.value)}
        placeholder="Escreva sua resposta aqui"
        value={value}
      />
    </div>
  );
}

function OptionsStep({
  helper,
  onChange,
  options,
  title,
  value,
}: {
  helper: string;
  onChange: (value: string) => void;
  options: QuestionOption[];
  title: string;
  value: string;
}) {
  return (
    <div>
      <h2 className="text-2xl font-semibold leading-tight text-white">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-white/64">{helper}</p>
      <OptionQuestion onChange={onChange} options={options} value={value} />
    </div>
  );
}

function CardStep({
  customLabel,
  customPlaceholder,
  customValue,
  helper,
  items,
  marker,
  onChange,
  onCustomChange,
  selectedValue,
  title,
}: {
  customLabel?: string;
  customPlaceholder?: string;
  customValue?: string;
  helper: string;
  items: Array<{ title: string; description: string; value: string }>;
  marker?: string;
  onChange: (value: string) => void;
  onCustomChange?: (value: string) => void;
  selectedValue: string;
  title: string;
}) {
  return (
    <div>
      <h2 className="text-2xl font-semibold leading-tight text-white">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-white/64">{helper}</p>
      <div className="mt-6 grid gap-3">
        {items.map((item) => (
          <ChoiceCard
            description={item.description}
            key={item.value}
            onClick={() => onChange(item.value)}
            selected={selectedValue === item.value}
            title={item.title}
          />
        ))}

        {customLabel && marker ? (
          <div className="space-y-3">
            <ChoiceCard
              description="Use esta opcao se nenhuma sugestao representar bem o que voce quer criar."
              onClick={() => onChange(marker)}
              selected={selectedValue === marker}
              title={customLabel}
            />
            {selectedValue === marker ? (
              <textarea
                className="min-h-28 w-full resize-none rounded-md border border-white/10 bg-black/30 px-4 py-3 text-sm leading-6 text-white outline-none transition focus:border-accent"
                onChange={(event) => onCustomChange?.(event.target.value)}
                placeholder={customPlaceholder}
                value={customValue ?? ""}
              />
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ChoiceCard({
  description,
  onClick,
  selected,
  title,
}: {
  description: string;
  onClick: () => void;
  selected: boolean;
  title: string;
}) {
  return (
    <button
      className={`rounded-md border px-4 py-3 text-left transition ${
        selected
          ? "border-accent bg-accent/12 text-white"
          : "border-white/10 bg-black/20 text-white/72 hover:border-accent/70 hover:text-white"
      }`}
      onClick={onClick}
      type="button"
    >
      <span className="block text-sm font-semibold text-white">{title}</span>
      <span className="mt-2 block text-sm leading-6 text-white/62">{description}</span>
    </button>
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
    <div className="mt-6 grid gap-3">
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

function LoadingScreen({ mode, phrase }: { mode: LoadingMode; phrase: string }) {
  return (
    <section className="w-full text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-accent">
        Produto Pronto
      </p>
      <div className="mx-auto mt-10 h-16 w-16 animate-spin rounded-full border border-accent/20 border-t-accent" />
      <h2 className="mt-8 text-2xl font-semibold text-white">
        {mode === "discovery" ? "Encontrando seus melhores caminhos" : "Criando seu produto"}
      </h2>
      <p className="mt-3 min-h-6 text-sm text-white/64">{phrase}</p>
    </section>
  );
}

function ProductsDashboard({
  error,
  isDownloadingPdf,
  message,
  onCreateNew,
  onDeleteProduct,
  onDownloadPdf,
  onViewProduct,
  products,
}: {
  error: string | null;
  isDownloadingPdf: boolean;
  message: string | null;
  onCreateNew: () => void;
  onDeleteProduct: (productId: string) => void;
  onDownloadPdf: (productId: string) => void;
  onViewProduct: (product: SavedProductSummary) => void;
  products: SavedProductSummary[];
}) {
  const reachedLimit = products.length >= 2;

  return (
    <section className="w-full py-6">
      <div className="mb-7">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-accent">
          Produto Pronto
        </p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight text-white">
          Meus Produtos
        </h1>
        <p className="mt-3 text-sm leading-6 text-white/64">
          Você pode criar até 2 produtos neste acesso.
        </p>
      </div>

      {error ? (
        <p className="mb-4 rounded-md border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm leading-5 text-red-100">
          {error}
        </p>
      ) : null}

      {message ? (
        <p className="mb-4 rounded-md border border-white/10 bg-white/[0.045] px-3 py-2 text-sm leading-5 text-white/68">
          {message}
        </p>
      ) : null}

      {reachedLimit ? (
        <p className="mb-4 rounded-md border border-accent/20 bg-accent/10 px-3 py-2 text-sm leading-5 text-white/72">
          Você já criou seus 2 produtos disponíveis neste acesso. Para criar outro, exclua um produto antigo ou fale comigo.
        </p>
      ) : null}

      <div className="space-y-4">
        {products.map((product) => (
          <article
            className="rounded-lg border border-white/10 bg-white/[0.045] p-5 shadow-xl shadow-black/20"
            key={product.id}
          >
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">
              {product.selected_format}
            </p>
            <h2 className="mt-2 text-xl font-semibold leading-snug text-white">
              {product.generated_result.ideia}
            </h2>
            <p className="mt-2 text-xs text-white/48">
              Criado em {formatDisplayDate(product.created_at)}
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <button
                className="h-10 rounded-md bg-accent px-3 text-xs font-bold uppercase tracking-[0.12em] text-[#0d0d0d] transition hover:bg-[#d8b95d]"
                onClick={() => onViewProduct(product)}
                type="button"
              >
                Visualizar
              </button>
              <button
                className="h-10 rounded-md border border-white/12 px-3 text-xs font-semibold uppercase tracking-[0.12em] text-white/70 transition hover:border-accent hover:text-accent disabled:opacity-45"
                disabled={isDownloadingPdf}
                onClick={() => onDownloadPdf(product.id)}
                type="button"
              >
                Baixar PDF
              </button>
              <button
                className="h-10 rounded-md border border-red-300/20 px-3 text-xs font-semibold uppercase tracking-[0.12em] text-red-100/80 transition hover:border-red-200 hover:text-red-50"
                onClick={() => onDeleteProduct(product.id)}
                type="button"
              >
                Excluir
              </button>
            </div>
          </article>
        ))}
      </div>

      {products.length === 0 ? (
        <div className="rounded-lg border border-white/10 bg-white/[0.045] p-5">
          <p className="text-sm leading-6 text-white/64">
            Você ainda não criou nenhum produto. Comece pelo primeiro e salve sua estratégia aqui.
          </p>
        </div>
      ) : null}

      {!reachedLimit ? (
        <button
          className="mt-6 h-12 w-full rounded-md bg-accent px-5 text-sm font-bold uppercase tracking-[0.16em] text-[#0d0d0d] transition hover:bg-[#d8b95d]"
          onClick={onCreateNew}
          type="button"
        >
          Criar novo produto
        </button>
      ) : null}
    </section>
  );
}

function ResultScreen({
  activeResultId,
  copiedBlock,
  error,
  isDownloadingPdf,
  isSavedResult,
  onCopyBlock,
  onBackToDashboard,
  onDownloadPdf,
  onRestart,
  persistenceMessage,
  result,
}: {
  activeResultId: string | null;
  copiedBlock: string | null;
  error: string | null;
  isDownloadingPdf: boolean;
  isSavedResult: boolean;
  onCopyBlock: (block: ResultBlock) => void;
  onBackToDashboard: () => void;
  onDownloadPdf: () => void;
  onRestart: () => void;
  persistenceMessage: string | null;
  result: ProductResult | null;
}) {
  const resultBlocks = result ? productResultToBlocks(result) : [];

  return (
    <section className="w-full py-6">
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-accent">
            {isSavedResult ? "Produto salvo" : "Resultado"}
          </p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight text-white">
            Seu produto esta desenhado.
          </h1>
        </div>
        <div className="flex flex-col gap-2 text-left sm:text-right">
          <button
            className="text-sm font-medium text-white/58 underline decoration-white/20 underline-offset-4 transition hover:text-accent"
            onClick={onBackToDashboard}
            type="button"
          >
            Voltar para Meus Produtos
          </button>
          {!isSavedResult ? (
            <button
              className="text-sm font-medium text-white/58 underline decoration-white/20 underline-offset-4 transition hover:text-accent"
              onClick={onRestart}
              type="button"
            >
              Quero recomecar com um produto diferente
            </button>
          ) : null}
        </div>
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

              {block.action === "whatsapp" ? (
                <button
                  className="mt-5 h-11 w-full rounded-md bg-accent px-4 text-sm font-bold uppercase tracking-[0.12em] text-[#0d0d0d] transition hover:bg-[#d8b95d]"
                  onClick={() => window.alert("WhatsApp sera conectado em uma etapa futura.")}
                  type="button"
                >
                  Quero construir esse produto com você
                </button>
              ) : null}
            </article>
          ))}
        </div>
      ) : null}

      {!error && result ? (
        <div className="sticky bottom-4 mt-6 rounded-lg border border-white/10 bg-[#111]/95 p-3 shadow-2xl shadow-black/40 backdrop-blur">
          <button
            className="h-11 w-full rounded-md bg-accent px-4 text-sm font-bold uppercase tracking-[0.12em] text-[#0d0d0d] transition hover:bg-[#d8b95d]"
            disabled={!activeResultId || isDownloadingPdf}
            onClick={onDownloadPdf}
            type="button"
          >
            {isDownloadingPdf ? "Gerando PDF..." : "Salvar meu resultado em PDF"}
          </button>
        </div>
      ) : null}

      {persistenceMessage ? (
        <p className="mt-4 rounded-md border border-white/10 bg-white/[0.045] px-3 py-2 text-sm leading-5 text-white/68">
          {persistenceMessage}
        </p>
      ) : null}

    </section>
  );
}

function formatDisplayDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function productResultToBlocks(result: ProductResult): ResultBlock[] {
  return [
    {
      eyebrow: "Oportunidade de Mercado",
      title: "Por que essa ideia faz sentido",
      content: result.oportunidade,
    },
    { eyebrow: "Nicho Validado", title: "Seu produto vai atender", content: result.nicho },
    { eyebrow: "Ideia do Produto", title: "Seu produto sera", content: result.ideia },
    {
      eyebrow: "Sugestoes de Nome",
      title: "Escolha um nome ou use como inspiracao",
      content: result.nomes,
    },
    { eyebrow: "A Promessa Principal", title: "O que seu produto promete", content: result.promessa },
    {
      eyebrow: "Beneficios que Voce Pode Vender",
      title: "Argumentos concretos para sua oferta",
      content: result.beneficios,
    },
    {
      eyebrow: "Perfis Ideais de Cliente",
      title: "Recortes de publico com maior potencial",
      content: result.perfis_clientes.map((profile) => `${profile.titulo}: ${profile.descricao}`),
    },
    {
      eyebrow: "Frases que seu Cliente Diria",
      title: "Como essa dor aparece na vida real",
      content: result.frases_cliente,
    },
    {
      eyebrow: "Estrutura do Conteudo",
      title: "Seu produto tera a seguinte estrutura",
      content: result.estrutura,
    },
    { eyebrow: "Preco Sugerido", title: "Preco ideal para lancamento", content: result.preco },
    { eyebrow: "Proximos Passos", title: "Seu produto esta desenhado", content: result.proximo_passo },
    {
      eyebrow: "Construir comigo",
      title: "Transforme a estrategia em produto real",
      content: result.cta_consultoria,
      action: "whatsapp",
    },
  ];
}
