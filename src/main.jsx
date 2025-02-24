import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import EditCategories from "./EditCategories";
import AddQuestions from "./AddQuestions";
import TicketCreation from "./customer/TicketCreation";
import EmployeeTicket from "./EmployeeTicket";
import Navigation from "./Navigation";
import "./style.css";
import ManageEmployees from "./manageEmployee";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <div className="app-container">
        <Navigation />
        <div className="main-content">
          <Routes>
            <Route index element={<TicketCreation />} />
            <Route path="/EditCategories" element={<EditCategories />} />
            <Route path="/EmployeeTicket" element={<EmployeeTicket />} />
            <Route path="/AddQuestions" element={<AddQuestions />} />
            <Route path="/ManageEmployee" element={<ManageEmployees />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  </StrictMode>,
);
