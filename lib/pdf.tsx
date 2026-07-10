import "server-only";

import {
  Document,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import type React from "react";

import type { ProductResult } from "@/types";

type PdfInput = {
  createdAt: string;
  result: ProductResult;
  selectedFormat?: string;
  userDisplayName?: string | null;
  whatsappUrl?: string;
};

type StrategicSection = {
  title: string;
  children: React.ReactNode;
  minPresenceAhead?: number;
};

export class ProductResultPdfError extends Error {
  constructor(
    message: string,
    readonly stage: string,
    readonly field?: string,
    readonly originalError?: unknown,
  ) {
    super(message);
    this.name = "ProductResultPdfError";
  }
}

const COLORS = {
  black: "#0d0d0d",
  gold: "#c9a84c",
  paper: "#f7f3ea",
  ink: "#1c1c1c",
  muted: "#696969",
  line: "#ded7c7",
  soft: "#eee8dc",
  darkPanel: "#171717",
  white: "#ffffff",
};

export async function generateProductResultPdf(input: PdfInput): Promise<Uint8Array> {
  let safeResult: ProductResult;

  try {
    safeResult = normalizePdfProductResult(input.result);
    validateProductResultForPdf(safeResult);
  } catch (error) {
    throw toPdfError("normalization", error);
  }

  let buffer: Buffer;

  try {
    buffer = await renderToBuffer(<ProductResultDocument {...input} result={safeResult} />);
  } catch (error) {
    throw toPdfError("render", error);
  }

  if (!buffer || buffer.byteLength === 0) {
    throw new ProductResultPdfError("PDF buffer is empty.", "buffer", "renderToBuffer");
  }

  return new Uint8Array(buffer);
}

function ProductResultDocument({
  createdAt,
  result,
  selectedFormat,
  userDisplayName,
  whatsappUrl,
}: PdfInput) {
  const generatedDate = formatDate(createdAt);
  const format = selectedFormat?.trim() || "Formato definido pela estratégia";
  const principalName = getFirstText(result.nomes, result.ideia || "Produto Pronto");
  const sections = getStrategicSections(result, format);

  return (
    <Document
      title={`Produto Pronto - ${principalName}`}
      author="Gabriel Moreira"
      subject="Estratégia inicial de produto digital gerada pelo Produto Pronto"
      creator="Produto Pronto"
      producer="Produto Pronto"
      language="pt-BR"
    >
      <Page size="A4" style={[styles.coverPage, styles.darkPage]}>
        <View style={styles.coverTop}>
          <Text style={styles.coverBrand}>Produto Pronto</Text>
          <View style={styles.coverRule} />
        </View>

        <View style={styles.coverMain}>
          <Text style={styles.coverKicker}>Estratégia Inicial de Produto Digital</Text>
          <Text style={styles.coverTitle}>{principalName}</Text>
          <View style={styles.coverMetaGrid}>
            <MetaLabel label="Formato escolhido" value={format} dark />
            <MetaLabel label="Data de geração" value={generatedDate} dark />
            {userDisplayName ? <MetaLabel label="Usuário" value={userDisplayName} dark /> : null}
          </View>
        </View>

        <Text style={styles.coverFooter}>Documento estratégico preparado para execução</Text>
      </Page>

      <Page size="A4" style={styles.page}>
        <RunningFooter generatedDate={generatedDate} />
        <Text style={styles.pageEyebrow}>Resumo executivo</Text>
        <Text style={styles.pageTitle}>A estratégia em uma visão clara</Text>

        <View style={styles.summaryGrid}>
          <SummaryCard title="Oportunidade resumida" value={result.oportunidade} wide />
          <SummaryCard title="Nicho" value={result.nicho} />
          <SummaryCard title="Formato escolhido" value={format} />
          <SummaryCard title="Preço sugerido" value={result.preco} />
        </View>

        <View style={styles.promiseCard}>
          <Text style={styles.promiseLabel}>Promessa principal</Text>
          <Text style={styles.promiseText}>{result.promessa}</Text>
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        <RunningFooter generatedDate={generatedDate} />
        <Text style={styles.pageEyebrow}>Decisao estrategica</Text>
        <Text style={styles.pageTitle}>Por que este produto?</Text>
        <ReasonGrid reasons={getProductChoiceReasons(result, format)} />
      </Page>

      <Page size="A4" style={styles.page} wrap>
        <RunningFooter generatedDate={generatedDate} />
        <Text style={styles.pageEyebrow}>Seções estratégicas</Text>
        <Text style={styles.pageTitle}>Mapa de produto e venda</Text>

        {sections.map((section, index) => (
          <StrategicSectionBlock
            key={section.title}
            index={index + 1}
            title={section.title}
            minPresenceAhead={section.minPresenceAhead}
          >
            {section.children}
          </StrategicSectionBlock>
        ))}
      </Page>

      <Page size="A4" style={styles.page}>
        <RunningFooter generatedDate={generatedDate} />
        <Text style={styles.pageEyebrow}>Execucao</Text>
        <Text style={styles.pageTitle}>Checklist Executivo</Text>
        <ExecutiveChecklist items={getExecutiveChecklist(format)} />
      </Page>

      <Page size="A4" style={[styles.finalPage, styles.darkPage]}>
        <View style={styles.finalPanel}>
          <Text style={styles.finalTitle}>{result.cta_consultoria.titulo}</Text>
          <Text style={styles.finalText}>{result.cta_consultoria.contexto}</Text>
          <Text style={styles.finalText}>{result.cta_consultoria.descricao}</Text>
          {whatsappUrl ? (
            <Link src={whatsappUrl} style={styles.finalButton}>
              {result.cta_consultoria.botao}
            </Link>
          ) : (
            <Text style={styles.finalButton}>{result.cta_consultoria.botao}</Text>
          )}
        </View>
        <Text style={styles.finalFooter}>Produto Pronto | Gabriel Moreira | {generatedDate}</Text>
      </Page>
    </Document>
  );
}

function StrategicSectionBlock({
  children,
  index,
  minPresenceAhead = 72,
  title,
}: {
  children: React.ReactNode;
  index: number;
  minPresenceAhead?: number;
  title: string;
}) {
  return (
    <View style={styles.section} minPresenceAhead={minPresenceAhead}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionNumber}>{String(index).padStart(2, "0")}</Text>
        <View style={styles.sectionTitleWrap}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <View style={styles.sectionRule} />
        </View>
      </View>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function getStrategicSections(result: ProductResult, selectedFormat: string): StrategicSection[] {
  const sections: Array<StrategicSection | null> = [
    {
      title: "Oportunidade de Mercado",
      children: <Paragraph>{result.oportunidade}</Paragraph>,
    },
    {
      title: "Nicho Validado",
      children: <Paragraph>{result.nicho}</Paragraph>,
    },
    {
      title: "Ideia do Produto",
      children: <Paragraph>{result.ideia}</Paragraph>,
    },
    {
      title: "Sugestões de Nome",
      minPresenceAhead: 110,
      children: <NameCards names={result.nomes} />,
    },
    {
      title: "Promessa Principal",
      children: <HighlightBox>{result.promessa}</HighlightBox>,
    },
    {
      title: "Mecanismo Único",
      children: (
        <View style={styles.mechanismBox}>
          <Text style={styles.cardTitle}>{result.mecanismo.nome}</Text>
          <Text style={styles.paragraph}>{result.mecanismo.explicacao}</Text>
        </View>
      ),
    },
    {
      title: "Benefícios que Você Pode Vender",
      minPresenceAhead: 170,
      children: <BenefitGrid items={result.beneficios} />,
    },
    {
      title: "Perfis Ideais de Cliente",
      minPresenceAhead: 180,
      children: <ProfileCards profiles={result.perfis_clientes} />,
    },
    {
      title: "Frases que seu Cliente Diria",
      minPresenceAhead: 150,
      children: <QuoteList quotes={result.frases_cliente} />,
    },
    {
      title: "Estrutura do Produto",
      minPresenceAhead: 180,
      children: <StructureList items={result.estrutura} format={selectedFormat} />,
    },
    {
      title: "Objeções Principais",
      minPresenceAhead: 190,
      children: <ObjectionList objections={result.objecoes} />,
    },
    {
      title: "Como Vender Esse Produto",
      minPresenceAhead: 160,
      children: <SalesPlan plan={result.como_vender} />,
    },
    {
      title: "Preço Sugerido",
      children: <HighlightBox>{result.preco}</HighlightBox>,
    },
    {
      title: "Próximos Passos",
      children: <Paragraph>{result.proximo_passo}</Paragraph>,
    },
    {
      title: "Plano de Execucao",
      minPresenceAhead: 190,
      children: <ExecutionChecklist groups={result.plano_execucao} />,
    },
    {
      title: "Status do Projeto",
      minPresenceAhead: 150,
      children: <ProjectStatus items={result.status_projeto} />,
    },
  ];

  return sections.filter((section): section is StrategicSection => {
    if (!section) return false;

    const title = removeDiacritics(section.title).toLowerCase();

    if (title.includes("sugestoes")) return result.nomes.length > 0;
    if (title.includes("beneficios")) return result.beneficios.length > 0;
    if (title.includes("perfis")) return result.perfis_clientes.length > 0;
    if (title.includes("frases")) return result.frases_cliente.length > 0;
    if (title.includes("estrutura")) return result.estrutura.length > 0;
    if (title.includes("objecoes")) return result.objecoes.length > 0;
    if (title.includes("plano")) return result.plano_execucao.length > 0;
    if (title.includes("status")) return result.status_projeto.length > 0;

    return true;
  });
}

function NameCards({ names }: { names: ProductResult["nomes"] }) {
  return (
    <View style={styles.nameList}>
      {names.map((name, index) => (
        <View
          key={name}
          style={index === 0 ? [styles.nameCard, styles.nameCardFeatured] : styles.nameCard}
          wrap={false}
        >
          <Text style={styles.nameIndex}>{index + 1}</Text>
          <Text style={index === 0 ? styles.nameTextFeatured : styles.nameText}>{name}</Text>
        </View>
      ))}
    </View>
  );
}

function BenefitGrid({ items }: { items: string[] }) {
  return (
    <View style={styles.twoColumnGrid}>
      {items.map((item) => (
        <View key={item} style={styles.benefitItem} wrap={false}>
          <Text style={styles.bullet}>-</Text>
          <Text style={styles.benefitText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function ProfileCards({ profiles }: { profiles: ProductResult["perfis_clientes"] }) {
  return (
    <View style={styles.cardStack}>
      {profiles.map((profile) => (
        <View key={profile.titulo} style={styles.profileCard} wrap={false}>
          <Text style={styles.cardTitle}>{profile.titulo}</Text>
          <Text style={styles.paragraph}>{profile.descricao}</Text>
        </View>
      ))}
    </View>
  );
}

function QuoteList({ quotes }: { quotes: string[] }) {
  return (
    <View style={styles.cardStack}>
      {quotes.map((quote) => (
        <View key={quote} style={styles.quoteCard} wrap={false}>
          <Text style={styles.quoteText}>{`"${quote}"`}</Text>
        </View>
      ))}
    </View>
  );
}

function StructureList({ items, format }: { items: string[]; format: string }) {
  const unit = getStructureUnit(format);

  return (
    <View style={styles.cardStack}>
      {items.map((item, index) => {
        const parsed = splitStructureItem(item);

        return (
          <View key={`${item}-${index}`} style={styles.structureItem} wrap={false}>
            <Text style={styles.structureNumber}>{index + 1}</Text>
            <View style={styles.structureContent}>
              <Text style={styles.cardTitle}>{parsed.title || `${unit} ${index + 1}`}</Text>
              <Text style={styles.paragraph}>{parsed.description || item}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function ObjectionList({ objections }: { objections: ProductResult["objecoes"] }) {
  return (
    <View style={styles.cardStack}>
      {objections.map((objection) => (
        <View key={objection.objecao} style={styles.objectionCard} wrap={false}>
          <Field label="Objeção" value={objection.objecao} />
          <Field label="Por que aparece" value={objection.porque_aparece} muted />
          <Field label="Como responder" value={objection.como_responder} />
        </View>
      ))}
    </View>
  );
}

function SalesPlan({ plan }: { plan: ProductResult["como_vender"] }) {
  const items = [
    ["Ângulo principal", plan.angulo_principal],
    ["Problema de entrada", plan.problema_de_entrada],
    ["Transformação destacada", plan.transformacao_destacada],
    ["Prova recomendada", plan.prova_recomendada],
    ["CTA recomendado", plan.cta_recomendado],
  ] as const;

  return (
    <View style={styles.salesGrid}>
      {items.map(([label, value]) => (
        <Field key={label} label={label} value={value} />
      ))}
    </View>
  );
}

function ExecutionChecklist({ groups }: { groups: ProductResult["plano_execucao"] }) {
  return (
    <View style={styles.roadmapFlow}>
      {groups.map((group, index) => (
        <View key={group.etapa} style={styles.roadmapStep} wrap={false}>
          <Text style={styles.cardTitle}>{group.etapa}</Text>
          <View style={styles.cardStack}>
            {group.itens.map((item) => (
              <View key={item} style={styles.checklistItem}>
                <Text style={styles.checkbox}> </Text>
                <Text style={styles.paragraph}>{item}</Text>
              </View>
            ))}
          </View>
          {index < groups.length - 1 ? <Text style={styles.roadmapArrow}>v</Text> : null}
        </View>
      ))}
    </View>
  );
}

function ReasonGrid({ reasons }: { reasons: string[] }) {
  return (
    <View style={styles.reasonGrid}>
      {reasons.map((reason, index) => (
        <View key={reason} style={styles.reasonCard} wrap={false}>
          <Text style={styles.reasonIndex}>{String(index + 1).padStart(2, "0")}</Text>
          <Text style={styles.reasonText}>{reason}</Text>
        </View>
      ))}
    </View>
  );
}

function ExecutiveChecklist({ items }: { items: string[] }) {
  return (
    <View style={styles.executiveChecklist}>
      {items.map((item) => (
        <View key={item} style={styles.executiveChecklistItem} wrap={false}>
          <Text style={styles.executiveCheckbox}> </Text>
          <Text style={styles.executiveChecklistText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function ProjectStatus({ items }: { items: ProductResult["status_projeto"] }) {
  return (
    <View style={styles.twoColumnGrid}>
      {items.map((item) => (
        <View key={item.etapa} style={styles.statusItem} wrap={false}>
          <Text style={getStatusDotStyle(item.status)}>{getStatusLabel(item.status)}</Text>
          <Text style={styles.benefitText}>{item.etapa}</Text>
        </View>
      ))}
    </View>
  );
}

function getStatusDotStyle(status: ProductResult["status_projeto"][number]["status"]) {
  if (status === "concluido") return styles.statusDone;
  if (status === "em_andamento") return styles.statusCurrent;
  return styles.statusPending;
}

function getStatusLabel(status: ProductResult["status_projeto"][number]["status"]) {
  if (status === "concluido") return "OK";
  if (status === "em_andamento") return "EM";
  return "--";
}

function SummaryCard({ title, value, wide = false }: { title: string; value: string; wide?: boolean }) {
  return (
    <View style={wide ? [styles.summaryCard, styles.summaryCardWide] : styles.summaryCard}>
      <Text style={styles.summaryTitle}>{title}</Text>
      <Text style={styles.summaryText}>{value}</Text>
    </View>
  );
}

function MetaLabel({ dark = false, label, value }: { dark?: boolean; label: string; value: string }) {
  return (
    <View style={styles.metaLabel}>
      <Text style={dark ? styles.metaLabelDark : styles.metaLabelText}>{label}</Text>
      <Text style={dark ? styles.metaValueDark : styles.metaValueText}>{value}</Text>
    </View>
  );
}

function Field({ label, muted = false, value }: { label: string; muted?: boolean; value: string }) {
  return (
    <View style={styles.field} wrap={false}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={muted ? styles.fieldTextMuted : styles.fieldText}>{value}</Text>
    </View>
  );
}

function HighlightBox({ children }: { children: string }) {
  return (
    <View style={styles.highlightBox} wrap={false}>
      <Text style={styles.highlightText}>{children}</Text>
    </View>
  );
}

function Paragraph({ children }: { children: string }) {
  return <Text style={styles.paragraph}>{children}</Text>;
}

function RunningFooter({ generatedDate }: { generatedDate: string }) {
  return (
    <View style={styles.runningFooter} fixed>
      <Text style={styles.footerText}>Produto Pronto | Gabriel Moreira</Text>
      <Text
        style={styles.footerText}
        render={({ pageNumber, totalPages }) => `${generatedDate} | Página ${pageNumber} de ${totalPages}`}
      />
    </View>
  );
}

function getStructureUnit(format: string) {
  const normalized = removeDiacritics(format).toLowerCase();

  if (normalized.includes("mentoria")) return "Encontro";
  if (normalized.includes("curso") || normalized.includes("aula")) return "Modulo";
  if (normalized.includes("planilha")) return "Aba";
  if (normalized.includes("desafio")) return "Dia";
  if (normalized.includes("saas") || normalized.includes("sistema") || normalized.includes("ferramenta")) {
    return "Funcionalidade";
  }

  return "Capítulo";
}

function splitStructureItem(item: string) {
  const [first, ...rest] = item.split(":");

  if (!rest.length) {
    return { title: "", description: item };
  }

  return {
    title: first.trim(),
    description: rest.join(":").trim(),
  };
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function removeDiacritics(text: string) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function normalizePdfProductResult(value: unknown): ProductResult {
  const result = value && typeof value === "object" && !Array.isArray(value)
    ? (value as Partial<ProductResult>)
    : {};
  const ideia = asPdfString(result.ideia, "Produto digital pronto para validar");
  const promessa = asPdfString(result.promessa, "Uma transformacao clara para o cliente certo");
  const estrutura = toPdfStringArray(result.estrutura);
  const mecanismo = normalizePdfStringObject(result.mecanismo, {
    nome: "Execucao Guiada",
    explicacao: "Um caminho pratico para transformar conhecimento em entrega vendavel.",
  });

  return {
    oportunidade: asPdfString(
      result.oportunidade,
      "Existe uma oportunidade de transformar conhecimento pratico em uma oferta simples, especifica e vendavel.",
    ),
    nicho: asPdfString(result.nicho, "Publico especifico com uma dor clara."),
    ideia,
    nomes: toPdfStringArray(result.nomes) as ProductResult["nomes"],
    promessa,
    mecanismo,
    beneficios: toPdfStringArray(result.beneficios) as ProductResult["beneficios"],
    perfis_clientes: normalizePdfProfiles(result.perfis_clientes),
    frases_cliente: toPdfStringArray(result.frases_cliente) as ProductResult["frases_cliente"],
    estrutura,
    objecoes: normalizePdfObjections(result.objecoes),
    como_vender: normalizePdfStringObject(result.como_vender, {
      angulo_principal: "Apresente a promessa principal de forma direta.",
      problema_de_entrada: "Mostre a situacao que o cliente reconhece.",
      transformacao_destacada: promessa,
      prova_recomendada: "Use exemplos simples, bastidores ou demonstracao do metodo.",
      cta_recomendado: "Convide para o primeiro passo.",
    }),
    preco: asPdfString(result.preco, "Faixa de preco a validar com os primeiros compradores."),
    proximo_passo: asPdfString(result.proximo_passo, "Validar a promessa, montar a entrega e fazer a primeira oferta."),
    plano_execucao: normalizePdfExecutionPlan(result.plano_execucao),
    status_projeto: normalizePdfStatus(result.status_projeto),
    cta_consultoria: normalizePdfStringObject(result.cta_consultoria, {
      titulo: "Seu produto ja esta estruturado.",
      contexto: "Agora comeca a etapa mais importante: transformar essa estrategia em vendas reais.",
      descricao:
        "Na Consultoria Plano de Acao de 30 dias, eu monto com voce um plano personalizado para construir, lancar e vender esse produto da forma mais rapida e organizada possivel.",
      botao: "Quero montar meu Plano de Acao de 30 dias",
    }),
  };
}

function getProductChoiceReasons(result: ProductResult, format: string) {
  return [
    `Resolve uma dor urgente: ${result.nicho}`,
    `Aproveita a competencia central por tras de: ${result.promessa}`,
    `Nasce de um mecanismo claro: ${result.mecanismo.nome}`,
    `Pode ser produzido rapidamente no formato ${format}`,
    "Possui valor percebido porque entrega uma transformacao especifica",
    `Abre caminho para proximas ofertas a partir de ${getFirstText(result.nomes, result.ideia)}`,
  ];
}

function getExecutiveChecklist(format: string) {
  const normalizedFormat = removeDiacritics(format).toLowerCase();

  if (normalizedFormat.includes("mentoria")) {
    return [
      "Validar promessa com potenciais mentorados",
      "Validar preco da primeira turma",
      "Criar roteiro dos encontros",
      "Preparar material de apoio",
      "Configurar checkout",
      "Criar pagina ou mensagem de convite",
      "Publicar agenda de inscricoes",
      "Convidar os primeiros contatos",
      "Registrar objecoes dos interessados",
      "Fechar a primeira vaga",
    ];
  }

  if (normalizedFormat.includes("ebook") || normalizedFormat.includes("pdf")) {
    return [
      "Validar promessa do material",
      "Validar preco do ebook",
      "Criar sumario executivo",
      "Produzir conteudo principal",
      "Revisar exemplos e checklists",
      "Diagramar arquivo final",
      "Configurar checkout",
      "Criar pagina ou mensagem de venda",
      "Divulgar para os primeiros contatos",
      "Realizar a primeira venda",
    ];
  }

  if (normalizedFormat.includes("curso") || normalizedFormat.includes("aula")) {
    return [
      "Validar promessa do curso",
      "Validar preco da primeira versao",
      "Criar roteiro das aulas",
      "Gravar os blocos essenciais",
      "Revisar audio, video e ordem das aulas",
      "Publicar area de entrega",
      "Configurar checkout",
      "Criar pagina ou mensagem de venda",
      "Divulgar para os primeiros contatos",
      "Realizar a primeira venda",
    ];
  }

  if (
    normalizedFormat.includes("saas") ||
    normalizedFormat.includes("sistema") ||
    normalizedFormat.includes("ferramenta")
  ) {
    return [
      "Validar problema principal",
      "Validar preco da primeira versao",
      "Desenhar fluxo minimo da ferramenta",
      "Criar MVP com a funcao central",
      "Testar com usuarios reais",
      "Revisar entrega inicial",
      "Configurar checkout ou acesso",
      "Criar pagina ou mensagem de venda",
      "Convidar os primeiros usuarios",
      "Fechar o primeiro cliente",
    ];
  }

  return [
    "Validar promessa com pessoas do publico escolhido",
    "Validar preco antes de finalizar a oferta",
    "Criar estrutura principal do produto",
    "Produzir conteudo essencial",
    "Revisar entrega e exemplos",
    "Configurar checkout",
    "Criar pagina ou mensagem de venda",
    "Publicar primeira versao",
    "Divulgar para os primeiros contatos",
    "Realizar a primeira venda",
  ];
}

function normalizePdfStringObject<T extends Record<string, string>>(
  value: unknown,
  defaults: T,
): T {
  const source = value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

  return Object.fromEntries(
    Object.entries(defaults).map(([key, fallback]) => [key, asPdfString(source[key], fallback)]),
  ) as T;
}

function normalizePdfProfiles(value: unknown): ProductResult["perfis_clientes"] {
  if (!Array.isArray(value)) {
    return [] as unknown as ProductResult["perfis_clientes"];
  }

  return value
    .filter((item) => item && typeof item === "object" && !Array.isArray(item))
    .map((item) => {
      const profile = item as Record<string, unknown>;
      return {
        titulo: asPdfString(profile.titulo, "Perfil sem titulo"),
        descricao: asPdfString(profile.descricao, "Descricao nao informada."),
      };
    }) as ProductResult["perfis_clientes"];
}

function normalizePdfObjections(value: unknown): ProductResult["objecoes"] {
  if (!Array.isArray(value)) {
    return [] as unknown as ProductResult["objecoes"];
  }

  return value
    .filter((item) => item && typeof item === "object" && !Array.isArray(item))
    .map((item) => {
      const objection = item as Record<string, unknown>;
      return {
        objecao: asPdfString(objection.objecao, "Objecao nao informada"),
        porque_aparece: asPdfString(objection.porque_aparece, "Motivo nao informado."),
        como_responder: asPdfString(objection.como_responder, "Responder com clareza e prova simples."),
      };
    }) as ProductResult["objecoes"];
}

function normalizePdfExecutionPlan(value: unknown): ProductResult["plano_execucao"] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item) => item && typeof item === "object" && !Array.isArray(item))
    .map((item) => {
      const group = item as Record<string, unknown>;
      return {
        etapa: asPdfString(group.etapa, "Execucao"),
        itens: toPdfStringArray(group.itens),
      };
    })
    .filter((group) => group.itens.length > 0);
}

function normalizePdfStatus(value: unknown): ProductResult["status_projeto"] {
  const validStatus = ["concluido", "em_andamento", "pendente"] as const;

  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item) => item && typeof item === "object" && !Array.isArray(item))
    .map((item) => {
      const status = item as Record<string, unknown>;
      const statusValue = asPdfString(status.status, "pendente");
      return {
        etapa: asPdfString(status.etapa, "Etapa"),
        status: validStatus.includes(statusValue as ProductResult["status_projeto"][number]["status"])
          ? (statusValue as ProductResult["status_projeto"][number]["status"])
          : "pendente",
      };
    });
}

function toPdfStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isPdfString).map((item) => item.trim());
}

function getFirstText(values: string[], fallback: string) {
  return values.find((value) => value.trim().length > 0) ?? fallback;
}

function asPdfString(value: unknown, fallback = "") {
  return isPdfString(value) ? value.trim() : fallback;
}

function isPdfString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function toPdfError(stage: string, error: unknown) {
  if (error instanceof ProductResultPdfError) {
    return error;
  }

  return new ProductResultPdfError(getErrorMessage(error), stage, undefined, error);
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown PDF generation error.";
}

function validateProductResultForPdf(result: ProductResult) {
  const requiredStrings: Array<[string, string]> = [
    ["oportunidade", result.oportunidade],
    ["nicho", result.nicho],
    ["ideia", result.ideia],
    ["promessa", result.promessa],
    ["mecanismo.nome", result.mecanismo.nome],
    ["mecanismo.explicacao", result.mecanismo.explicacao],
    ["preco", result.preco],
    ["proximo_passo", result.proximo_passo],
    ["cta_consultoria.titulo", result.cta_consultoria.titulo],
    ["cta_consultoria.contexto", result.cta_consultoria.contexto],
    ["cta_consultoria.descricao", result.cta_consultoria.descricao],
    ["cta_consultoria.botao", result.cta_consultoria.botao],
  ];

  const invalid = requiredStrings.find(([, value]) => !isPdfString(value));

  if (invalid) {
    throw new ProductResultPdfError(
      "Product result is incomplete for PDF generation.",
      "validation",
      invalid[0],
    );
  }
}

const styles = StyleSheet.create({
  darkPage: {
    backgroundColor: COLORS.black,
    color: COLORS.white,
  },
  coverPage: {
    padding: 54,
    position: "relative",
  },
  coverTop: {
    alignItems: "flex-start",
    gap: 12,
  },
  coverBrand: {
    color: COLORS.gold,
    fontFamily: "Helvetica-Bold",
    fontSize: 18,
    letterSpacing: 0,
  },
  coverRule: {
    backgroundColor: COLORS.gold,
    height: 2,
    width: 86,
  },
  coverMain: {
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: 34,
  },
  coverKicker: {
    color: COLORS.paper,
    fontFamily: "Helvetica",
    fontSize: 15,
    marginBottom: 18,
  },
  coverTitle: {
    color: COLORS.white,
    fontFamily: "Helvetica-Bold",
    fontSize: 39,
    lineHeight: 1.12,
    marginBottom: 34,
  },
  coverMetaGrid: {
    borderLeftColor: COLORS.gold,
    borderLeftWidth: 2,
    gap: 14,
    paddingLeft: 18,
    width: 370,
  },
  coverFooter: {
    bottom: 44,
    color: "#bdb7aa",
    fontSize: 9,
    left: 54,
    position: "absolute",
  },
  page: {
    backgroundColor: COLORS.paper,
    color: COLORS.ink,
    fontFamily: "Helvetica",
    fontSize: 10,
    lineHeight: 1.42,
    paddingBottom: 62,
    paddingHorizontal: 46,
    paddingTop: 46,
  },
  pageEyebrow: {
    color: COLORS.gold,
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    letterSpacing: 0,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  pageTitle: {
    color: COLORS.ink,
    fontFamily: "Helvetica-Bold",
    fontSize: 24,
    lineHeight: 1.15,
    marginBottom: 24,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.line,
    borderRadius: 6,
    borderWidth: 1,
    padding: 14,
    width: 241,
  },
  summaryCardWide: {
    width: 494,
  },
  summaryTitle: {
    color: COLORS.gold,
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    marginBottom: 7,
    textTransform: "uppercase",
  },
  summaryText: {
    color: COLORS.ink,
    fontSize: 10.5,
    lineHeight: 1.42,
  },
  promiseCard: {
    backgroundColor: COLORS.black,
    borderRadius: 6,
    marginTop: 18,
    padding: 22,
  },
  promiseLabel: {
    color: COLORS.gold,
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    marginBottom: 9,
    textTransform: "uppercase",
  },
  promiseText: {
    color: COLORS.white,
    fontFamily: "Helvetica-Bold",
    fontSize: 17,
    lineHeight: 1.32,
  },
  section: {
    marginBottom: 18,
  },
  sectionHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
    marginBottom: 9,
  },
  sectionNumber: {
    backgroundColor: COLORS.black,
    borderRadius: 4,
    color: COLORS.gold,
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    paddingHorizontal: 7,
    paddingVertical: 5,
  },
  sectionTitleWrap: {
    flex: 1,
  },
  sectionTitle: {
    color: COLORS.ink,
    fontFamily: "Helvetica-Bold",
    fontSize: 15,
    marginBottom: 6,
  },
  sectionRule: {
    backgroundColor: COLORS.gold,
    height: 1,
    width: 84,
  },
  sectionBody: {
    paddingLeft: 42,
  },
  paragraph: {
    color: COLORS.ink,
    fontSize: 10.5,
    lineHeight: 1.45,
  },
  highlightBox: {
    backgroundColor: COLORS.darkPanel,
    borderLeftColor: COLORS.gold,
    borderLeftWidth: 3,
    borderRadius: 6,
    padding: 15,
  },
  highlightText: {
    color: COLORS.white,
    fontFamily: "Helvetica-Bold",
    fontSize: 13,
    lineHeight: 1.35,
  },
  mechanismBox: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.line,
    borderRadius: 6,
    borderWidth: 1,
    padding: 14,
  },
  cardStack: {
    gap: 9,
  },
  cardTitle: {
    color: COLORS.ink,
    fontFamily: "Helvetica-Bold",
    fontSize: 10.8,
    lineHeight: 1.3,
    marginBottom: 4,
  },
  nameList: {
    gap: 8,
  },
  nameCard: {
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderColor: COLORS.line,
    borderRadius: 6,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    padding: 11,
  },
  nameCardFeatured: {
    backgroundColor: COLORS.black,
    borderColor: COLORS.gold,
  },
  nameIndex: {
    color: COLORS.gold,
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    width: 18,
  },
  nameText: {
    color: COLORS.ink,
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
  },
  nameTextFeatured: {
    color: COLORS.white,
    fontFamily: "Helvetica-Bold",
    fontSize: 14,
  },
  twoColumnGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  benefitItem: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.line,
    borderRadius: 5,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    padding: 9,
    width: 215,
  },
  bullet: {
    color: COLORS.gold,
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    width: 8,
  },
  benefitText: {
    color: COLORS.ink,
    flex: 1,
    fontSize: 9.5,
    lineHeight: 1.35,
  },
  profileCard: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.line,
    borderRadius: 6,
    borderWidth: 1,
    padding: 12,
  },
  quoteCard: {
    backgroundColor: COLORS.soft,
    borderLeftColor: COLORS.gold,
    borderLeftWidth: 2,
    borderRadius: 5,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  quoteText: {
    color: COLORS.ink,
    fontFamily: "Helvetica-Oblique",
    fontSize: 10.5,
    lineHeight: 1.35,
  },
  structureItem: {
    alignItems: "flex-start",
    backgroundColor: COLORS.white,
    borderColor: COLORS.line,
    borderRadius: 6,
    borderWidth: 1,
    flexDirection: "row",
    gap: 11,
    padding: 12,
  },
  structureNumber: {
    backgroundColor: COLORS.black,
    borderRadius: 12,
    color: COLORS.gold,
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    paddingBottom: 5,
    paddingTop: 5,
    textAlign: "center",
    width: 24,
  },
  structureContent: {
    flex: 1,
  },
  objectionCard: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.line,
    borderRadius: 6,
    borderWidth: 1,
    gap: 7,
    padding: 12,
  },
  salesGrid: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.line,
    borderRadius: 6,
    borderWidth: 1,
    gap: 8,
    padding: 13,
  },
  checklistGroup: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.line,
    borderRadius: 6,
    borderWidth: 1,
    gap: 8,
    padding: 12,
  },
  roadmapFlow: {
    gap: 14,
  },
  roadmapStep: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.gold,
    borderRadius: 6,
    borderWidth: 1,
    gap: 8,
    padding: 12,
    position: "relative",
  },
  roadmapArrow: {
    alignSelf: "center",
    color: COLORS.gold,
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    marginBottom: -10,
    marginTop: 2,
  },
  checklistItem: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 8,
  },
  checkbox: {
    borderColor: COLORS.gold,
    borderRadius: 2,
    borderWidth: 1,
    height: 10,
    marginTop: 2,
    width: 10,
  },
  reasonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  reasonCard: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.line,
    borderRadius: 6,
    borderWidth: 1,
    minHeight: 92,
    padding: 14,
    width: 241,
  },
  reasonIndex: {
    color: COLORS.gold,
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    marginBottom: 9,
  },
  reasonText: {
    color: COLORS.ink,
    fontSize: 10.5,
    lineHeight: 1.42,
  },
  executiveChecklist: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.line,
    borderRadius: 7,
    borderWidth: 1,
    gap: 10,
    padding: 18,
  },
  executiveChecklistItem: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 10,
  },
  executiveCheckbox: {
    borderColor: COLORS.gold,
    borderRadius: 2,
    borderWidth: 1,
    height: 11,
    marginTop: 2,
    width: 11,
  },
  executiveChecklistText: {
    color: COLORS.ink,
    flex: 1,
    fontSize: 11,
    lineHeight: 1.35,
  },
  statusItem: {
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderColor: COLORS.line,
    borderRadius: 5,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    padding: 9,
    width: 215,
  },
  statusDone: {
    color: "#237a4b",
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    width: 12,
  },
  statusCurrent: {
    color: COLORS.gold,
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    width: 12,
  },
  statusPending: {
    color: COLORS.muted,
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    width: 12,
  },
  field: {
    gap: 3,
  },
  fieldLabel: {
    color: COLORS.gold,
    fontFamily: "Helvetica-Bold",
    fontSize: 8.7,
    textTransform: "uppercase",
  },
  fieldText: {
    color: COLORS.ink,
    fontSize: 10,
    lineHeight: 1.35,
  },
  fieldTextMuted: {
    color: COLORS.muted,
    fontSize: 9.7,
    lineHeight: 1.35,
  },
  metaLabel: {
    gap: 4,
  },
  metaLabelDark: {
    color: "#bdb7aa",
    fontSize: 8.5,
    textTransform: "uppercase",
  },
  metaValueDark: {
    color: COLORS.white,
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    lineHeight: 1.25,
  },
  metaLabelText: {
    color: COLORS.muted,
    fontSize: 8.5,
    textTransform: "uppercase",
  },
  metaValueText: {
    color: COLORS.ink,
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
  },
  runningFooter: {
    bottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    left: 46,
    position: "absolute",
    right: 46,
  },
  footerText: {
    color: "#8a8376",
    fontSize: 8,
  },
  finalPage: {
    padding: 54,
  },
  finalPanel: {
    borderColor: COLORS.gold,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 520,
    padding: 34,
  },
  finalTitle: {
    color: COLORS.white,
    fontFamily: "Helvetica-Bold",
    fontSize: 28,
    lineHeight: 1.16,
    marginBottom: 24,
  },
  finalText: {
    color: COLORS.paper,
    fontSize: 12,
    lineHeight: 1.5,
    marginBottom: 12,
  },
  finalButton: {
    backgroundColor: COLORS.gold,
    borderRadius: 5,
    color: COLORS.black,
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    marginTop: 16,
    paddingHorizontal: 18,
    paddingVertical: 12,
    textAlign: "center",
    textDecoration: "none",
    width: 230,
  },
  finalFooter: {
    bottom: 34,
    color: "#bdb7aa",
    fontSize: 8.5,
    left: 54,
    position: "absolute",
  },
});
