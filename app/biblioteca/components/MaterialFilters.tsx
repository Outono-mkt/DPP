import type { LibraryDay, MaterialPriority, MaterialType } from "../data/materiais";
import { dayGroups, priorityLabels, typeLabels } from "../data/materiais";

export type MaterialFiltersValue = {
  day: LibraryDay;
  priority: MaterialPriority | "todos";
  query: string;
  type: MaterialType | "todos";
};

export function MaterialFilters({
  value,
  onChange,
}: {
  value: MaterialFiltersValue;
  onChange: (value: MaterialFiltersValue) => void;
}) {
  return (
    <section className="biblioteca-filters" aria-label="Busca e filtros">
      <div className="biblioteca-search">
        <label htmlFor="biblioteca-search">Buscar material</label>
        <input
          id="biblioteca-search"
          onChange={(event) => onChange({ ...value, query: event.target.value })}
          placeholder="Busque por título, ferramenta, resultado ou tag"
          type="search"
          value={value.query}
        />
      </div>
      <div className="biblioteca-filter-grid">
        <label>
          Tipo
          <select
            onChange={(event) => onChange({ ...value, type: event.target.value as MaterialFiltersValue["type"] })}
            value={value.type}
          >
            <option value="todos">Todos</option>
            {Object.entries(typeLabels).map(([type, label]) => (
              <option key={type} value={type}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Dia
          <select
            onChange={(event) => onChange({ ...value, day: event.target.value as LibraryDay })}
            value={value.day}
          >
            {dayGroups.map((day) => (
              <option key={day.id} value={day.id}>
                {day.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Prioridade
          <select
            onChange={(event) =>
              onChange({ ...value, priority: event.target.value as MaterialFiltersValue["priority"] })
            }
            value={value.priority}
          >
            <option value="todos">Todas</option>
            {Object.entries(priorityLabels).map(([priority, label]) => (
              <option key={priority} value={priority}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}
