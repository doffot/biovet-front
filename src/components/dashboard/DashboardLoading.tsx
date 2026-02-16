// src/views/dashboard/components/DashboardLoading.tsx
import { PawPrint } from "lucide-react";

export function DashboardLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-14 h-14 mx-auto mb-3">
          <div className="absolute inset-0 border-4 border-gray-200 rounded-full" />
          <div className="absolute inset-0 border-4 border-vet-primary border-t-transparent rounded-full animate-spin" />
          <PawPrint className="absolute inset-0 m-auto w-5 h-5 text-vet-primary" />
        </div>
        <p className="text-gray-600 font-medium text-sm">Cargando dashboard...</p>
      </div>
    </div>
  );
}