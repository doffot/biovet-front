import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Dashboard from "@/views/Dashboard";
import { AppLayout } from "@/layouts/AppLayout";
import AuthLayout from "@/layouts/AuthLayout";
import PatientLayout from "@/layouts/PatientLayout";

// Views
import LoginView from "@/views/auth/LoginView";
import OwnersView from "@/views/owner/OwnersView";
import OwnerDetailView from "@/views/owner/OwnerDetailView";
import CreateOwnerView from "@/views/owner/CreateOwnerView";
import CreatePatientView from "@/views/patients/CreatePatientView";
import DetailPatientView from "@/views/patients/DetailPatientView"; // Esta es el "Resumen"
import VaccinationView from "./views/vaccinations/VaccinationView";
import DewormingView from "./views/dewormings/DewormingView";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* =============================================
            APP LAYOUT (Sidebar + Header + Content)
            ============================================= */}
        <Route element={<AppLayout />}>
          
          {/* Dashboard */}
          <Route path="/" element={<Dashboard />} index />
          
          {/* Dueños */}
          <Route path="/owners">
             <Route index element={<OwnersView />} />
             <Route path="create" element={<CreateOwnerView />} />
             <Route path=":ownerId" element={<OwnerDetailView />} />
             {/* Crear paciente desde el dueño */}
             <Route path=":ownerId/patients/new" element={<CreatePatientView />} />
          </Route>

          {/* Pacientes (Lista General) */}
          <Route path="/patients" element={<div>Lista general de pacientes (Pendiente)</div>} />
          
          {/* Crear Paciente (Ruta alternativa si no vienes del dueño) */}
          {/* Nota: createPatient necesita un ownerId, revisa si esta ruta es necesaria sola */}
          
          {/* =============================================
              PATIENT LAYOUT (Perfil de Mascota)
              Ruta: /patients/:patientId/...
              ============================================= */}
          <Route path="/patients/:patientId" element={<PatientLayout />}>
              {/* index: Lo que se ve al entrar (Resumen) */}
              <Route index element={<DetailPatientView />} /> 
               {/* ✅ NUEVA RUTA DE VACUNAS */}
              <Route path="vaccines" element={<VaccinationView />} />
              <Route path="deworming" element={<DewormingView/>} />
              
              {/* Aquí irán las otras pestañas del PatientLayout */}
              <Route path="consultations" element={<div>Vista Consultas</div>} />
              <Route path="treatments" element={<div>Vista Tratamientos</div>} />
              <Route path="vaccines" element={<div>Vista Vacunas</div>} />
              <Route path="appointments" element={<div>Vista Citas</div>} />
              {/* etc... */}
          </Route>


          {/* Placeholders para las otras rutas del menú (para que no den error 404) */}
          <Route path="/appointments" element={<div>Calendario de Citas</div>} />
          <Route path="/sales/*" element={<div>Módulo de Ventas</div>} />
          <Route path="/inventory/*" element={<div>Módulo de Inventario</div>} />
          <Route path="/purchases/*" element={<div>Módulo de Compras</div>} />
          <Route path="/reports/*" element={<div>Módulo de Reportes</div>} />
          <Route path="/settings/*" element={<div>Configuraciones</div>} />

        </Route>

        {/* =============================================
            AUTH LAYOUT
            ============================================= */}
        <Route element={<AuthLayout />}>
          <Route path="/auth/login" element={<LoginView />} />
        </Route>

        {/* Catch all - 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}