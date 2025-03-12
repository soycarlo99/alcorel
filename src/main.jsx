import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, useParams, Outlet } from "react-router";
import { useState } from "react";

import EditCategories from "./EditCategories";
import AddQuestions from "./AddQuestions";
import TicketCreation from "./customer/TicketCreation";
import EmployeeTicket from "./EmployeeTicket";
import Navigation from "./Navigation";
import "./style.css";
import ManageEmployees from "./manageEmployee";
import TicketDetails from "./TicketDetails";
import CustomerView from "./CustomerView";
import LoginPage from "./Login";
import CompanyLanding from "./CompanyLanding";
import "./style.css";
import AdminDashboard from "./AdminDashboard";



  createRoot(document.getElementById("root")).render(

    <StrictMode>
      <BrowserRouter>
        <div className="app-container">
          <Navigation />
          <div className="main-content">
        <RoleProvider />
            <Routes>
              <Route index element={<TicketCreation />} />
              <Route path="/EditCategories" element={<EditCategories />} />
              <Route path="/EmployeeTicket" element={<EmployeeTicket />} />
              <Route path="/AddQuestions" element={<AddQuestions />} />
              <Route isEmployee? {(<TicketCreation />)} : {()} path="/ManageEmployee" element={<ManageEmployees />} />
              <Route path="/company/:companyId" element={<CompanyLanding />} />
              <Route path="/Ticket/:id" element={<TicketDetails />} />
              <Route path="/CustomerView/:token" element={<CustomerView />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/admindashboard" element={<AdminDashboard />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </StrictMode>,
  );

  function RoleProvider() {
  const [isEmployee, setIsEmployee] = useState(null);
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    fetch("/api/login/employee")
      .then(response => {
        if (response.ok) {
          setIsEmployee(true)
        } else {
          setIsEmployee(false)
        }
        
      })
    
    fetch("/api/login/admin")
      .then(response => {
        if (response.ok) {
          console.log(response)
          setIsAdmin(true)
        } else {
          setIsAdmin(false)
        }
        
      })
  }, []);
  if (isEmployee == null) {
    return null
  }
  if (isAdmin == null) {
    return null
  }
}
  
  