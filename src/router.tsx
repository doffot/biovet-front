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
import PatientsListView from "@/views/patients/PatientsListView";
import VaccinationView from "./views/vaccinations/VaccinationView";
import DewormingView from "./views/dewormings/DewormingView";
import ConsultationView from "./views/consultations/ConsultationView";
import CreateConsultationView from "./views/consultations/CreateConsultationView";
import ConsultationDetailView from "./views/consultations/ConsultationDetailView";
import EditConsultationView from "./views/consultations/EditConsultationView";
import CreateAppointmentView from "./views/appointment/CreateAppointmentView";
import AppointmentView from "./views/appointment/PatientAppointmentsView";
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
import MedicalStudyListView from "./views/medical-studies/MedicalStudyListView";
import CreateMedicalStudyView from "./views/medical-studies/CreateMedicalStudyView";
import MedicalStudyDetailView from "./views/medical-studies/medical-studies/MedicalStudyDetailView";
import PaymentMethodsListView from "./views/payment-methods/PaymentMethodsListView";
import CreatePaymentMethodView from "./views/payment-methods/CreatePaymentMethodView";
import AppointmentsAgendaView from "./views/appointment/AppointmentsAgendaView";
import SelectPatientForAppointment from "./components/appointments/SelectPatientForAppointment";
import GroomingServicesView from "./views/grooming/GroomingServicesView";
import LabExamListView from "./views/labExams/labExamListView";
import EditLabExamView from "./views/labExams/EditLabExamView";
import CreateSaleView from "./views/sales/CreateSaleView";
import SalesHistoryView from "./views/sales/SalesHistoryView";
import ProductListView from "./views/inventory/ProductListView";
import CreateProductView from "./views/inventory/CreateProductView";
import StockView from "./views/inventory/StockView";
import MovementsView from "./views/inventory/MovementsView";
import LowStockView from "./views/inventory/LowStockView";
import PurchaseListView from "./views/purchases/PurchaseListView";
import CreatePurchaseView from "./views/purchases/CreatePurchaseView";
import GroomingReportView from "./views/grooming/GroomingReportView";
import { InvoiceReportView } from "./views/reports/InvoiceReportView";
import { StaffListView } from "./views/staff/StaffListView";
import MedicalOrderListView from "./views/medical-order/MedicalOrderListView";
import CreateMedicalOrderView from "./views/medical-order/CreateMedicalOrderView";
import MedicalOrderDetailView from "./views/medical-order/MedicalOrderDetailView";
import ClinicSettingsView from "./views/settings/ClinicSettingsView";
import RegisterView from "./views/auth/RegisterView";
import ConfirmAccountView from "./views/auth/ConfirmAccountView";
import ForgotPasswordView from "./views/auth/ForgotPasswordView";
import NewPasswordView from "./views/auth/NewPasswordView";
import RequestNewToken from "./views/auth/RequestNewToken";

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
            <Route path=":ownerId/patients/new" element={<CreatePatientView />} />
          </Route>

          {/* PACIENTES */}
          <Route path="/patients">
            <Route index element={<PatientsListView />} />
          </Route>

        {/* PATIENT LAYOUT (Perfil de Mascota) */}
