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
import DetailPatientView from "@/views/patients/DetailPatientView"; 
import PatientsListView from "@/views/patients/PatientsListView"; // <-- NUEVA VISTA DE LISTA
import VaccinationView from "./views/vaccinations/VaccinationView";
import DewormingView from "./views/dewormings/DewormingView";
import ConsultationView from "./views/consultations/ConsultationView";
import CreateConsultationView from "./views/consultations/CreateConsultationView";
import ConsultationDetailView from "./views/consultations/ConsultationDetailView";

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
             <Route path=":ownerId/patients/new" element={<CreatePatientView />} />
          </Route>

          {/* ✅ PACIENTES (Lista General) */}
          <Route path="/patients">
             <Route index element={<PatientsListView />} /> {/* <-- Aquí pegas la PatientTable */}
          </Route>
          
              {/* PATIENT LAYOUT (Perfil de Mascota) */}
          <Route path="/patients/:patientId" element={<PatientLayout />}>
              {/* index: Lo que se ve al entrar (Resumen/Ficha) */}
              <Route index element={<DetailPatientView />} /> 
              
              <Route path="vaccines" element={<VaccinationView />} />
              <Route path="deworming" element={<DewormingView/>} />
              <Route path="consultations" element={<ConsultationView/>} />
              <Route path="consultations/new" element={<CreateConsultationView />} />
              <Route path="consultations/:consultationId" element={<ConsultationDetailView />} />
              
              {/* Pestañas adicionales */}
              
              <Route path="treatments" element={<div>Vista Tratamientos (Próximamente)</div>} />
              <Route path="appointments" element={<div>Vista Citas (Próximamente)</div>} />
          </Route>


          {/* Placeholders */}
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

        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}