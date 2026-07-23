import { BrandLogo } from "@/components/BrandLogo";

export function LibraryHeader() {
  return (
    <header className="biblioteca-hero" aria-labelledby="biblioteca-title">
      <div className="biblioteca-hero__brand">
        <BrandLogo height={84} width={280} variant="horizontal" />
      </div>
      <p className="biblioteca-eyebrow">Desafio Produto Pronto</p>
      <h1 id="biblioteca-title">Biblioteca de Prompts e Skills</h1>
      <p className="biblioteca-hero__description">
        Todos os prompts e skills utilizados durante o Desafio Produto Pronto, organizados para facilitar sua execucao.
      </p>
      <p className="biblioteca-hero__notice">
        Os materiais podem ser atualizados. Utilize sempre a versao disponivel nesta biblioteca.
      </p>
    </header>
  );
}
