import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeTheme } from "./lib/themeSystem";
import { startAutoCleanup } from "./lib/roomCleanup";

// Initialize theme before rendering
initializeTheme();

// Start automatic room cleanup (every 30 minutes)
startAutoCleanup();

createRoot(document.getElementById("root")!).render(<App />);
