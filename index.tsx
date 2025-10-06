import React from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";

const container = document.getElementById("root");
if (!container) throw new Error("Could not find #root element to mount to");

// Debug: ensure one React and it’s loaded
console.log("React version:", React.version);

createRoot(container).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);
