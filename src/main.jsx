import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
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
import Alcorel from "./Alcorel";
import HowToUseIframe from "./usageOfiFrame";

const LayoutWithNav = () => (
  <div className="app-container">
    <Navigation />
    <div className="main-content">
      <Outlet />
    </div>
  </div>
);

const LayoutWithoutNav = () => (
  <div className="app-container">
    <div className="main-content full-width">
      <Outlet />
    </div>
  </div>
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<LayoutWithoutNav />}>
          <Route index element={<TicketCreation />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/company/:companyId" element={<CompanyLanding />} />
        </Route>

        <Route element={<LayoutWithNav />}>
          <Route path="/edit-categories" element={<EditCategories />} />
          <Route path="/employee-ticket" element={<EmployeeTicket />} />
          <Route path="/add-questions" element={<AddQuestions />} />
          <Route path="/manage-employee" element={<ManageEmployees />} />
          <Route path="/ticket/:id" element={<TicketDetails />} />
          <Route path="/customer-view/:token" element={<CustomerView />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/alcorel" element={<Alcorel />} />
          <Route path="/usage-of-iframe" element={<HowToUseIframe />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
