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
import EditConsultationView from "./views/consultations/EditConsultationView";
import CreateAppointmentView from "./views/appointment/CreateAppointmentView";
import AppointmentView from "./views/appointment/AppointmentView";
import AppointmentDetailView from "./views/appointment/AppointmentDetailView";
import EditAppointmentView from "./views/appointment/EditAppointmentView";
import PatientLabExamListView from "./views/labExams/PatientLabExamListView";
import CreateLabExamView from "./views/labExams/CreateLabExamView";
import GroomingServiceListView from "./views/grooming/GroomingServiceListView";
import CreateGroomingServiceView from "./views/grooming/CreateGroomingServiceView";
import GroomingServiceDetailView from "./views/grooming/GroomingServiceDetailView";
import TreatmentListView from "./views/treatments/TreatmentListView";
import CreateTreatmentView from "./views/treatments/CreateTreatmentView";
import TreatmentDetailView from "./views/treatments/TreatmentDetailView";
import CreateVeterinaryServiceView from "./views/veterinary-services/CreateVeterinaryServiceView";
import VeterinaryServiceDetailView from "./views/veterinary-services/VeterinaryServiceDetailView";
import VeterinaryServiceListView from "./views/veterinary-services/VeterinaryServiceListView";
import RecipeListView from "./views/recipes/RecipeListView";
import CreateRecipeView from "./views/recipes/CreateRecipeView";
import RecipeDetailView from "./views/recipes/RecipeDetailView";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        {/* =============================================
            APP LAYOUT 
            ============================================= */}
        <Route element={<AppLayout />}>
          {/* Dashboard */}
          <Route path="/" element={<Dashboard />} index />

          {/* Dueños */}
          <Route path="/owners">
            <Route index element={<OwnersView />} />
            <Route path="create" element={<CreateOwnerView />} />
            <Route path=":ownerId" element={<OwnerDetailView />} />
            <Route
              path=":ownerId/patients/new"
              element={<CreatePatientView />}
            />
          </Route>

          {/*  PACIENTES */}
          <Route path="/patients">
            <Route index element={<PatientsListView />} />
          </Route>

          {/* PATIENT LAYOUT (Perfil de Mascota) */}
          <Route path="/patients/:patientId" element={<PatientLayout />}>
            <Route
              path="appointments/new"
              element={<CreateAppointmentView />}
            />
            <Route
              path="appointments/:appointmentId/edit"
              element={<EditAppointmentView />}
            />
            <Route
              path="appointments/:appointmentId"
              element={<AppointmentDetailView />}
            />
            {/* index: Lo que se ve al entrar (Resumen/Ficha) */}
            <Route index element={<DetailPatientView />} />

            <Route path="services" element={<VeterinaryServiceListView />} />
            <Route
              path="services/create"
              element={<CreateVeterinaryServiceView />}
            />
            <Route
              path="services/:serviceId"
              element={<VeterinaryServiceDetailView />}
            />

            <Route path="prescriptions" element={<RecipeListView />} />
            <Route path="prescriptions/create" element={<CreateRecipeView />} />
            <Route
              path="prescriptions/:recipeId"
              element={<RecipeDetailView />}
            />

            <Route path="vaccines" element={<VaccinationView />} />
            <Route path="deworming" element={<DewormingView />} />
            <Route path="exams" element={<PatientLabExamListView />} />
            <Route path="exams/create" element={<CreateLabExamView />} />
            <Route path="consultations" element={<ConsultationView />} />
            <Route
              path="consultations/new"
              element={<CreateConsultationView />}
            />
            <Route
              path="consultations/:consultationId"
              element={<ConsultationDetailView />}
            />
            <Route
              path="consultations/:consultationId/edit"
              element={<EditConsultationView />}
            />

            {/* ✅ CITAS DENTRO DE PACIENTE (sin select-patient) */}
            <Route path="appointments" element={<AppointmentView />} />
            {/* <Route path="appointments/:appointmentId" element={<AppointmentDetailsView />} />
              <Route path="appointments/:appointmentId/edit" element={<EditAppointmentView />} /> */}

            {/* Pestañas adicionales */}
            <Route path="grooming" element={<GroomingServiceListView />} />
            <Route
              path="grooming/create"
              element={<CreateGroomingServiceView />}
            />
            <Route
              path="grooming/:serviceId"
              element={<GroomingServiceDetailView />}
            />
            <Route path="treatments" element={<TreatmentListView />} />
            <Route path="treatments/create" element={<CreateTreatmentView />} />
            <Route
              path="treatments/:treatmentId"
              element={<TreatmentDetailView />}
            />
            {/* <Route path="appointments" element={<div>Vista Citas (Próximamente)</div>} /> */}
          </Route>

          {/* Placeholders */}
          <Route
            path="/appointments"
            element={<div>Calendario de Citas</div>}
          />
          <Route path="/sales/*" element={<div>Módulo de Ventas</div>} />
          <Route
            path="/inventory/*"
            element={<div>Módulo de Inventario</div>}
          />
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
