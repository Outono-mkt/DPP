import type { LibraryDay } from "../data/materiais";
import { dayGroups } from "../data/materiais";

export function DayNavigation({
  activeDay,
  onChange,
}: {
  activeDay: LibraryDay;
  onChange: (day: LibraryDay) => void;
}) {
  return (
    <nav className="biblioteca-day-nav" aria-label="Navegação por dia">
      {dayGroups.map((day) => (
        <button
          aria-pressed={activeDay === day.id}
          className="biblioteca-day-chip"
          data-active={activeDay === day.id}
          key={day.id}
          onClick={() => onChange(day.id)}
          type="button"
        >
          {day.label}
        </button>
      ))}
    </nav>
  );
}
