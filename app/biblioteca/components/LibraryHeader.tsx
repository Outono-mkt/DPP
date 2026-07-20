import { BrandLogo } from "@/components/BrandLogo";

export function LibraryHeader() {
  return (
    <header className="biblioteca-hero" aria-labelledby="biblioteca-title">
      <div className="biblioteca-hero__brand">
        <BrandLogo variant="light" size="md" />
      </div>
      <p className="biblioteca-eyebrow">Desafio Produto Pronto</p>
      <h1 id="biblioteca-title">Biblioteca de Prompts</h1>
      <p className="biblioteca-hero__description">
        Todos os prompts, skills, checklists e materiais utilizados durante o Desafio Produto Pronto,
        organizados para facilitar sua execução.
      </p>
      <p className="biblioteca-hero__notice">
        Os materiais podem ser atualizados. Utilize sempre a versão disponível nesta biblioteca.
      </p>
    </header>
  );
}
