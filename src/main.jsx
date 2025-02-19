import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";

/* import HomePage from "./HomePage"; */
import AdminView from "./AdminView";

// import HomePage from "./HomePage";
import AddQuestions from "./AddQuestions";
//import TicketManger from "./EmployeeTicket";
import TicketCreation from "./customer/TicketCreation";
import EmployeeTicket from "./EmployeeTicket";
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* <Route index element={<HomePage />} /> */}
        <Route index element={<TicketCreation />} />
        <Route path="/AdminView" element={<AdminView />} />
        <Route path="/EmployeeTicket" element={<EmployeeTicket />} />
        <Route path="/AddQuestions" element={<AddQuestions />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);

