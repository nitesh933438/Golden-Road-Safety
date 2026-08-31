import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import React, { Component, ErrorInfo, ReactNode } from "react";

class GlobalErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Global crash:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, color: "red", background: "#fdd", fontFamily: "monospace", zIndex: 99999, position: "relative" }}>
          <h1>App Crash Details</h1>
          <pre style={{ whiteSpace: "pre-wrap" }}>{this.state.error?.stack || this.state.error?.message || String(this.state.error)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

// Prevent WebSocket / HMR connection errors or background network rejections from corrupting DOM
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason?.message || String(event.reason || '');
  if (reason.includes('WebSocket') || reason.includes('closed without opened') || reason.includes('quota') || reason.includes('network') || reason.includes('permission')) {
    event.preventDefault();
    console.warn('Suppressed non-fatal async/HMR notice:', reason);
  } else {
    console.warn('Unhandled promise rejection:', event.reason);
  }
});

window.addEventListener('error', (event) => {
  // Ignore non-script resource load errors (e.g. failing img src or tile requests)
  if (event.target && event.target !== window) {
    console.warn('Non-fatal asset load notice:', event);
    return;
  }
  console.warn('Window global error notice:', event.error || event.message);
});

// Register Service Worker for PWA Offline Capability & Push Notifications
if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener('load', () => {
      const base = import.meta.env.BASE_URL || '/';
      const swUrl = base.endsWith('/') ? `${base}sw.js` : `${base}/sw.js`;
      navigator.serviceWorker.register(swUrl, { scope: base }).then(
        (registration) => {
          console.log('GoldenGuard SW registered successfully with scope:', registration.scope);
        },
        (err) => {
          console.warn('GoldenGuard SW registration notice:', err);
        }
      );
    });
  } else {
    // In dev mode, unregister any stale service workers that may intercept Vite scripts
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister().catch(() => {});
      }
    }).catch(() => {});
  }
}

try {
  createRoot(document.getElementById('root')!).render(
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  );
} catch (e: any) {
  document.getElementById('root')!.innerHTML = `<div style="color:red;padding:20px;font-family:monospace;"><h3>Initialization Error</h3><pre>${e.message || e}</pre></div>`;
}
