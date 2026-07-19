const FORMAT_LABELS: Record<string, string> = {
  agente_gpt: "Agente GPT",
  checklist: "Checklist",
  comunidade: "Comunidade",
  consultoria: "Consultoria",
  curso_ao_vivo: "Curso ao Vivo",
  curso_gravado: "Curso Gravado",
  desafio: "Desafio",
  ebook: "E-book",
  e_book: "E-book",
  mentoria_em_grupo: "Mentoria em Grupo",
  mentoria_individual: "Mentoria Individual",
  mini_saas: "Mini SaaS",
  planilha: "Planilha",
  servico: "Servi\u00e7o",
  template: "Template",
  workshop: "Workshop",
};

export function formatProductFormatLabel(value: string | null | undefined, fallback = "Produto Digital") {
  const rawValue = value?.trim();

  if (!rawValue) return fallback;

  const normalized = normalizeFormatKey(rawValue);
  return FORMAT_LABELS[normalized] ?? rawValue;
}

function normalizeFormatKey(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}
