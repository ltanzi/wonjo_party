import React from "react";
import ReactDOM from "react-dom/client";
// Latin subset only, and only the two weights actually used (400 body, 500 buttons).
// Self-hosted rather than Google Fonts: no third-party round-trip on a weak connection.
import "@fontsource/inconsolata/latin-400.css";
import "@fontsource/inconsolata/latin-500.css";
import "./index.css";
import { App } from "./App";
import { ErrorBoundary } from "./components/layout/ErrorBoundary";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
