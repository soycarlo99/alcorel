import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

//import TicketManger from "./EmployeeTicket";
import EmployeeTicket from "./EmployeeTicket";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/EmployeeTicket" element={<EmployeeTicket />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);

