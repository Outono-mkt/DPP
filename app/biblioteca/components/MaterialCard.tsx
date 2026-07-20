import type { LibraryMaterial } from "../data/materiais";
import { dayGroups, priorityLabels, typeLabels } from "../data/materiais";

const externalActionLabels: Record<LibraryMaterial["tipo"], string> = {
  aula: "Assistir Aula",
  checklist: "Abrir Checklist",
  extra: "Acessar Material",
  link: "Acessar Material",
  pdf: "Visualizar PDF",
  prompt: "Copiar Prompt",
  skill: "Baixar Skill",
  template: "Usar Template",
};

export function MaterialCard({
  copiedId,
  isOpen,
  material,
  onCopyPrompt,
  onToggle,
}: {
  copiedId: string | null;
  isOpen: boolean;
  material: LibraryMaterial;
  onCopyPrompt: (material: LibraryMaterial) => void;
  onToggle: (id: string) => void;
}) {
  const detailsId = `material-details-${material.id}`;
  const hasDetails = Boolean(
    material.paraQueServe ||
      material.preRequisitos?.length ||
      material.comoUsar?.length ||
      material.resultadoEsperado ||
      material.proximoPasso ||
      material.conteudoPrompt,
  );
  const action = getPrimaryAction(material);
  const day = dayGroups.find((item) => item.id === material.dia);

  return (
    <article className="biblioteca-card">
      <div className="biblioteca-card__main">
        <div className="biblioteca-card__number" aria-label={`Ordem ${material.ordem}`}>
          {String(material.ordem).padStart(2, "0")}
        </div>
        <div className="biblioteca-card__content">
          <div className="biblioteca-card__meta">
            <span>{typeLabels[material.tipo]}</span>
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
          {action ? (
            action.kind === "copy" ? (
              <button className="biblioteca-action" onClick={() => onCopyPrompt(material)} type="button">
                {copiedId === material.id ? "Copiado" : externalActionLabels.prompt}
              </button>
            ) : (
              <a
                className="biblioteca-action"
                href={action.href}
                rel={action.external ? "noopener noreferrer" : undefined}
                target={action.external ? "_blank" : undefined}
              >
                {action.label}
              </a>
            )
          ) : (
            <span className="biblioteca-card__pending">Material em preparação</span>
          )}
          {hasDetails ? (
            <button
              aria-controls={detailsId}
              aria-expanded={isOpen}
              className="biblioteca-toggle"
              onClick={() => onToggle(material.id)}
              type="button"
            >
              <span>{isOpen ? "Ocultar" : "Detalhes"}</span>
              <span aria-hidden="true" className="biblioteca-toggle__chevron">
                {isOpen ? "↑" : "↓"}
              </span>
            </button>
          ) : null}
        </div>
      </div>
      {hasDetails ? (
        <div className="biblioteca-card__details" hidden={!isOpen} id={detailsId}>
          <DetailBlock title="Para que serve" value={material.paraQueServe} />
          <DetailList title="Você vai precisar" values={material.preRequisitos} />
          <DetailList title="Como usar" values={material.comoUsar} ordered />
          <DetailBlock title="O que você vai obter" value={material.resultadoEsperado} />
          <DetailBlock title="Próximo passo" value={material.proximoPasso} />
          <PromptPreview value={material.conteudoPrompt} />
          <div className="biblioteca-card__version">
            {material.versao ? <span>Versão: {material.versao}</span> : null}
            {material.atualizadoEm ? <span>Atualizado em: {formatDate(material.atualizadoEm)}</span> : null}
          </div>
        </div>
      ) : null}
    </article>
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

function PromptPreview({ value }: { value?: string }) {
  if (!value) return null;
  return (
    <section>
      <h3>Preview</h3>
      <pre>{value}</pre>
    </section>
  );
}

function getPrimaryAction(material: LibraryMaterial):
  | { external: boolean; href: string; kind: "link"; label: string }
  | { kind: "copy" }
  | null {
  if (material.tipo === "prompt" && material.conteudoPrompt && material.disponivel) {
    return { kind: "copy" };
  }

  const href = material.linkExterno ?? material.arquivoUrl;

  if (!href || !material.disponivel) return null;

  return {
    external: Boolean(material.linkExterno),
    href,
    kind: "link",
    label: externalActionLabels[material.tipo],
  };
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(value));
}
