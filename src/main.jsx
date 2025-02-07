import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from "./HomePage";


createRoot(document.getElementById("root")).render(
    <StrictMode>
            <BrowserRouter>
                <Routes>
                    <Route index element={<HomePage />} />
                </Routes>
            </BrowserRouter>
    </StrictMode>,
);
