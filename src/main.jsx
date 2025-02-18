import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";

// import HomePage from "./HomePage";
import AddQuestions from "./AddQuestions";
//import TicketManger from "./EmployeeTicket";
import EmployeeTicket from "./EmployeeTicket";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/EmployeeTicket" element={<EmployeeTicket />} />
        <Route path="/AddQuestions" element={<AddQuestions />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);