<Route path="/patients/:patientId" element={<PatientLayout />}>
  <Route index element={<DetailPatientView />} />
  
  <Route path="appointments" element={<AppointmentView />} />
  <Route path="appointments/new" element={<CreateAppointmentView />} />
  <Route path="appointments/:appointmentId" element={<AppointmentDetailView />} />
  <Route path="appointments/:appointmentId/edit" element={<EditAppointmentView />} />

  <Route path="services" element={<VeterinaryServiceListView />} />
  <Route path="services/create" element={<CreateVeterinaryServiceView />} />
  <Route path="services/:serviceId" element={<VeterinaryServiceDetailView />} />

  <Route path="studies" element={<MedicalStudyListView />} />
  <Route path="studies/create" element={<CreateMedicalStudyView />} />
  <Route path="studies/:studyId" element={<MedicalStudyDetailView />} />

  <Route path="prescriptions" element={<RecipeListView />} />
  <Route path="prescriptions/create" element={<CreateRecipeView />} />
  <Route path="prescriptions/:recipeId" element={<RecipeDetailView />} />

  <Route path="medical-orders" element={<MedicalOrderListView />} />
  <Route path="medical-orders/create" element={<CreateMedicalOrderView />} />
  <Route path="medical-orders/:orderId" element={<MedicalOrderDetailView />} />

  <Route path="vaccines" element={<VaccinationView />} />
  <Route path="deworming" element={<DewormingView />} />
  
  <Route path="exams" element={<PatientLabExamListView />} />
  <Route path="exams/create" element={<CreateLabExamView />} />
  
  <Route path="consultations" element={<ConsultationView />} />
  <Route path="consultations/new" element={<CreateConsultationView />} />
  <Route path="consultations/:consultationId" element={<ConsultationDetailView />} />
  <Route path="consultations/:consultationId/edit" element={<EditConsultationView />} />

  <Route path="grooming" element={<GroomingServiceListView />} />
  <Route path="grooming/create" element={<CreateGroomingServiceView />} />
  <Route path="grooming/:serviceId" element={<GroomingServiceDetailView />} />
  
  <Route path="treatments" element={<TreatmentListView />} />
  <Route path="treatments/create" element={<CreateTreatmentView />} />
  <Route path="treatments/:treatmentId" element={<TreatmentDetailView />} />
</Route>

          {/* VENTAS */}
          <Route path="/sales">
            <Route index element={<Navigate to="/sales/new" replace />} />
            <Route path="new" element={<CreateSaleView />} />
            <Route path="history" element={<SalesHistoryView />} />
          </Route>

          {/* CITAS */}
          <Route path="/appointments">
            <Route index element={<AppointmentsAgendaView />} />
            <Route path="select-patient" element={<SelectPatientForAppointment />} />
            <Route path="create/:patientId" element={<CreateAppointmentView />} />
          </Route>

          {/* PELUQUERÍA */}
          <Route path="/grooming" element={<GroomingServicesView />} />

          {/* LABORATORIO */}
          <Route path="/lab">
            <Route index element={<LabExamListView />} />
            <Route path="create" element={<CreateLabExamView />} />
            <Route path=":id/edit" element={<EditLabExamView />} />
          </Route>

          {/* INVENTARIO */}
          <Route path="/inventory">
            <Route index element={<Navigate to="/inventory/products" replace />} />
            <Route path="products" element={<ProductListView />} />
            <Route path="products/create" element={<CreateProductView />} />
            <Route path="stock" element={<StockView />} />
            <Route path="movements" element={<MovementsView />} />
            <Route path="low-stock" element={<LowStockView />} />
          </Route>

          {/* COMPRAS */}
          <Route path="/purchases">
            <Route index element={<Navigate to="/purchases/history" replace />} />
            <Route path="new" element={<CreatePurchaseView />} />
            <Route path="history" element={<PurchaseListView />} />
          </Route>

          {/* REPORTES */}
          <Route path="/reports">
            <Route index element={<Navigate to="/reports/grooming" replace />} />
            <Route path="grooming" element={<GroomingReportView />} />
            <Route path="invoices" element={<InvoiceReportView />} />
          </Route>

          {/* CONFIGURACIONES */}
         <Route path="/settings">
  <Route index element={<Navigate to="/settings/clinic" replace />} />
  <Route path="clinic" element={<ClinicSettingsView />} />
  <Route path="staff" element={<StaffListView />} />
  <Route path="payment-methods" element={<PaymentMethodsListView />} />
  <Route path="payment-methods/create" element={<CreatePaymentMethodView />} />
</Route>
        </Route>

        {/* =============================================
            AUTH LAYOUT
            ============================================= */}
        <Route element={<AuthLayout />}>
          <Route path="/auth/login" element={<LoginView />} />
          <Route path="/auth/register" element={<RegisterView />} />
          <Route path="/auth/confirm-account" element={<ConfirmAccountView />} />
          {/* Rutas de recuperación de contraseña, etc. */}
          <Route path="/auth/forgot-password" element={<ForgotPasswordView />} />
          <Route path="/auth/new-password" element={<NewPasswordView />} />
          <Route path="/auth/request-new-token" element={<RequestNewToken />} />
        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}