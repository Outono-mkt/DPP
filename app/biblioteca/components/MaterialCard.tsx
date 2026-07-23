"use client";

import { useEffect, useState } from "react";

import type { LibraryMaterial } from "../data/materiais";
import { dayGroups, priorityLabels, typeLabels } from "../data/materiais";

const actionLabels: Record<LibraryMaterial["tipo"], string> = {
  link: "Acessar Produto Pronto",
  prompt: "Ver prompt",
  skill: "Baixar Skill",
};

type PromptStatus = "idle" | "loading" | "loaded" | "error";
type CopyStatus = "idle" | "copied" | "error";

export function MaterialCard({
  isOpen,
  material,
  onToggle,
}: {
  isOpen: boolean;
  material: LibraryMaterial;
  onToggle: (id: string) => void;
}) {
  const [promptText, setPromptText] = useState("");
  const [promptStatus, setPromptStatus] = useState<PromptStatus>("idle");
  const [copyStatus, setCopyStatus] = useState<CopyStatus>("idle");
  const detailsId = `material-details-${material.id}`;
  const isPrompt = material.tipo === "prompt";
  const day = dayGroups.find((item) => item.id === material.dia);
  const hasDetails = Boolean(
    isPrompt ||
      material.paraQueServe ||
      material.preRequisitos?.length ||
      material.comoUsar?.length ||
      material.resultadoEsperado ||
      material.proximoPasso,
  );

  useEffect(() => {
    if (!isOpen || !isPrompt || !material.arquivoUrl || promptText || promptStatus !== "loading") return;

    let ignore = false;

    fetch(material.arquivoUrl)
      .then((response) => {
        if (!response.ok) throw new Error("Nao foi possivel carregar este prompt.");
        return response.text();
      })
      .then((text) => {
        if (ignore) return;
        setPromptText(text);
        setPromptStatus("loaded");
      })
      .catch(() => {
        if (ignore) return;
        setPromptStatus("error");
      });

    return () => {
      ignore = true;
    };
  }, [isOpen, isPrompt, material.arquivoUrl, promptStatus, promptText]);

  useEffect(() => {
    if (copyStatus !== "copied") return;
    const timeoutId = window.setTimeout(() => setCopyStatus("idle"), 2000);
    return () => window.clearTimeout(timeoutId);
  }, [copyStatus]);

  async function copyPrompt() {
    if (!promptText) return;

    try {
      await writeClipboardText(promptText);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
  }

  function openPrompt() {
    if (!isOpen && isPrompt && !promptText) {
      setPromptStatus("loading");
    }
    onToggle(material.id);
  }

  return (
    <article className="biblioteca-card">
      <div className="biblioteca-card__main">
        <div className="biblioteca-card__number" aria-label={`Ordem ${material.ordem}`}>
          {String(material.ordem).padStart(2, "0")}
        </div>
        <div className="biblioteca-card__content">
          <div className="biblioteca-card__meta">
            <span data-kind={material.tipo}>{typeLabels[material.tipo]}</span>
            <span>{day?.label ?? "Material"}</span>
            {material.tempoEstimado ? <span>{material.tempoEstimado}</span> : null}
          </div>
          <h2>{material.titulo}</h2>
          <p>{material.descricao}</p>
          <div className="biblioteca-card__tags">
            <span data-priority={material.prioridade}>{priorityLabels[material.prioridade]}</span>
            {material.tags.slice(0, 3).map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </div>
        <div className="biblioteca-card__actions">
          <PrimaryAction
            isOpen={isOpen}
            material={material}
            onOpenPrompt={openPrompt}
          />
          {hasDetails && !isPrompt ? (
            <button
              aria-controls={detailsId}
              aria-expanded={isOpen}
              className="biblioteca-toggle"
              onClick={() => onToggle(material.id)}
              type="button"
            >
              <span>{isOpen ? "Ocultar" : "Detalhes"}</span>
              <ChevronIcon direction={isOpen ? "up" : "down"} />
            </button>
          ) : null}
        </div>
      </div>
      {hasDetails ? (
        <div className="biblioteca-card__details" hidden={!isOpen} id={detailsId}>
          <DetailBlock title="Para que serve" value={material.paraQueServe} />
          <DetailList title="Voce vai precisar" values={material.preRequisitos} />
          <DetailList title="Como usar" values={material.comoUsar} ordered />
          <DetailBlock title="O que voce vai obter" value={material.resultadoEsperado} />
          <DetailBlock title="Proximo passo" value={material.proximoPasso} />
          {isPrompt ? (
            <PromptReader
              copyStatus={copyStatus}
              onCopy={copyPrompt}
              promptStatus={promptStatus}
              promptText={promptText}
            />
          ) : null}
          <div className="biblioteca-card__version">
            {material.versao ? <span>Versao: {material.versao}</span> : null}
            {material.atualizadoEm ? <span>Atualizado em: {formatDate(material.atualizadoEm)}</span> : null}
          </div>
        </div>
      ) : null}
    </article>
  );
}

function PrimaryAction({
  isOpen,
  material,
  onOpenPrompt,
}: {
  isOpen: boolean;
  material: LibraryMaterial;
  onOpenPrompt: () => void;
}) {
  if (!material.disponivel || !material.arquivoUrl) {
    return <span className="biblioteca-card__pending">Material em preparacao</span>;
  }

  if (material.tipo === "prompt") {
    return (
      <button className="biblioteca-action" onClick={onOpenPrompt} type="button">
        <span>{isOpen ? "Ocultar prompt" : actionLabels.prompt}</span>
      </button>
    );
  }

  return (
    <a
      className="biblioteca-action"
      download={material.tipo === "skill" ? "" : undefined}
      href={material.arquivoUrl}
    >
      {material.tipo === "skill" ? <DownloadIcon /> : null}
      <span>{actionLabels[material.tipo]}</span>
    </a>
  );
}

function PromptReader({
  copyStatus,
  onCopy,
  promptStatus,
  promptText,
}: {
  copyStatus: CopyStatus;
  onCopy: () => void;
  promptStatus: PromptStatus;
  promptText: string;
}) {
  return (
    <section className="biblioteca-prompt-reader">
      <div className="biblioteca-prompt-reader__header">
        <h3>Prompt completo</h3>
        <button
          className="biblioteca-copy-button"
          disabled={!promptText || promptStatus !== "loaded"}
          onClick={onCopy}
          type="button"
        >
          <CopyIcon />
          <span>{copyStatus === "copied" ? "Prompt copiado" : "Copiar prompt"}</span>
        </button>
      </div>
      {promptStatus === "loading" ? <p>Carregando prompt...</p> : null}
      {promptStatus === "error" ? (
        <p className="biblioteca-prompt-reader__error">
          Nao foi possivel carregar este prompt agora. Tente novamente em alguns instantes.
        </p>
      ) : null}
      {promptStatus === "loaded" ? <pre>{promptText}</pre> : null}
      {copyStatus === "error" ? (
        <p className="biblioteca-prompt-reader__error" aria-live="polite">
          Nao foi possivel copiar automaticamente. Selecione o texto e copie manualmente.
        </p>
      ) : null}
    </section>
  );
}

function DetailBlock({ title, value }: { title: string; value?: string }) {
  if (!value) return null;
  return (
    <section>
      <h3>{title}</h3>
      <p>{value}</p>
    </section>
  );
}

function DetailList({ ordered = false, title, values }: { ordered?: boolean; title: string; values?: string[] }) {
  if (!values?.length) return null;
  const List = ordered ? "ol" : "ul";
  return (
    <section>
      <h3>{title}</h3>
      <List>
        {values.map((value) => (
          <li key={value}>{value}</li>
        ))}
      </List>
    </section>
  );
}

function DownloadIcon() {
  return (
    <svg aria-hidden="true" className="biblioteca-button-icon" fill="none" viewBox="0 0 24 24">
      <path d="M12 3v10m0 0 4-4m-4 4L8 9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      <path d="M5 17v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg aria-hidden="true" className="biblioteca-button-icon" fill="none" viewBox="0 0 24 24">
      <rect height="13" rx="2" stroke="currentColor" strokeWidth="2" width="13" x="8" y="8" />
      <path d="M5 16H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

function ChevronIcon({ direction }: { direction: "up" | "down" }) {
  return (
    <svg aria-hidden="true" className="biblioteca-button-icon" fill="none" viewBox="0 0 24 24">
      <path
        d={direction === "up" ? "m6 15 6-6 6 6" : "m6 9 6 6 6-6"}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

async function writeClipboardText(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();

  const copied = document.execCommand("copy");
  document.body.removeChild(textarea);

  if (!copied) throw new Error("Clipboard fallback failed");
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(value));
}
