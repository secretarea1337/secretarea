import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { LanguageProvider } from './src/contexts/LanguageContext';
import App from './App';
import "./index.css";

window.addEventListener("error", (e) => { 
  if (e.message && (e.message.includes("WebSocket") || e.message.includes("unauthorized-domain"))) {
    e.preventDefault(); 
  }
});
window.addEventListener("unhandledrejection", (e) => { 
  const reasonStr = String(e.reason?.message || e.reason || "");
  if (reasonStr.includes("WebSocket") || reasonStr.includes("unauthorized-domain")) {
    e.preventDefault(); 
  }
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <LanguageProvider><App /></LanguageProvider>
    </HelmetProvider>
  </React.StrictMode>
);