import { StrictMode, useState, useEffect, useContext, createContext } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, useParams,Navigate } from "react-router";

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
import EmployeeDashboard from "./EmployeeDashboard";
import AdminDashboard from "./AdminDashboard";
import Alcorel from "./Alcorel";
import { Navigate } from "react-router";
const userContext = createContext({
  isEmployee: null,
  isAdmin: null,
});

export const useAuth = () => useContext(userContext);

function RoleProvider({ children }) {
  const [isEmployee, setIsEmployee] = useState(null);
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    fetch("/api/login/employee").then((response) => {
      if (response.ok) {
        setIsEmployee(true);
      } else {
        setIsEmployee(false);
      }
    });

    fetch("/api/login/admin").then((response) => {
      if (response.ok) {
        console.log(response);
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    });
  }, []);
  if (isEmployee == null) {
    return null;
  }
  if (isAdmin == null) {
    return null;
  }
  return (
    <userContext.Provider value={{ isEmployee, isAdmin }}>
      {children}
    </userContext.Provider>
  );
}

function EmployeeRoute({ element }) {
  const { isEmployee } = useAuth();
  return isEmployee? element: <h1>Unauthorized</h1>
} 

function AdminRoute({ element }) {
  const { isAdmin } = useAuth();
  return isAdmin? element: <h1>Unauthorized, only admins are allowed here</h1>
} 

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <RoleProvider>
        <div className="app-container">
          <Navigation />
          <div className="main-content">
            <Routes>
              <Route index element={<TicketCreation />} />
              <Route path="/EditCategories" element={<AdminRoute element={<EditCategories />} />} />
              <Route path="/EmployeeTicket" element={<EmployeeTicket />} />
              <Route path="/AddQuestions" element={<AdminRoute element={<AddQuestions />} />} />
              <Route path="/ManageEmployee" element={<AdminRoute element={<ManageEmployees />} />}/> 
              <Route path="/company/:companyId" element={<CompanyLanding />} />
              <Route path="/Ticket/:id" element={<TicketDetails />} />
              <Route path="/CustomerView/:token" element={<CustomerView />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/employee/dashboard" element={<EmployeeRoute element={<EmployeeDashboard />} />} />
              <Route path="/admindashboard" element={<AdminDashboard />} />
              <Route path="/Alcorel" element={<Alcorel />} />
            </Routes>
          </div>
        </div>
      </RoleProvider>
    </BrowserRouter>
  </StrictMode>
);
