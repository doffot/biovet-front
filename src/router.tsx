import { BrowserRouter, Route, Routes } from "react-router-dom";
import Dashboard from "@/views/Dashboard";
import { AppLayout } from "@/layouts/AppLayout";
import OwnersView from "@/views/owner/OwnersView";
import CreateOwnerView from "@/views/owner/CreateOwnerView";
import LoginView from "@/views/auth/LoginView";
import AuthLayout from "./layouts/AuthLayout";
import OwnerDetailView from "./views/owner/OwnerDetailView";
import CreatePatientView from "./views/patients/CreatePatientView";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} index />
            <Route path="/owners" element={<OwnersView />} />
            <Route path="/owners/:ownerId" element={<OwnerDetailView/>} />
            <Route path="/owners/create" element={<CreateOwnerView />} />

            {/* Patients - Crear paciente bajo un owner */}
          <Route path="/owners/:ownerId/patients/new" element={<CreatePatientView />} />
          </Route>
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="/auth/login" element={<LoginView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
