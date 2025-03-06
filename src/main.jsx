import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, useParams } from "react-router";

import EditCategories from "./EditCategories";
import AddQuestions from "./AddQuestions";
import TicketCreation from "./customer/TicketCreation";
import EmployeeTicket from "./EmployeeTicket";
import Navigation from "./Navigation";
import ManageEmployees from "./manageEmployee";
import TicketDetails from "./TicketDetails";
import CustomerView from "./CustomerView";
import LoginPage from "./Login";
import CompanyLanding from "./CompanyLanding";
import "./style.css";

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
            <Route path="/company/:companyId" element={<CompanyLanding />} />
            <Route path="/Ticket/:id" element={<TicketDetails />} />
            <Route path="/CustomerView/:token" element={<CustomerView />} />
            <Route path="/Login" element={<LoginPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  </StrictMode>,
);
