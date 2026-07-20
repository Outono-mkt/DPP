"use client";

import { useMemo, useState } from "react";

import { DayNavigation } from "./components/DayNavigation";
import { EmptyState } from "./components/EmptyState";
import { LibraryHeader } from "./components/LibraryHeader";
import { MaterialCard } from "./components/MaterialCard";
import { MaterialFilters, type MaterialFiltersValue } from "./components/MaterialFilters";
import type { LibraryMaterial } from "./data/materiais";
import { dayGroups, libraryMaterials } from "./data/materiais";

const initialFilters: MaterialFiltersValue = {
  day: "todos",
  priority: "todos",
  query: "",
  type: "todos",
};

export function BibliotecaExperience() {
  const [filters, setFilters] = useState(initialFilters);
  const [openCards, setOpenCards] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState("");

  const filteredMaterials = useMemo(() => filterMaterials(libraryMaterials, filters), [filters]);
  const visibleDays = dayGroups.filter((day) => day.id !== "todos");
  const activeDayInfo = dayGroups.find((day) => day.id === filters.day) ?? dayGroups[0];
  const hasOpenCards = openCards.length > 0;

  function updateFilters(next: MaterialFiltersValue) {
    setFilters(next);
  }

  function changeDay(day: MaterialFiltersValue["day"]) {
    setFilters((current) => ({ ...current, day }));
  }

  function toggleCard(id: string) {
    setOpenCards((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (window.matchMedia("(max-width: 768px)").matches) return [id];
      return [...current, id];
    });
  }

  async function copyPrompt(material: LibraryMaterial) {
    if (!material.conteudoPrompt) return;
    try {
      await navigator.clipboard.writeText(material.conteudoPrompt);
      setCopiedId(material.id);
      setCopyMessage("Prompt copiado para a área de transferência.");
      window.setTimeout(() => {
        setCopiedId((current) => (current === material.id ? null : current));
        setCopyMessage("");
      }, 2200);
    } catch {
      setCopyMessage("Não foi possível copiar agora. Abra os detalhes e copie o texto manualmente.");
    }
  }

  return (
    <main className="biblioteca-page">
      <LibraryHeader />
      <section className="biblioteca-shell" aria-label="Materiais da biblioteca">
        <DayNavigation activeDay={filters.day} onChange={changeDay} />
        <div className="biblioteca-section-heading">
          <div>
            <p className="biblioteca-eyebrow">Sistema de execução</p>
            <h2>{activeDayInfo.title}</h2>
            <p>{activeDayInfo.objective}</p>
          </div>
          {hasOpenCards ? (
            <button className="biblioteca-close-all" onClick={() => setOpenCards([])} type="button">
              Fechar todos
            </button>
          ) : null}
        </div>
        <MaterialFilters value={filters} onChange={updateFilters} />
        <p className="biblioteca-copy-feedback" aria-live="polite">
          {copyMessage}
        </p>
        {filteredMaterials.length > 0 ? (
          <div className="biblioteca-day-sections">
            {visibleDays.map((day) => {
              const materials = filteredMaterials.filter((material) => material.dia === day.id);
              if (!materials.length) return null;

              return (
                <section className="biblioteca-day-section" key={day.id} aria-labelledby={`${day.id}-title`}>
                  <div className="biblioteca-day-section__header">
                    <p>{day.label}</p>
                    <h3 id={`${day.id}-title`}>{day.title}</h3>
                    <span>{day.objective}</span>
                  </div>
                  <div className="biblioteca-list">
                    {materials.map((material) => (
                      <MaterialCard
                        copiedId={copiedId}
                        isOpen={openCards.includes(material.id)}
                        key={material.id}
                        material={material}
                        onCopyPrompt={copyPrompt}
                        onToggle={toggleCard}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <EmptyState />
        )}
      </section>
    </main>
  );
}

function filterMaterials(materials: LibraryMaterial[], filters: MaterialFiltersValue) {
  const query = normalizeSearchText(filters.query);

  return materials
    .filter((material) => filters.day === "todos" || material.dia === filters.day)
    .filter((material) => filters.type === "todos" || material.tipo === filters.type)
    .filter((material) => filters.priority === "todos" || material.prioridade === filters.priority)
    .filter((material) => {
      if (!query) return true;
      const searchable = [
        material.titulo,
        material.descricao,
        material.resultadoEsperado,
        material.ferramenta,
        ...material.tags,
      ]
        .filter(Boolean)
        .join(" ");

      return normalizeSearchText(searchable).includes(query);
    })
    .sort((a, b) => {
      if (a.dia === b.dia) return a.ordem - b.ordem;
      return dayIndex(a.dia) - dayIndex(b.dia);
    });
}

function dayIndex(day: LibraryMaterial["dia"]) {
  return dayGroups.findIndex((item) => item.id === day);
}

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
