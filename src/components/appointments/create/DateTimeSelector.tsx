import { useState, useMemo, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar, Clock } from "lucide-react";
import type { Appointment } from "../../../types/appointment";

type DateTimeSelectorProps = {
  selectedDate: Date;
  selectedTime: string | null;
  onDateChange: (date: Date) => void;
  onTimeSelect: (time: string) => void;
  disabledHoursData: Appointment[];
};

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const DAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export default function DateTimeSelector({
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeSelect,
  disabledHoursData,
}: DateTimeSelectorProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentMonth, setCurrentMonth] = useState(selectedDate.getMonth());
  const [currentYear, setCurrentYear] = useState(selectedDate.getFullYear());

  const daysInMonth = useMemo(() => {
    const days: Date[] = [];
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();

    for (let day = 1; day <= totalDays; day++) {
      days.push(new Date(currentYear, currentMonth, day));
    }
    return days;
  }, [currentMonth, currentYear]);

  const timeSlots = useMemo(() => {
    const slots: { value: string; label: string; isDisabled: boolean; patientName?: string }[] = [];
    const startHour = 7;
    const endHour = 22;
    const interval = 30;

    const activeAppointments = disabledHoursData.filter(
      (apt) => apt.status === "Programada"
    );

    for (let h = startHour; h < endHour; h++) {
      for (let m = 0; m < 60; m += interval) {
        const hour24 = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

        const existingAppointment = activeAppointments.find((apt) => {
          try {
            const aptDate = new Date(apt.date);
            return aptDate.getHours() === h && aptDate.getMinutes() === m;
          } catch {
            return false;
          }
        });

        const period = h >= 12 ? "PM" : "AM";
        const displayHour = h % 12 || 12;
        const label = `${displayHour}:${String(m).padStart(2, "0")} ${period}`;

        const patientName = existingAppointment && typeof existingAppointment.patient === "object"
          ? (existingAppointment.patient as any).name
          : undefined;

        slots.push({
          value: hour24,
          label,
          isDisabled: !!existingAppointment,
          patientName,
        });
      }
    }
    return slots;
  }, [selectedDate, disabledHoursData]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      const selectedDayElement = scrollContainerRef.current.querySelector('[data-selected="true"]');
      if (selectedDayElement) {
        selectedDayElement.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }
  }, [currentMonth, currentYear]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const scrollDays = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleDaySelect = (date: Date) => {
    onDateChange(date);
    onTimeSelect("");
  };

  const handleTimeClick = (time: string, isDisabled: boolean) => {
    if (isDisabled) return;
    onTimeSelect(selectedTime === time ? "" : time);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date: Date) => {
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <div className="bg-white dark:bg-dark-200 rounded-xl border border-surface-200 dark:border-dark-100 shadow-sm overflow-hidden">

      {/* Header mes/año */}
      <div className="bg-biovet-500 dark:bg-biovet-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-white">
            <Calendar className="w-4 h-4" />
            <span className="font-semibold font-heading">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </span>
          </div>

          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Selector de días horizontal */}
      <div className="p-4 border-b border-surface-200 dark:border-dark-100">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scrollDays("left")}
            className="shrink-0 p-2 rounded-lg bg-surface-50 dark:bg-dark-300 hover:bg-biovet-50 dark:hover:bg-biovet-950/30 hover:text-biovet-500 text-slate-700 dark:text-slate-300 transition-colors border border-surface-200 dark:border-dark-100"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div
            ref={scrollContainerRef}
            className="flex-1 flex gap-2 overflow-x-auto scrollbar-none"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {daysInMonth.map((date) => {
              const dayIsToday = isToday(date);
              const dayIsSelected = isSelected(date);
              const dayIsPast = isPastDate(date);

              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  data-selected={dayIsSelected}
                  onClick={() => !dayIsPast && handleDaySelect(date)}
                  disabled={dayIsPast}
                  className={`
                    shrink-0 flex flex-col items-center justify-center
                    w-14 h-16 rounded-xl transition-all duration-200 border
                    ${
                      dayIsSelected
                        ? "bg-biovet-500 text-white shadow-lg border-biovet-600"
                        : dayIsToday
                          ? "bg-biovet-50 dark:bg-biovet-950/30 text-biovet-600 dark:text-biovet-400 ring-2 ring-biovet-400 dark:ring-biovet-500 border-transparent"
                          : dayIsPast
                            ? "bg-surface-50 dark:bg-dark-300 text-surface-400 dark:text-slate-600 cursor-not-allowed opacity-50 border-surface-200 dark:border-dark-100"
                            : "bg-surface-50 dark:bg-dark-300 text-slate-700 dark:text-slate-300 hover:bg-biovet-50 dark:hover:bg-biovet-950/30 hover:text-biovet-600 dark:hover:text-biovet-400 border-surface-200 dark:border-dark-100"
                    }
                  `}
                >
                  <span className="text-[10px] font-medium uppercase">
                    {DAY_NAMES[date.getDay()]}
                  </span>
                  <span className="text-lg font-bold">{date.getDate()}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => scrollDays("right")}
            className="shrink-0 p-2 rounded-lg bg-surface-50 dark:bg-dark-300 hover:bg-biovet-50 dark:hover:bg-biovet-950/30 hover:text-biovet-500 text-slate-700 dark:text-slate-300 transition-colors border border-surface-200 dark:border-dark-100"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Selector de horas */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-surface-500 dark:text-slate-400" />
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Horarios disponibles
          </span>
          {selectedTime && (
            <span className="ml-auto badge badge-biovet">
              {timeSlots.find(s => s.value === selectedTime)?.label}
            </span>
          )}
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-45 overflow-y-auto custom-scrollbar">
          {timeSlots.map((slot) => (
            <button
              key={slot.value}
              type="button"
              onClick={() => handleTimeClick(slot.value, slot.isDisabled)}
              disabled={slot.isDisabled}
              title={slot.isDisabled ? `Ocupado: ${slot.patientName || 'Cita existente'}` : `Seleccionar ${slot.label}`}
              className={`
                p-2 text-xs rounded-lg font-medium transition-all duration-200 border
                ${
                  selectedTime === slot.value
                    ? "bg-biovet-500 text-white shadow-sm border-biovet-600"
                    : slot.isDisabled
                      ? "bg-danger-50 dark:bg-danger-950/20 text-danger-400 cursor-not-allowed line-through border-danger-100 dark:border-danger-900/30"
                      : "bg-surface-50 dark:bg-dark-300 text-slate-700 dark:text-slate-300 hover:bg-biovet-50 dark:hover:bg-biovet-950/30 hover:text-biovet-600 dark:hover:text-biovet-400 border-surface-200 dark:border-dark-100"
                }
              `}
            >
              {slot.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}