// src/components/appointment/AppointmentTimeSelector.tsx

import { useState, useEffect, useMemo } from "react";
import type { Appointment } from "../../types/appointment";

type HourOption = {
  value: string;
  label: string;
  isDisabled: boolean;
  patientName?: string;
  reason?: string;
};
export function Calendar({ selectedDate, onDateChange }: { selectedDate: Date; onDateChange: (date: Date) => void }) {
  const handleDateSelect = (day: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(day);
    onDateChange(newDate);
  };

  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysOfWeek = ["D", "L", "M", "X", "J", "V", "S"];
  const monthNames = [
    "Ene", "Feb", "Mar", "Abr", "May", "Jun",
    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
  ];

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  return (
    <div>
      <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded p-3 border border-slate-600">
        <div className="flex justify-between items-center mb-3">
          <button
            onClick={() =>
              onDateChange(
                new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1)
              )
            }
            className="text-emerald-400 hover:text-emerald-300 font-bold text-sm"
          >
            ‹
          </button>
          <h4 className="text-white font-bold text-xs">
            {monthNames[month]} {year}
          </h4>
          <button
            onClick={() =>
              onDateChange(
                new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1)
              )
            }
            className="text-emerald-400 hover:text-emerald-300 font-bold text-sm"
          >
            ›
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {daysOfWeek.map((day) => (
            <div key={day} className="text-center text-[10px] font-semibold text-slate-400 py-1">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day, idx) => {
            if (day === null) return <div key={idx} />;
            const isToday =
              day === new Date().getDate() &&
              month === new Date().getMonth() &&
              year === new Date().getFullYear();
            const isSelected =
              day === selectedDate.getDate() &&
              month === selectedDate.getMonth() &&
              year === selectedDate.getFullYear();
            return (
              <button
                key={idx}
                onClick={() => handleDateSelect(day)}
                className={`text-center text-[10px] p-1 rounded font-semibold transition-all ${
                  isSelected
                    ? "bg-emerald-500 text-white shadow"
                    : isToday
                    ? "bg-slate-600 text-white ring-1 ring-emerald-400"
                    : "text-slate-300 hover:bg-slate-600"
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function TimeSlots({ 
  selectedDate, 
  selectedTime, 
  onTimeSelect, 
  disabledHoursData 
}: { 
  selectedDate: Date;
  selectedTime: string | null;
  onTimeSelect: (time: string) => void;
  disabledHoursData: Appointment[];
}) {
  const [hoveredSlot, setHoveredSlot] = useState<HourOption | null>(null);

  const getPatientName = (appointment: Appointment): string | undefined => {
    if (typeof appointment.patient === "object" && appointment.patient !== null) {
      return (appointment.patient as any).name;
    }
    return undefined;
  };

  const timeSlots = useMemo<HourOption[]>(() => {
    const activeAppointments = disabledHoursData.filter(
      apt => apt.status === "Programada"
    );

    const slots: HourOption[] = [];
    const startHour = 7;
    const endHour = 22;
    const interval = 30;

    for (let h = startHour; h < endHour; h++) {
      for (let m = 0; m < 60; m += interval) {
        const hour24 = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

        const existingAppointment = activeAppointments.find((apt) => {
          try {
            const aptDate = new Date(apt.date);
            const aptHours = aptDate.getHours();
            const aptMinutes = aptDate.getMinutes();
            
            return aptHours === h && aptMinutes === m;
          } catch (error) {
            console.error('Error parsing appointment date:', apt.date, error);
            return false;
          }
        });

        const period = h >= 12 ? "PM" : "AM";
        const displayHour = h % 12 || 12;
        const label = `${displayHour}:${String(m).padStart(2, "0")}${period === "AM" ? "a" : "p"}`;

        const patientName = existingAppointment ? getPatientName(existingAppointment) : undefined;
        
        slots.push({
          value: hour24,
          label,
          isDisabled: !!existingAppointment,
          patientName: patientName,
          reason: existingAppointment?.reason,
        });
      }
    }
    return slots;
  }, [selectedDate, disabledHoursData]);

  const handleTimeClick = (time: string, isDisabled: boolean) => {
    if (isDisabled) return;

    if (selectedTime === time) {
      onTimeSelect("");
    } else {
      onTimeSelect(time);
    }
  };

  const handleTimeMouseEnter = (slot: HourOption) => {
    if (slot.isDisabled) {
      setHoveredSlot(slot);
    }
  };

  const handleTimeMouseLeave = () => {
    setHoveredSlot(null);
  };

  return (
    <div className="relative">
      <h3 className="text-white font-bold mb-3 text-sm">⏰ Horas</h3>
      
      {hoveredSlot && (
        <div className="absolute z-50 bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow-xl border border-red-400 font-semibold top-0 left-1/2 transform -translate-x-1/2 -translate-y-full">
          🚫 {hoveredSlot.patientName || 'Ocupado'}
        </div>
      )}

      <div className="grid grid-cols-4 gap-1 max-h-[300px] overflow-y-auto">
        {timeSlots.map((slot) => (
          <button
            key={slot.value}
            onClick={() => handleTimeClick(slot.value, slot.isDisabled)}
            onMouseEnter={() => handleTimeMouseEnter(slot)}
            onMouseLeave={handleTimeMouseLeave}
            disabled={slot.isDisabled}
            className={`p-1 text-[10px] rounded font-semibold transition-all ${
              selectedTime === slot.value
                ? "bg-emerald-500 text-white shadow scale-105"
                : slot.isDisabled
                ? "bg-red-900/30 text-red-300 cursor-not-allowed border border-red-600"
                : "bg-slate-600 text-slate-200 hover:bg-emerald-500 hover:text-white"
            }`}
          >
            {slot.label}
            {slot.isDisabled && <span className="text-[8px] ml-0.5">🚫</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

interface AppointmentTimeSelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onTimeSelect: (time: string) => void;
  disabledHoursData: Appointment[];
  initialTime?: string;
}

export default function AppointmentTimeSelector({
  selectedDate,
  onDateChange,
  onTimeSelect,
  disabledHoursData,
  initialTime = "",
}: AppointmentTimeSelectorProps) {
  const [selectedTime, setSelectedTime] = useState<string | null>(initialTime || null);

  useEffect(() => {
    setSelectedTime(initialTime || null);
  }, [initialTime]);

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time === selectedTime ? null : time);
    onTimeSelect(time === selectedTime ? "" : time);
  };

  return (
    <div className="w-full space-y-3">
      <Calendar selectedDate={selectedDate} onDateChange={onDateChange} />
      <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded p-3 border border-slate-600">
        <TimeSlots 
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          onTimeSelect={handleTimeSelect}
          disabledHoursData={disabledHoursData}
        />
      </div>
    </div>
  );
}