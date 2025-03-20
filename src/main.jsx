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
import { TicketProvider } from "./TicketContext";

import "./style.css";
import AiChat from "./chat";
import Alcorel from "./Alcorel";
import LoginPage from "./Login";
import Navigation from "./Navigation";
import AddQuestions from "./AddQuestions";
import CustomerView from "./CustomerView";
import TicketDetails from "./TicketDetails";
import ResetPassword from "./ResetPassword";
import HowToUseIframe from "./usageOfiFrame";
import AdminDashboard from "./AdminDashboard";
import CompanyLanding from "./CompanyLanding";
import EditCategories from "./EditCategories";
import EmployeeTicket from "./EmployeeTicket";
import ManageEmployees from "./manageEmployee";
import EmployeeDashboard from "./EmployeeDashboard";
import TicketCreation from "./customer/TicketCreation";

const userContext = createContext({
  isEmployee: null,
  isAdmin: null,
});

export const useAuth = () => useContext(userContext);

function RoleProvider({ children }) {
  const [isEmployee, setIsEmployee] = useState(null);
  const [isAdmin, setIsAdmin] = useState(null);

  const refreshAuthState = () => {
    fetch("/api/login/employee").then((response) => {
      setIsEmployee(response.ok);
    });

    fetch("/api/login/admin").then((response) => {
      if (response.ok) {
      }
      setIsAdmin(response.ok);
    });
  };

  useEffect(() => {
    refreshAuthState();
  }, []);

  if (isEmployee === null || isAdmin === null) {
    return null;
  }

  return (
    <userContext.Provider value={{ isEmployee, isAdmin, refreshAuthState }}>
      {children}
    </userContext.Provider>
  );
}

function EmployeeRoute({ element }) {
  const { isEmployee } = useAuth();
  return isEmployee ? element : <h1>Unauthorized</h1>;
}

function BothRoles({ element }) {
  const { isAdmin, isEmployee } = useAuth();
  return isAdmin || isEmployee ? (
    element
  ) : (
    <h1>Unauthorized, only admins are allowed here</h1>
  );
}

function AdminRoute({ element }) {
  const { isAdmin } = useAuth();
  return isAdmin ? (
    element
  ) : (
    <h1>Unauthorized, only admins are allowed here</h1>
  );
}

function LayoutWithNav() {
  return (
    <RoleProvider>
      <div className="app-container">
        <Navigation />
        <div className="main-content">
          <Outlet />
        </div>
      </div>
    </RoleProvider>
  );
}

function LayoutWithoutNav() {
  return (
    <RoleProvider>
      <div className="app-container">
        <div className="main-content full-width">
          <Outlet />
        </div>
      </div>
    </RoleProvider>
  );
}

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route element={<LayoutWithoutNav />}>
        <Route index element={<TicketCreation />} />
        <Route path="/company/:companyId" element={<CompanyLanding />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="customer-view/:token"
          element={
            <TicketProvider>
              <>
                <CustomerView />
                <AiChat />
              </>
            </TicketProvider>
          }
        />
        <Route path="/login" element={<LoginPage />} />
      </Route>
      <Route element={<LayoutWithNav />}>
        <Route
          path="/edit-categories"
          element={<AdminRoute element={<EditCategories />} />}
        />
        <Route
          path="/employee-ticket"
          element={<BothRoles element={<EmployeeTicket />} />}
        />
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
        <Route
          path="/admin/dashboard"
          element={<AdminRoute element={<AdminDashboard />} />}
        />
        <Route path="/alcorel" element={<Alcorel />} />
        <Route
          path="/usage-of-iframe"
          element={<AdminRoute element={<HowToUseIframe />} />}
        />
      </Route>
    </Routes>
  </BrowserRouter>,
);
