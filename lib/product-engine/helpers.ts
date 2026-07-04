import { productFormats } from "./formats";
import type { ProductFormatMethodology } from "./types";

export function getProductFormatMethodology(selectedFormat: string): ProductFormatMethodology {
  const normalized = normalizeText(selectedFormat);

  const exactMatch = productFormats.find((format) =>
    [format.name, ...format.aliases].some((alias) => normalizeText(alias) === normalized),
  );

  if (exactMatch) {
    return exactMatch;
  }

  const partialMatch = productFormats.find((format) =>
    [format.name, ...format.aliases].some((alias) => {
      const normalizedAlias = normalizeText(alias);
      return normalized.includes(normalizedAlias) || normalizedAlias.includes(normalized);
    }),
  );

  return partialMatch ?? productFormats.find((format) => format.id === "challenge") ?? productFormats[0];
}

export function formatMethodologyForPrompt(format: ProductFormatMethodology): string {
  return [
    `Formato metodologico: ${format.name}`,
    `Tipo de estrutura: ${format.structureType}`,
    `Quantidade ideal de etapas: ${format.idealQuantity}`,
    `Logica do formato: ${format.positioningLogic}`,
    "Estrutura padrao obrigatoria:",
    ...format.steps.map(
      (step, index) => `${index + 1}. ${step.name}: ${step.objective}`,
    ),
  ].join("\n");
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
