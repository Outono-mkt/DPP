"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";

import { BrandLogo } from "@/components/BrandLogo";
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
type DiscoveryStage = "audience" | "pain" | "transformation" | "format";

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
  variant?: "default" | "checklist" | "status";
  action?: {
    label: string;
    fallbackMessage: string;
  };
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

const initialRegenerationLimits: Record<DiscoveryStage, number> = {
  audience: 3,
  pain: 3,
  transformation: 3,
  format: 3,
};

const experienceOptions: QuestionOption[] = [
  { label: "Nunca criei nada", value: "Nunca criei nada" },
  { label: "Ja tentei mas nao vendi", value: "Ja tentei mas nao vendi" },
  { label: "Ja vendi e quero melhorar", value: "Ja vendi e quero melhorar" },
];

const loadingPhrases = [
  "Analisando seu conhecimento",
  "Encontrando o publico mais promissor",
  "Organizando a estrategia",
  "Montando seu produto",
];

export function ProductProntoFlow() {
  const [step, setStep] = useState<Step>("access");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>(initialAnswers);
  const [customAnswers, setCustomAnswers] = useState<CustomAnswers>(initialCustomAnswers);
  const [discoveryResult, setDiscoveryResult] = useState<DiscoveryResult | null>(null);
  const [regenerationLimits, setRegenerationLimits] = useState(initialRegenerationLimits);
  const [regeneratingStage, setRegeneratingStage] = useState<DiscoveryStage | null>(null);
  const [loadingIndex, setLoadingIndex] = useState(0);
  const [loadingMode, setLoadingMode] = useState<LoadingMode>("product");
  const [copiedBlock, setCopiedBlock] = useState<string | null>(null);
  const [flowError, setFlowError] = useState<string | null>(null);
  const [generationResult, setGenerationResult] = useState<ProductResult | null>(null);
  const [savedProducts, setSavedProducts] = useState<SavedProductSummary[]>([]);
  const [activeResultId, setActiveResultId] = useState<string | null>(null);
  const [activeResultFormat, setActiveResultFormat] = useState<string | null>(null);
  const [persistenceMessage, setPersistenceMessage] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const resetCreationFlow = useCallback(() => {
    setAnswers(initialAnswers);
    setCustomAnswers(initialCustomAnswers);
    setCurrentQuestion(0);
    setDiscoveryResult(null);
    setRegenerationLimits(initialRegenerationLimits);
    setRegeneratingStage(null);
    setCopiedBlock(null);
    setFlowError(null);
    setGenerationResult(null);
    setActiveResultId(null);
    setActiveResultFormat(null);
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

  async function regenerateDiscoveryStage(stage: DiscoveryStage) {
    if (!discoveryResult || regenerationLimits[stage] <= 0) {
      return;
    }

    setRegeneratingStage(stage);
    setFlowError(null);

    try {
      const result = await requestDiscovery({
        profile: answers.profile,
        targetAudienceDescription: answers.targetAudienceDescription,
        regeneration: {
          stage,
          selectedAudience: resolveCustomValue(answers.selectedAudience, CUSTOM_AUDIENCE, customAnswers.audience),
          selectedPain: resolveCustomValue(answers.selectedPain, CUSTOM_PAIN, customAnswers.pain),
          selectedTransformation: resolveCustomValue(
            answers.selectedTransformation,
            CUSTOM_TRANSFORMATION,
            customAnswers.transformation,
          ),
          previousSuggestions: getPreviousSuggestionTitles(discoveryResult, stage),
        },
      });

      setDiscoveryResult((current) => mergeDiscoveryStage(current, result, stage));
      setRegenerationLimits((current) => ({
        ...current,
        [stage]: Math.max(current[stage] - 1, 0),
      }));
    } catch {
      setFlowError("Nao conseguimos gerar novas sugestoes agora. Tente novamente em alguns instantes.");
    } finally {
      setRegeneratingStage(null);
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
      setActiveResultFormat(input.selectedFormat);
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
    setActiveResultFormat(product.selected_format);
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
    } catch (error) {
      setPersistenceMessage(getErrorMessage(error, "Nao foi possivel gerar o PDF agora."));
    } finally {
      setIsDownloadingPdf(false);
    }
  }

  async function deleteSavedProduct(productId: string) {
    try {
      setDeletingProductId(productId);
      setPersistenceMessage(null);
      await requestDeleteProduct(productId);
      setSavedProducts((current) => current.filter((product) => product.id !== productId));

      if (activeResultId === productId) {
        setActiveResultId(null);
        setActiveResultFormat(null);
        setGenerationResult(null);
        setStep("dashboard");
      }
    } catch {
      setPersistenceMessage("Nao foi possivel excluir este produto agora.");
    } finally {
      setDeletingProductId(null);
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
    } catch (error) {
      setPersistenceMessage(getErrorMessage(error, "Nao foi possivel gerar o PDF agora."));
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
      <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-[1180px] items-center justify-center">
          <BrandLogo size="lg" variant="light" />
        </div>
      </main>
    );
  }

  const isAuthenticated = Boolean(userEmail);

  return (
    <main
      className={`min-h-screen bg-background text-foreground ${
        isAuthenticated ? "px-4 py-6 sm:px-6 lg:px-8" : ""
      }`}
    >
      <div
        className={`mx-auto flex w-full flex-col ${
          isAuthenticated ? "min-h-[calc(100vh-3rem)] max-w-[1240px]" : "min-h-screen max-w-none"
        }`}
      >
        {isAuthenticated ? (
          <AppTopBar
            createdCount={savedProducts.length}
            onSignOut={signOut}
            userEmail={userEmail}
          />
        ) : null}

        {!isAuthenticated && (
          <AccessScreen error={loginError} isSubmitting={isLoggingIn} onEnter={enterExperience} />
        )}
        {isAuthenticated && step === "dashboard" && (
          <ProductsDashboard
            error={historyError}
            deletingProductId={deletingProductId}
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
            onRegenerate={regenerateDiscoveryStage}
            onUpdateAnswer={updateAnswer}
            onUpdateCustomAnswer={updateCustomAnswer}
            progress={progress}
            regenerationLimits={regenerationLimits}
            regeneratingStage={regeneratingStage}
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
            selectedFormat={activeResultFormat}
          />
        )}
      </div>
    </main>
  );
}

function AppTopBar({
  createdCount,
  onSignOut,
  userEmail,
}: {
  createdCount: number;
  onSignOut: () => void;
  userEmail: string | null;
}) {
  return (
    <header className="mb-7 flex flex-col gap-4 rounded-[28px] border border-white/8 bg-surface/92 px-4 py-4 shadow-2xl shadow-black/25 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <div className="sm:hidden">
          <BrandLogo size="md" variant="icon" />
        </div>
        <div className="hidden sm:block">
          <BrandLogo size="md" variant="light" />
        </div>
        <span className="hidden truncate border-l border-white/10 pl-4 text-sm text-muted md:block">
          {userEmail}
        </span>
      </div>
      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <span className="rounded-full border border-white/10 bg-surface-2 px-4 py-2 text-xs font-semibold text-[#F7F5EF]">
          {createdCount} de 2 produtos
        </span>
        <button
          className="h-10 rounded-full border border-white/10 px-5 text-sm font-semibold text-[#F7F5EF] transition hover:border-accent hover:text-accent"
          onClick={onSignOut}
          type="button"
        >
          Sair
        </button>
      </div>
    </header>
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
    throw new Error(await readPdfErrorMessage(response));
  }

  const contentType = response.headers.get("Content-Type") ?? "";

  if (!contentType.toLowerCase().includes("application/pdf")) {
    throw new Error(await readPdfErrorMessage(response));
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

async function readPdfErrorMessage(response: Response) {
  try {
    const payload = (await response.json()) as { error?: unknown };

    if (typeof payload.error === "string" && payload.error.trim().length > 0) {
      return payload.error;
    }
  } catch {
    // Keep the user-facing fallback when the response is not JSON.
  }

  return "Nao foi possivel gerar o PDF agora.";
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message.trim().length > 0 ? error.message : fallback;
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

function getPreviousSuggestionTitles(result: DiscoveryResult, stage: DiscoveryStage) {
  if (stage === "audience") return result.publicos.map((item) => item.titulo);
  if (stage === "pain") return result.dores.map((item) => item.titulo);
  if (stage === "transformation") return result.transformacoes.map((item) => item.titulo);
  return result.formatos.map((item) => item.nome || item.titulo);
}

function mergeDiscoveryStage(
  current: DiscoveryResult | null,
  next: DiscoveryResult,
  stage: DiscoveryStage,
): DiscoveryResult {
  if (!current) return next;

  return {
    ...current,
    ...(stage === "audience" ? { publicos: next.publicos } : {}),
    ...(stage === "pain" ? { dores: next.dores } : {}),
    ...(stage === "transformation" ? { transformacoes: next.transformacoes } : {}),
    ...(stage === "format" ? { formatos: next.formatos } : {}),
  };
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
    <section
      className="relative min-h-screen w-full overflow-hidden bg-[#0D0D0D] bg-cover bg-[25%_center] bg-no-repeat md:bg-[left_center] md:bg-fixed"
      style={{
        backgroundImage:
          'linear-gradient(90deg, rgba(13,13,13,.12) 0%, rgba(13,13,13,.40) 48%, rgba(13,13,13,.82) 68%, rgba(13,13,13,.96) 100%), url("/brand/login-hero.png")',
      }}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[#0D0D0D]/35 md:hidden" />
      <div className="relative z-10 grid min-h-screen w-full grid-cols-1 items-center gap-10 px-5 py-10 sm:px-8 md:grid-cols-[minmax(0,1fr)_minmax(420px,560px)] md:gap-[6vw] md:px-[7vw] md:py-12">
        <div className="flex min-w-0 items-center">
          <div className="max-w-[720px]">
            <BrandLogo height={78} width={320} variant="horizontal" />
            <h1 className="mt-10 max-w-[720px] text-[2.55rem] font-bold leading-[1.06] text-white sm:text-[3rem] md:text-[3.5rem] lg:text-[4.25rem]">
              Transforme seu conhecimento
              <br />
              em um
              <br />
              <span className="text-accent">produto digital.</span>
            </h1>
          </div>
        </div>

        <div className="flex w-full items-center justify-center md:justify-end">
          <form
            className="w-full max-w-[520px] space-y-5 rounded-[28px] border border-white/10 bg-[#141414]/95 p-6 shadow-[0_24px_70px_rgba(0,0,0,.42)] backdrop-blur-[14px] sm:p-9 lg:p-[42px]"
            onSubmit={(event) => {
              event.preventDefault();
              void onEnter(email, password);
            }}
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/8 bg-[#1B1B1B] text-accent">
              <svg aria-hidden="true" className="h-7 w-7" fill="none" viewBox="0 0 24 24">
                <path
                  d="M7.5 10V7.7C7.5 5.2 9.5 3.2 12 3.2s4.5 2 4.5 4.5V10"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="1.8"
                />
                <path
                  d="M6.8 10h10.4c.9 0 1.6.7 1.6 1.6v6.1c0 .9-.7 1.6-1.6 1.6H6.8c-.9 0-1.6-.7-1.6-1.6v-6.1c0-.9.7-1.6 1.6-1.6Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path d="M12 14v2.2" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
              </svg>
            </div>
            <h2 className="text-center text-3xl font-bold leading-tight text-white sm:text-4xl">
              Acesse <span className="text-accent">sua conta</span>
            </h2>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-white">E-mail</span>
              <input
                className="h-14 w-full rounded-2xl border border-white/8 bg-[#1B1B1B] px-4 text-base text-white outline-none transition placeholder:text-[#A8A8A8] focus:border-accent focus:ring-4 focus:ring-accent/15 sm:h-[58px]"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="seuemail@exemplo.com"
                type="email"
                value={email}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-white">Senha</span>
              <input
                className="h-14 w-full rounded-2xl border border-white/8 bg-[#1B1B1B] px-4 text-base text-white outline-none transition placeholder:text-[#A8A8A8] focus:border-accent focus:ring-4 focus:ring-accent/15 sm:h-[58px]"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Senha enviada por e-mail"
                type="password"
                value={password}
              />
            </label>

            <div className="flex items-center justify-between gap-4 text-sm text-[#A8A8A8]">
              <label className="flex min-w-0 items-center gap-2">
                <input
                  className="h-4 w-4 rounded border-white/20 bg-[#1B1B1B] accent-[#C9A84C]"
                  type="checkbox"
                />
                <span>Lembrar meu acesso</span>
              </label>
              <button
                className="shrink-0 text-[#C9A84C] transition hover:text-[#E5CB78] focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-[#141414]"
                type="button"
              >
                Esqueci minha senha
              </button>
            </div>

            {error ? (
              <p className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm leading-5 text-red-100">
                {error}
              </p>
            ) : null}

            <button
              className="h-14 w-full rounded-2xl bg-accent px-5 text-sm font-bold text-[#0D0D0D] shadow-lg shadow-accent/10 transition hover:bg-accent-light focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-[#141414] disabled:cursor-not-allowed disabled:opacity-55 sm:h-[58px]"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Entrando..." : "Entrar"}
            </button>
            <div className="flex flex-col items-center gap-2 pt-2 text-center text-sm font-medium text-[#A8A8A8]">
              <svg aria-hidden="true" className="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24">
                <path
                  d="M12 3.4 18.5 6v5.2c0 4.1-2.6 7.8-6.5 9.1-3.9-1.3-6.5-5-6.5-9.1V6L12 3.4Z"
                  stroke="currentColor"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                />
                <path
                  d="m9.4 12 1.7 1.7 3.7-4"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="1.8"
                />
              </svg>
              <span>Ambiente seguro e protegido</span>
            </div>
          </form>
        </div>
      </div>
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
  onRegenerate,
  onUpdateAnswer,
  onUpdateCustomAnswer,
  progress,
  regenerationLimits,
  regeneratingStage,
}: {
  answers: OnboardingAnswers;
  currentQuestion: number;
  customAnswers: CustomAnswers;
  discoveryResult: DiscoveryResult | null;
  error: string | null;
  onBack: () => void;
  onForward: () => void;
  onRegenerate: (stage: DiscoveryStage) => Promise<void>;
  onUpdateAnswer: (id: keyof OnboardingAnswers, value: string) => void;
  onUpdateCustomAnswer: (id: keyof CustomAnswers, value: string) => void;
  progress: number;
  regenerationLimits: Record<DiscoveryStage, number>;
  regeneratingStage: DiscoveryStage | null;
}) {
  const canContinue = canContinueFromStep(currentQuestion, answers, customAnswers);

  return (
    <section className="w-full pb-10">
      <div className="mb-6 rounded-[32px] border border-white/8 bg-surface p-5 shadow-2xl shadow-black/25 sm:p-7">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-light">
              Consultoria guiada
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-[#F7F5EF]">
              Produto Pronto
            </h1>
          </div>
          <div className="rounded-full border border-white/10 bg-surface-2 px-4 py-2 text-sm font-semibold text-[#F7F5EF]">
            Etapa {currentQuestion + 1} de {totalOnboardingSteps}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-accent transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-accent-light">{progress}%</span>
        </div>
      </div>

      <div className="rounded-[34px] bg-paper p-5 text-ink shadow-2xl shadow-black/25 sm:p-8 lg:p-10">
        {renderOnboardingStep({
          answers,
          currentQuestion,
          customAnswers,
          discoveryResult,
          onRegenerate,
          onUpdateAnswer,
          onUpdateCustomAnswer,
          regenerationLimits,
          regeneratingStage,
        })}

        {error ? (
          <p className="mt-6 rounded-2xl border border-red-500/20 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700">
            {error}
          </p>
        ) : null}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            className="h-12 flex-1 rounded-2xl border border-black/12 px-4 text-sm font-semibold text-ink transition hover:border-[#8B7334] hover:text-[#8B7334] disabled:cursor-not-allowed disabled:opacity-35"
            disabled={currentQuestion === 0}
            onClick={onBack}
            type="button"
          >
            Voltar
          </button>
          <button
            className="h-12 flex-1 rounded-2xl bg-accent px-4 text-sm font-bold text-[#0D0D0D] transition hover:bg-accent-light disabled:cursor-not-allowed disabled:opacity-45"
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
  onRegenerate,
  onUpdateAnswer,
  onUpdateCustomAnswer,
  regenerationLimits,
  regeneratingStage,
}: {
  answers: OnboardingAnswers;
  currentQuestion: number;
  customAnswers: CustomAnswers;
  discoveryResult: DiscoveryResult | null;
  onRegenerate: (stage: DiscoveryStage) => Promise<void>;
  onUpdateAnswer: (id: keyof OnboardingAnswers, value: string) => void;
  onUpdateCustomAnswer: (id: keyof CustomAnswers, value: string) => void;
  regenerationLimits: Record<DiscoveryStage, number>;
  regeneratingStage: DiscoveryStage | null;
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
        customLabel="Escrever meu proprio publico"
        customPlaceholder="Descreva seu publico com suas palavras"
        customValue={customAnswers.audience}
        helper="Escolha o caminho com mais potencial para o seu produto."
        items={(discoveryResult?.publicos ?? []).map((item) => ({
          title: item.titulo,
          description: item.descricao,
          why: item.porque,
          tradeoff: item.tradeoff,
          value: item.titulo,
        }))}
        marker={CUSTOM_AUDIENCE}
        onChange={(value) => onUpdateAnswer("selectedAudience", value)}
        onCustomChange={(value) => onUpdateCustomAnswer("audience", value)}
        onRegenerate={() => onRegenerate("audience")}
        regenerationRemaining={regenerationLimits.audience}
        regenerating={regeneratingStage === "audience"}
        selectedValue={answers.selectedAudience}
        title="Escolha seu melhor publico"
      />
    );
  }

  if (currentQuestion === 3) {
    return (
      <CardStep
        customLabel="Escrever minha propria dor"
        customPlaceholder="Descreva a dor principal"
        customValue={customAnswers.pain}
        helper="A dor certa deixa a promessa do produto mais clara e desejada."
        items={(discoveryResult?.dores ?? []).map((item) => ({
          title: item.titulo,
          description: `${item.descricao} Frase real: "${item.frases_reais[0]}"`,
          why: item.porque,
          tradeoff: item.tradeoff,
          value: item.titulo,
        }))}
        marker={CUSTOM_PAIN}
        onChange={(value) => onUpdateAnswer("selectedPain", value)}
        onCustomChange={(value) => onUpdateCustomAnswer("pain", value)}
        onRegenerate={() => onRegenerate("pain")}
        regenerationRemaining={regenerationLimits.pain}
        regenerating={regeneratingStage === "pain"}
        selectedValue={answers.selectedPain}
        title="Escolha a dor principal"
      />
    );
  }

  if (currentQuestion === 4) {
    return (
      <CardStep
        customLabel="Escrever minha propria transformacao"
        customPlaceholder="Descreva a transformacao desejada"
        customValue={customAnswers.transformation}
        helper="Escolha o resultado que seu aluno mais gostaria de conquistar."
        items={(discoveryResult?.transformacoes ?? []).map((item) => ({
          title: item.titulo,
          description: item.descricao,
          why: item.porque,
          tradeoff: item.tradeoff,
          value: item.titulo,
        }))}
        marker={CUSTOM_TRANSFORMATION}
        onChange={(value) => onUpdateAnswer("selectedTransformation", value)}
        onCustomChange={(value) => onUpdateCustomAnswer("transformation", value)}
        onRegenerate={() => onRegenerate("transformation")}
        regenerationRemaining={regenerationLimits.transformation}
        regenerating={regeneratingStage === "transformation"}
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
        description: item.descricao,
        why: item.porque,
        tradeoff: item.tradeoff,
        meta: [
          `Tempo estimado: ${item.tempo_medio}`,
          `Dificuldade: ${item.dificuldade}`,
          `Ticket: ${item.ticket_recomendado}`,
          `Ideal para: ${item.perfil_ideal}`,
          `Potencial de escala: ${item.potencial_escala}`,
          `${"★".repeat(Math.max(1, Math.min(item.avaliacao, 5)))}${"☆".repeat(Math.max(0, 5 - Math.min(item.avaliacao, 5)))}`,
        ],
        value: item.nome,
      }))}
      onChange={(value) => onUpdateAnswer("selectedFormat", value)}
      onRegenerate={() => onRegenerate("format")}
      regenerationRemaining={regenerationLimits.format}
      regenerating={regeneratingStage === "format"}
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
      <h2 className="max-w-3xl text-3xl font-semibold leading-tight text-ink">{title}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[#66635B]">{helper}</p>
      <textarea
        className="mt-7 min-h-44 w-full resize-none rounded-[24px] border border-black/10 bg-white px-5 py-4 text-base leading-7 text-ink outline-none transition placeholder:text-[#8B877C] focus:border-[#8B7334] focus:ring-4 focus:ring-accent/15"
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
      <h2 className="max-w-3xl text-3xl font-semibold leading-tight text-ink">{title}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[#66635B]">{helper}</p>
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
  onRegenerate,
  regenerationRemaining,
  regenerating = false,
  selectedValue,
  title,
}: {
  customLabel?: string;
  customPlaceholder?: string;
  customValue?: string;
  helper: string;
  items: Array<{
    title: string;
    description: string;
    value: string;
    why: string;
    tradeoff: string;
    meta?: string[];
  }>;
  marker?: string;
  onChange: (value: string) => void;
  onCustomChange?: (value: string) => void;
  onRegenerate?: () => Promise<void>;
  regenerationRemaining?: number;
  regenerating?: boolean;
  selectedValue: string;
  title: string;
}) {
  return (
    <div>
      <h2 className="max-w-3xl text-3xl font-semibold leading-tight text-ink">{title}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[#66635B]">{helper}</p>
      <div className="mt-7 grid gap-4 lg:grid-cols-2">
        {items.map((item) => (
          <ChoiceCard
            description={item.description}
            featured={items.indexOf(item) === 0}
            key={item.value}
            meta={item.meta}
            onClick={() => onChange(item.value)}
            tradeoff={item.tradeoff}
            selected={selectedValue === item.value}
            title={item.title}
            why={item.why}
          />
        ))}

        {customLabel && marker ? (
          <div className="space-y-3">
            <ChoiceCard
              description="Use esta opcao se nenhuma sugestao representar bem o que voce quer criar."
              featured={false}
              onClick={() => onChange(marker)}
              selected={selectedValue === marker}
              title={customLabel}
              tradeoff="Voce ganha controle, mas perde a analise comparativa da IA sobre os caminhos mais faceis de vender."
              why="Esta opcao e util quando voce ja conhece muito bem o publico que quer atender."
            />
            {selectedValue === marker ? (
              <textarea
                className="min-h-32 w-full resize-none rounded-[22px] border border-black/10 bg-white px-5 py-4 text-sm leading-6 text-ink outline-none transition placeholder:text-[#8B877C] focus:border-[#8B7334] focus:ring-4 focus:ring-accent/15"
                onChange={(event) => onCustomChange?.(event.target.value)}
                placeholder={customPlaceholder}
                value={customValue ?? ""}
              />
            ) : null}
          </div>
        ) : null}
      </div>
      {onRegenerate && regenerationRemaining !== undefined ? (
        <div className="mt-6 rounded-[22px] border border-black/10 bg-white px-4 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-ink">Novas sugestoes</p>
              <div className="mt-2 flex gap-2" aria-label={`${regenerationRemaining} regeneracoes restantes`}>
                {[0, 1, 2].map((index) => (
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      index < regenerationRemaining ? "bg-accent" : "bg-black/15"
                    }`}
                    key={index}
                  />
                ))}
              </div>
              {regenerationRemaining === 0 ? (
                <p className="mt-2 text-sm leading-5 text-[#66635B]">
                  Voce atingiu o limite de novas sugestoes desta etapa.
                </p>
              ) : null}
            </div>
            <button
              className="h-11 rounded-full border border-black/12 px-5 text-sm font-semibold text-ink transition hover:border-[#8B7334] hover:text-[#8B7334] disabled:cursor-not-allowed disabled:opacity-45"
              disabled={regenerationRemaining === 0 || regenerating}
              onClick={() => void onRegenerate()}
              type="button"
            >
              {regenerating ? "Gerando..." : "Gerar novas sugestoes"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ChoiceCard({
  description,
  featured = false,
  meta,
  onClick,
  selected,
  title,
  tradeoff,
  why,
}: {
  description: string;
  featured?: boolean;
  meta?: string[];
  onClick: () => void;
  selected: boolean;
  title: string;
  tradeoff: string;
  why: string;
}) {
  return (
    <article
      className={`rounded-[24px] border p-5 text-left transition ${
        selected
          ? "border-accent bg-[#FBF5DE] text-ink shadow-md shadow-accent/10"
          : featured
            ? "border-accent bg-white text-[#56534D] shadow-lg shadow-accent/10"
            : "border-black/10 bg-white text-[#56534D]"
      }`}
    >
      {featured ? (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-[#0D0D0D]">
            Minha recomendacao
          </span>
          <span className="rounded-full border border-accent/30 px-3 py-1 text-xs font-semibold text-[#8B7334]">
            Mais recomendada
          </span>
        </div>
      ) : null}
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#66635B]">{description}</p>
      <div className="mt-4 grid gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#8B7334]">Por que escolhi</p>
          <p className="mt-1 text-sm leading-6 text-[#56534D]">{why}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#8B7334]">Trade-off</p>
          <p className="mt-1 text-sm leading-6 text-[#56534D]">{tradeoff}</p>
        </div>
      </div>
      {meta?.length ? (
        <ul className="mt-4 grid gap-2 text-sm leading-5 text-[#56534D]">
          {meta.map((item) => (
            <li className="rounded-2xl bg-[#F3F1EB] px-3 py-2" key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
      <button
        className="mt-5 h-11 w-full rounded-full bg-ink px-4 text-sm font-semibold text-[#F7F5EF] transition hover:bg-[#2C2C2C]"
        onClick={onClick}
        type="button"
      >
        Escolher esta opcao
      </button>
    </article>
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
    <div className="mt-7 grid gap-4 sm:grid-cols-3">
      {options.map((option) => {
        const selected = option.value === value;

        return (
          <button
            className={`rounded-[22px] border px-5 py-4 text-left text-sm font-semibold transition ${
              selected
                ? "border-accent bg-[#FBF5DE] text-ink shadow-md shadow-accent/10"
                : "border-black/10 bg-white text-[#56534D] hover:border-[#8B7334] hover:text-ink"
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
    <section className="flex min-h-[64vh] w-full items-center justify-center pb-10 text-center">
      <div className="w-full max-w-2xl rounded-[36px] border border-white/8 bg-surface p-8 shadow-2xl shadow-black/30 sm:p-12">
        <div className="flex justify-center">
          <BrandLogo size="lg" variant="light" />
        </div>
        <div className="mx-auto mt-10 flex h-24 w-24 items-center justify-center rounded-[28px] border border-accent/20 bg-surface-2 shadow-xl shadow-black/20">
          <Image
            alt=""
            className="brand-loading-glow h-16 w-16 object-contain"
            height={1024}
            src="/brand/loading-icon.png"
            width={1536}
          />
        </div>
        <h2 className="mt-8 text-3xl font-semibold text-[#F7F5EF]">
          {mode === "discovery" ? "Encontrando seus melhores caminhos" : "Criando seu produto"}
        </h2>
        <p className="mt-4 min-h-6 text-sm text-muted">{phrase}</p>
      </div>
    </section>
  );
}

function ProductsDashboard({
  deletingProductId,
  error,
  isDownloadingPdf,
  message,
  onCreateNew,
  onDeleteProduct,
  onDownloadPdf,
  onViewProduct,
  products,
}: {
  deletingProductId: string | null;
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
  const availableSlots = Math.max(2 - products.length, 0);
  const lastFormat = products[0]?.selected_format ?? "Nenhum ainda";

  return (
    <section className="w-full pb-10">
      <div className="mb-7 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-[34px] border border-white/8 bg-surface p-6 shadow-2xl shadow-black/25 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-light">
                Dashboard
              </p>
              <h1 className="mt-4 max-w-2xl text-4xl font-semibold leading-[1.05] text-[#F7F5EF] sm:text-5xl">
                Seus produtos digitais em construção.
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-muted">
                Acompanhe suas estratégias salvas, baixe o PDF e crie uma nova direção quando houver espaço disponível.
              </p>
            </div>
            <button
              className="h-12 rounded-full bg-accent px-6 text-sm font-bold text-[#0D0D0D] shadow-lg shadow-accent/15 transition hover:bg-accent-light focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-45"
              disabled={reachedLimit}
              onClick={onCreateNew}
              type="button"
            >
              {reachedLimit ? "Limite atingido" : "Criar novo produto"}
            </button>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <MetricCard label="Criados" value={String(products.length)} />
            <MetricCard label="Disponíveis" value={String(availableSlots)} />
            <MetricCard label="Último formato" value={lastFormat} />
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-[34px] border border-white/8 bg-surface-2 p-6 shadow-2xl shadow-black/20 sm:p-8">
          <BrandLogo size="md" variant="light" />
          <div className="mt-8">
            <p className="text-sm leading-6 text-muted">
              Limite atual do acesso
            </p>
            <p className="mt-2 text-3xl font-semibold text-[#F7F5EF]" aria-label={`${products.length} de 2 produtos criados`}>
              {products.length}/2
            </p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-accent transition-all duration-300"
                style={{ width: `${Math.min((products.length / 2) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <p className="mb-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm leading-5 text-red-100">
          {error}
        </p>
      ) : null}

      {message ? (
        <p className="mb-4 rounded-2xl border border-white/10 bg-surface px-4 py-3 text-sm leading-5 text-muted">
          {message}
        </p>
      ) : null}

      {reachedLimit ? (
        <p className="mb-4 rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm leading-5 text-[#F7F5EF]">
          Você já criou seus 2 produtos disponíveis neste acesso. Para criar outro, exclua um produto antigo ou fale comigo.
        </p>
      ) : null}

      <div className="rounded-[34px] bg-paper p-4 text-ink shadow-2xl shadow-black/20 sm:p-6 lg:p-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8B7334]">
              Biblioteca
            </p>
            <h2 className="mt-2 text-3xl font-semibold leading-tight">
              Meus Produtos
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-[#66635B]">
            Visualize, baixe ou exclua uma estratégia salva.
          </p>
        </div>

        {products.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {products.map((product) => (
              <article
                className="rounded-[26px] border border-black/8 bg-white p-5 shadow-sm shadow-black/5 transition hover:-translate-y-0.5 hover:border-[#C9A84C]/60 hover:shadow-xl hover:shadow-black/10"
                key={product.id}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#8B7334]">
                      {product.selected_format}
                    </p>
                    <h3 className="mt-3 text-xl font-semibold leading-snug text-ink">
                      {product.generated_result.nomes[0] ?? product.generated_result.ideia}
                    </h3>
                  </div>
                  <span className="shrink-0 rounded-full bg-[#EFE7D2] px-3 py-1 text-xs font-semibold text-[#5F4B19]">
                    {formatDisplayDate(product.created_at)}
                  </span>
                </div>
                <p className="mt-4 line-clamp-3 text-sm leading-6 text-[#56534D]">
                  {product.generated_result.promessa}
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <button
                    className="h-11 rounded-full bg-ink px-4 text-sm font-semibold text-[#F7F5EF] transition hover:bg-[#2C2C2C] focus:outline-none focus:ring-2 focus:ring-[#8B7334] focus:ring-offset-2"
                    onClick={() => onViewProduct(product)}
                    type="button"
                  >
                    Visualizar
                  </button>
                  <button
                    className="h-11 rounded-full border border-black/12 px-4 text-sm font-semibold text-ink transition hover:border-[#8B7334] hover:text-[#8B7334] focus:outline-none focus:ring-2 focus:ring-[#8B7334] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45"
                    disabled={isDownloadingPdf}
                    onClick={() => onDownloadPdf(product.id)}
                    type="button"
                  >
                    Baixar PDF
                  </button>
                  <button
                    className="h-11 rounded-full border border-red-300/50 px-4 text-sm font-semibold text-red-700 transition hover:border-red-500 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45"
                    disabled={deletingProductId === product.id}
                    onClick={() => onDeleteProduct(product.id)}
                    type="button"
                  >
                    {deletingProductId === product.id ? "Excluindo..." : "Excluir"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-[28px] border border-dashed border-black/15 bg-white/70 p-8 text-center">
            <Image
              alt=""
              className="mx-auto h-20 w-20 object-contain"
              height={1024}
              src="/brand/logo-produto-pronto-icon.png"
              width={1536}
            />
            <h3 className="mt-4 text-2xl font-semibold text-ink">
              Nenhum produto criado ainda.
            </h3>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#66635B]">
              Comece pelo primeiro diagnóstico e salve sua estratégia para consultar ou baixar depois.
            </p>
            <button
              className="mt-6 h-12 rounded-full bg-accent px-6 text-sm font-bold text-[#0D0D0D] transition hover:bg-accent-light"
              onClick={onCreateNew}
              type="button"
            >
              Criar meu primeiro produto
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-white/8 bg-surface-2 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className="mt-3 truncate text-2xl font-semibold text-[#F7F5EF]">{value}</p>
    </div>
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
  selectedFormat,
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
  selectedFormat: string | null;
}) {
  const resultBlocks = result ? productResultToBlocks(result) : [];

  return (
    <section className="w-full pb-10">
      <div className="mb-7 rounded-[36px] border border-white/8 bg-surface p-6 shadow-2xl shadow-black/25 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-5 flex items-center gap-3">
              <BrandLogo size="md" variant="light" />
              <Image
                alt=""
                className="hidden h-11 w-11 object-contain sm:block"
                height={1024}
                src="/brand/logo-produto-pronto-icon.png"
                width={1536}
              />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-light">
              {isSavedResult ? "Produto salvo" : "Resultado"}
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-[1.06] text-[#F7F5EF] sm:text-5xl">
              {result?.nomes[0] ?? "Seu produto está desenhado."}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted">
              A estratégia abaixo organiza produto, promessa, mercado e venda em blocos prontos para execução.
            </p>
          </div>
          <div className="flex flex-col gap-3 lg:min-w-64">
            <button
              className="h-11 rounded-full border border-white/10 px-5 text-sm font-semibold text-[#F7F5EF] transition hover:border-accent hover:text-accent"
              onClick={onBackToDashboard}
              type="button"
            >
              Voltar para Meus Produtos
            </button>
            {!isSavedResult ? (
              <button
                className="h-11 rounded-full border border-white/10 px-5 text-sm font-semibold text-muted transition hover:border-accent hover:text-accent"
                onClick={onRestart}
                type="button"
              >
                Recomeçar com outro produto
              </button>
            ) : null}
          </div>
        </div>

        {result ? (
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <ResultSummaryCard label="Formato" value={selectedFormat ?? "Produto digital"} />
            <ResultSummaryCard label="Promessa" value={result.promessa} featured />
            <ResultSummaryCard label="Preço" value={result.preco} />
          </div>
        ) : null}
      </div>

      {error ? (
        <div className="rounded-[28px] border border-red-400/20 bg-red-500/10 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-red-200">
            Geracao interrompida
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-[#F7F5EF]">
            Nao conseguimos gerar seu produto agora.
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted">{error}</p>
          <button
            className="mt-5 h-11 rounded-full bg-accent px-5 text-sm font-bold text-[#0D0D0D] transition hover:bg-accent-light"
            onClick={onRestart}
            type="button"
          >
            Tentar novamente
          </button>
        </div>
      ) : null}

      {!error && result ? (
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="hidden lg:block">
            <nav className="sticky top-6 rounded-[28px] border border-white/8 bg-surface p-4">
              <p className="px-3 pb-3 text-xs font-bold uppercase tracking-[0.16em] text-accent-light">
                Estratégia
              </p>
              <div className="space-y-1">
                {resultBlocks.map((block, index) => (
                  <a
                    className="block rounded-2xl px-3 py-2 text-sm leading-5 text-muted transition hover:bg-white/5 hover:text-[#F7F5EF]"
                    href={`#result-block-${index + 1}`}
                    key={block.eyebrow}
                  >
                    {String(index + 1).padStart(2, "0")} {block.eyebrow}
                  </a>
                ))}
              </div>
            </nav>
          </aside>

          <div className="rounded-[34px] bg-paper p-4 text-ink shadow-2xl shadow-black/20 sm:p-6 lg:p-8">
            <div className="space-y-5">
              {resultBlocks.map((block, index) => (
                <article
                  className="rounded-[26px] border border-black/8 bg-white p-5 shadow-sm shadow-black/5 sm:p-6"
                  id={`result-block-${index + 1}`}
                  key={block.eyebrow}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8B7334]">
                        {String(index + 1).padStart(2, "0")} {block.eyebrow}
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold leading-snug text-ink">
                        {block.title}
                      </h2>
                    </div>
                    <button
                      className="h-10 rounded-full border border-black/12 px-4 text-sm font-semibold text-ink transition hover:border-[#8B7334] hover:text-[#8B7334] sm:shrink-0"
                      onClick={() => onCopyBlock(block)}
                      type="button"
                    >
                      {copiedBlock === block.eyebrow ? "Copiado" : "Copiar"}
                    </button>
                  </div>

                  {Array.isArray(block.content) ? (
                    <ResultBlockList block={block} />
                  ) : (
                    <p className="mt-5 text-sm leading-7 text-[#56534D]">{block.content}</p>
                  )}

                  {block.action ? (
                    <button
                      className="mt-6 h-12 w-full rounded-2xl bg-accent px-5 text-sm font-bold text-[#0D0D0D] transition hover:bg-accent-light"
                      onClick={() => {
                        const whatsappUrl = process.env.NEXT_PUBLIC_WHATSAPP_URL;

                        if (whatsappUrl) {
                          window.open(whatsappUrl, "_blank", "noopener,noreferrer");
                          return;
                        }

                        window.alert(block.action?.fallbackMessage);
                      }}
                      type="button"
                    >
                      {block.action.label}
                    </button>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {!error && result ? (
        <div className="sticky bottom-4 mt-6 rounded-[24px] border border-white/10 bg-[#111]/95 p-3 shadow-2xl shadow-black/40 backdrop-blur">
          <button
            className="h-12 w-full rounded-2xl bg-accent px-4 text-sm font-bold text-[#0D0D0D] transition hover:bg-accent-light"
            disabled={!activeResultId || isDownloadingPdf}
            onClick={onDownloadPdf}
            type="button"
          >
            {isDownloadingPdf ? "Gerando PDF..." : "Salvar meu resultado em PDF"}
          </button>
        </div>
      ) : null}

      {persistenceMessage ? (
        <p className="mt-4 rounded-2xl border border-white/10 bg-surface px-4 py-3 text-sm leading-5 text-muted">
          {persistenceMessage}
        </p>
      ) : null}

    </section>
  );
}

function ResultBlockList({ block }: { block: ResultBlock }) {
  if (!Array.isArray(block.content)) {
    return null;
  }

  if (block.variant === "checklist") {
    return (
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {block.content.map((group) => {
          const [title = "Etapa", ...items] = group.split("||");

          return (
            <div className="rounded-[20px] bg-[#F3F1EB] p-4" key={group}>
              <h3 className="font-semibold text-ink">{title}</h3>
              <ul className="mt-3 grid gap-2 text-sm leading-6 text-[#56534D]">
                {items.map((item) => (
                  <li className="flex gap-3" key={item}>
                    <span className="mt-1.5 h-4 w-4 shrink-0 rounded border border-[#8B7334]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    );
  }

  if (block.variant === "status") {
    return (
      <ul className="mt-5 grid gap-3 md:grid-cols-2">
        {block.content.map((item) => {
          const [status = "pendente", label = item] = item.split("||");
          const marker = status === "concluido" ? "●" : status === "em_andamento" ? "●" : "○";
          const color = status === "concluido" ? "text-emerald-700" : status === "em_andamento" ? "text-[#8B7334]" : "text-[#8A8983]";

          return (
            <li className="flex items-center gap-3 rounded-[18px] bg-[#F3F1EB] px-4 py-3" key={item}>
              <span className={`text-lg ${color}`}>{marker}</span>
              <span className="text-sm font-semibold text-[#56534D]">{label}</span>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <ul className="mt-5 grid gap-3 text-sm leading-6 text-[#56534D] md:grid-cols-2">
      {block.content.map((item) => (
        <li className="rounded-[18px] bg-[#F3F1EB] px-4 py-3" key={item}>
          {item}
        </li>
      ))}
    </ul>
  );
}

function ResultSummaryCard({
  featured = false,
  label,
  value,
}: {
  featured?: boolean;
  label: string;
  value: string;
}) {
  return (
    <div className={`rounded-[24px] border p-5 ${featured ? "border-accent/30 bg-accent/10" : "border-white/8 bg-surface-2"}`}>
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-accent-light">{label}</p>
      <p className="mt-3 line-clamp-4 text-sm font-semibold leading-6 text-[#F7F5EF]">{value}</p>
    </div>
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
      eyebrow: "Mecanismo Unico",
      title: result.mecanismo.nome,
      content: result.mecanismo.explicacao,
    },
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
      eyebrow: "Estrutura do Produto",
      title: "Seu produto tera a seguinte estrutura",
      content: result.estrutura,
    },
    {
      eyebrow: "Objecoes Principais",
      title: "O que o cliente pode pensar antes de comprar",
      content: result.objecoes.map(
        (objection) =>
          `${objection.objecao}: ${objection.porque_aparece} Resposta: ${objection.como_responder}`,
      ),
    },
    {
      eyebrow: "Como Vender Esse Produto",
      title: "Direcao comercial simples",
      content: [
        `Angulo principal: ${result.como_vender.angulo_principal}`,
        `Problema de entrada: ${result.como_vender.problema_de_entrada}`,
        `Transformacao destacada: ${result.como_vender.transformacao_destacada}`,
        `Prova recomendada: ${result.como_vender.prova_recomendada}`,
        `CTA recomendado: ${result.como_vender.cta_recomendado}`,
      ],
    },
    { eyebrow: "Preco Sugerido", title: "Preco ideal para lancamento", content: result.preco },
    { eyebrow: "Proximos Passos", title: "Seu produto esta desenhado", content: result.proximo_passo },
    {
      eyebrow: "Plano de Execucao",
      title: "Checklist para tirar do papel",
      content: result.plano_execucao.map((group) => `${group.etapa}||${group.itens.join("||")}`),
      variant: "checklist",
    },
    {
      eyebrow: "Status do Projeto",
      title: "O que ja esta pronto e o que vem agora",
      content: result.status_projeto.map((item) => `${item.status}||${item.etapa}`),
      variant: "status",
    },
    {
      eyebrow: result.cta_consultoria.titulo,
      title: "Consultoria personalizada de 30 dias",
      content: [result.cta_consultoria.contexto, result.cta_consultoria.descricao],
      action: {
        label: result.cta_consultoria.botao,
        fallbackMessage: "WhatsApp sera conectado em uma etapa futura.",
      },
    },
  ];
}
