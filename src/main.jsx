import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import TicketCreation from "./customer/TicketCreation";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <BrowserRouter>
            <Routes>
                <Route index element={<TicketCreation/>} />
            </Routes>
        </BrowserRouter>
    </StrictMode>,
);