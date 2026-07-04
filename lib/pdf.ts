import "server-only";

import type { ProductResult } from "@/types";

type PdfSection = {
  title: string;
  content: string | string[];
};

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const MARGIN = 52;
const LINE_HEIGHT = 15;
const FONT_SIZE = 10;
const TITLE_SIZE = 22;
const SECTION_SIZE = 13;

export function generateProductResultPdf({
  createdAt,
  result,
  whatsappUrl,
}: {
  createdAt: string;
  result: ProductResult;
  whatsappUrl?: string;
}): Uint8Array {
  const writer = new PdfWriter();
  let y = PAGE_HEIGHT - MARGIN;

  function ensureSpace(requiredSpace: number) {
    if (y - requiredSpace < MARGIN) {
      writer.addPage();
      y = PAGE_HEIGHT - MARGIN;
    }
  }

  function addText(text: string, size = FONT_SIZE, leading = LINE_HEIGHT) {
    const lines = wrapText(text, size === TITLE_SIZE ? 48 : 88);

    for (const line of lines) {
      ensureSpace(leading);
      writer.text(MARGIN, y, line, size, size >= SECTION_SIZE);
      y -= leading;
    }
  }

  function addSection(section: PdfSection) {
    ensureSpace(52);
    y -= 7;
    addText(section.title, SECTION_SIZE, 18);

    if (Array.isArray(section.content)) {
      section.content.forEach((item) => addText(`- ${item}`));
    } else {
      addText(section.content);
    }
  }

  writer.addPage();
  addText("Produto Pronto", TITLE_SIZE, 28);
  addText(`Estrategia gerada em ${formatDate(createdAt)}`, 10, 18);
  y -= 8;

  getPdfSections(result).forEach(addSection);

  ensureSpace(92);
  y -= 10;
  addText("Quer transformar essa estrategia em um produto pronto para vender?", SECTION_SIZE, 18);
  addText(
    "Eu posso te ajudar a construir posicionamento, oferta, pagina de vendas e plano de lancamento.",
  );
  addText(
    whatsappUrl
      ? `Fale comigo para construir esse produto: ${whatsappUrl}`
      : "Fale comigo para construir esse produto: link de WhatsApp em configuracao",
  );

  return writer.render();
}

function getPdfSections(result: ProductResult): PdfSection[] {
  return [
    { title: "Oportunidade de Mercado", content: result.oportunidade },
    { title: "Nicho Validado", content: result.nicho },
    { title: "Ideia do Produto", content: result.ideia },
    { title: "Sugestoes de Nome", content: result.nomes },
    { title: "Promessa Principal", content: result.promessa },
    { title: "Beneficios", content: result.beneficios },
    {
      title: "Perfis Ideais de Cliente",
      content: result.perfis_clientes.map((profile) => `${profile.titulo}: ${profile.descricao}`),
    },
    { title: "Frases que seu Cliente Diria", content: result.frases_cliente },
    { title: "Estrutura do Conteudo", content: result.estrutura },
    { title: "Preco Sugerido", content: result.preco },
    { title: "Proximos Passos", content: result.proximo_passo },
    { title: "CTA final", content: result.cta_consultoria },
  ];
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function wrapText(text: string, maxCharacters: number) {
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;

    if (nextLine.length > maxCharacters && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = nextLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.length ? lines : [""];
}

class PdfWriter {
  private pages: string[] = [];
  private currentCommands: string[] = [];

  addPage() {
    if (this.currentCommands.length) {
      this.pages.push(this.currentCommands.join("\n"));
    }

    this.currentCommands = [];
  }

  text(x: number, y: number, text: string, size: number, bold = false) {
    const font = bold ? "F2" : "F1";
    this.currentCommands.push(
      `BT /${font} ${size} Tf ${x} ${y} Td (${escapePdfText(text)}) Tj ET`,
    );
  }

  render() {
    if (this.currentCommands.length) {
      this.pages.push(this.currentCommands.join("\n"));
      this.currentCommands = [];
    }

    const objects: string[] = [
      "<< /Type /Catalog /Pages 2 0 R >>",
      `<< /Type /Pages /Kids ${this.pages
        .map((_, index) => `${3 + index * 2} 0 R`)
        .join(" ")} /Count ${this.pages.length} >>`,
    ];

    this.pages.forEach((content, index) => {
      const pageObjectNumber = 3 + index * 2;
      const contentObjectNumber = pageObjectNumber + 1;
      objects.push(
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> /F2 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> >> >> /Contents ${contentObjectNumber} 0 R >>`,
      );
      objects.push(`<< /Length ${Buffer.byteLength(content, "latin1")} >>\nstream\n${content}\nendstream`);
    });

    let body = "%PDF-1.4\n";
    const offsets = [0];

    objects.forEach((object, index) => {
      offsets.push(Buffer.byteLength(body, "latin1"));
      body += `${index + 1} 0 obj\n${object}\nendobj\n`;
    });

    const xrefOffset = Buffer.byteLength(body, "latin1");
    body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    offsets.slice(1).forEach((offset) => {
      body += `${String(offset).padStart(10, "0")} 00000 n \n`;
    });
    body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

    return new Uint8Array(Buffer.from(body, "latin1"));
  }
}

function escapePdfText(text: string) {
  return removeDiacritics(text).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function removeDiacritics(text: string) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
