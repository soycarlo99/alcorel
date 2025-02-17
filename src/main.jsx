import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// import HomePage from "./HomePage";
import AddQuestions from "./AddQuestions";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* <Route index element={<HomePage />} /> */}
        <Route path="/AddQuestions" element={<AddQuestions />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);

