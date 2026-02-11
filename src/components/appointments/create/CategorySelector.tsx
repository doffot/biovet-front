import { appointmentTypesValues, type AppointmentType } from "../../../types/appointment";

type CategorySelectorProps = {
  selectedType: AppointmentType | null;
  onSelect: (type: AppointmentType) => void;
};

export default function CategorySelector({
  selectedType,
  onSelect,
}: CategorySelectorProps) {
  return (
    <div className="bg-white dark:bg-dark-200 rounded-xl border border-surface-200 dark:border-dark-100 p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
        Tipo de cita
      </h3>

      <div className="flex flex-wrap gap-2">
        {appointmentTypesValues.map((type) => {
          const isSelected = selectedType === type;

          return (
            <button
              key={type}
              type="button"
              onClick={() => onSelect(type)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${
                  isSelected
                    ? "bg-biovet-500 text-white shadow-sm border border-biovet-600"
                    : "bg-surface-50 dark:bg-dark-300 text-slate-700 dark:text-slate-300 hover:bg-biovet-50 dark:hover:bg-biovet-950/30 hover:text-biovet-600 dark:hover:text-biovet-400 border border-surface-200 dark:border-dark-100"
                }
              `}
            >
              {type}
            </button>
          );
        })}
      </div>
    </div>
  );
}