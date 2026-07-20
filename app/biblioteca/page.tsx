import type { Metadata } from "next";

import { BibliotecaExperience } from "./BibliotecaExperience";
import "./biblioteca.css";

const title = "Biblioteca de Prompts - Desafio Produto Pronto";
const description =
  "Acesse os prompts, skills, checklists e materiais utilizados durante o Desafio Produto Pronto.";
const url = "https://produtopronto.vercel.app/biblioteca";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: url,
  },
  openGraph: {
    title,
    description,
    url,
    siteName: "Produto Pronto",
    images: [{ url: "/brand/og-image.png", width: 1729, height: 910, alt: "Produto Pronto" }],
    type: "website",
  },
  robots: {
    follow: true,
    index: true,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/brand/og-image.png"],
  },
};

export default function BibliotecaPage() {
  return <BibliotecaExperience />;
}
