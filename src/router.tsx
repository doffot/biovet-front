import { BrowserRouter, Route, Routes } from "react-router-dom";
import Dashboard from "./views/Dashboard";
import { AppLayout } from "./layouts/AppLayout";



export default function Router() {

    return(
        <BrowserRouter>
            <Routes>
                <Route>
                    <Route element={<AppLayout/>}>
                        <Route path="/" element={<Dashboard/>} index/>
                    </Route>
                </Route>
            </Routes>
        </BrowserRouter>
    )
}