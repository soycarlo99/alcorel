import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, useParams, Outlet } from "react-router";

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
import AdminDashboard from "./AdminDashboard";
import AiChat from "./chat";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <div className="app-container">
        <Navigation />
        <div className="main-content">
          <Routes>
            <Route index element={<TicketCreation />} />
            <Route path="/editCategories" element={<EditCategories />} />
            <Route path="/employeeTicket" element={<EmployeeTicket />} />
            <Route path="/addQuestions" element={<AddQuestions />} />
            <Route path="/manageEmployee" element={<ManageEmployees />} />
            <Route path="/company/:companyId" element={<CompanyLanding />} />
            <Route path="/ticket/:id" element={<TicketDetails />} />
            <Route
              path="CustomerView/:token"
              element={
                <>
                  <CustomerView />
                  <AiChat />
                </>
              }
            />
            <Route path="/chat" element={<AiChat />} />
            <Route path="/Login" element={<LoginPage />} />
            <Route path="/AdminDashboard" element={<AdminDashboard />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  </StrictMode>,
);
