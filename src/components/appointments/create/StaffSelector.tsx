import type { Staff } from "../../../types/staff";

type StaffSelectorProps = {
  staffList: Staff[];
  selectedStaffId: string | null;
  onSelect: (staffId: string) => void;
  currentVetId?: string;
  currentVetName?: string;
  currentVetLastName?: string;
  isLoading?: boolean;
};

export default function StaffSelector({
  staffList,
  selectedStaffId,
  onSelect,
  currentVetId,
  currentVetName,
  currentVetLastName,
  isLoading = false,
}: StaffSelectorProps) {
  const veterinarians = staffList.filter(
    (s) => s.role === "veterinario" && s.active
  );

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-dark-200 rounded-xl border border-surface-200 dark:border-dark-100 p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
          Veterinario que atenderá
        </h3>
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-10 w-28 bg-surface-100 dark:bg-dark-300 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  const buttonClass = (isSelected: boolean) => `
    px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border
    ${
      isSelected
        ? "bg-biovet-500 text-white shadow-sm border-biovet-600"
        : "bg-surface-50 dark:bg-dark-300 text-slate-700 dark:text-slate-300 hover:bg-biovet-50 dark:hover:bg-biovet-950/30 hover:text-biovet-600 dark:hover:text-biovet-400 border-surface-200 dark:border-dark-100"
    }
  `;

  return (
    <div className="bg-white dark:bg-dark-200 rounded-xl border border-surface-200 dark:border-dark-100 p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
        Veterinario que atenderá
      </h3>

      <div className="flex flex-wrap gap-2">
        {currentVetId && (
          <button
            type="button"
            onClick={() => onSelect(currentVetId)}
            className={buttonClass(selectedStaffId === currentVetId)}
          >
            {currentVetName} {currentVetLastName}
          </button>
        )}

        {veterinarians
          .filter((s) => !s.isOwner)
          .map((staff) => (
            <button
              key={staff._id}
              type="button"
              onClick={() => onSelect(staff._id!)}
              className={buttonClass(selectedStaffId === staff._id)}
            >
              {staff.name} {staff.lastName}
            </button>
          ))}
      </div>
    </div>
  );
}