import { BrowserRouter, Route, Routes } from "react-router-dom";
import Dashboard from "@/views/Dashboard";
import { AppLayout } from "@/layouts/AppLayout";
import OwnersView from "@/views/owner/OwnersView";
import CreateOwnerView from "@/views/owner/CreateOwnerView";



export default function Router() {

    return(
        <BrowserRouter>
            <Routes>
                <Route>
                    <Route element={<AppLayout/>}>
                        <Route path="/" element={<Dashboard/>} index/>
                        <Route path="/owners" element={<OwnersView/>} />
                        <Route path="/owners/create" element={<CreateOwnerView/>} />
                    </Route>
                </Route>
            </Routes>
        </BrowserRouter>
    )
}