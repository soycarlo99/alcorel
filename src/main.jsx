import {
  StrictMode,
  useState,
  useEffect,
  useContext,
  createContext,
} from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  useParams,
  Outlet,
  Navigate,
} from "react-router";

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
import EmployeeDashboard from "./EmployeeDashboard";
import AdminDashboard from "./AdminDashboard";
import Alcorel from "./Alcorel";
import HowToUseIframe from "./usageOfiFrame";

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
  return isEmployee ? element : <h1>Unauthorized</h1>;
}

function AdminRoute({ element }) {
  const { isAdmin } = useAuth();
  return isAdmin ? (
    element
  ) : (
    <h1>Unauthorized, only admins are allowed here</h1>
  );
}

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
      <RoleProvider>
        <Routes>
          <Route element={<LayoutWithoutNav />}>
            <Route index element={<TicketCreation />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/company/:companyId" element={<CompanyLanding />} />
            <Route path="/customer-view/:token" element={<CustomerView />} />
          </Route>
          <Route element={<LayoutWithNav />}>
            <Route
              path="/edit-categories"
              element={<AdminRoute element={<EditCategories />} />}
            />
            <Route path="/employee-ticket" element={<EmployeeTicket />} />
            <Route
              path="/add-questions"
              element={<AdminRoute element={<AddQuestions />} />}
            />
            <Route
              path="/manage-employee"
              element={<AdminRoute element={<ManageEmployees />} />}
            />
            <Route path="/ticket/:id" element={<TicketDetails />} />
            <Route
              path="/employee/dashboard"
              element={<EmployeeRoute element={<EmployeeDashboard />} />}
            />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/alcorel" element={<Alcorel />} />
            <Route path="/usage-of-iframe" element={<HowToUseIframe />} />
          </Route>
        </Routes>
      </RoleProvider>
    </BrowserRouter>
  </StrictMode>,
);
