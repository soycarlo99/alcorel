import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";

import TicketCreation from "./customer/TicketCreation";
import EmployeeTicket from "./EmployeeTicket";
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route index element={<TicketCreation />} />
        <Route path="/EmployeeTicket" element={<EmployeeTicket />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
