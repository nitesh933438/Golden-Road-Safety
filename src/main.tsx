import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register Service Worker for PWA Offline Capability & Push Notifications only in production
if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then(
        (registration) => {
          console.log('GoldenGuard SW registered successfully:', registration.scope);
        },
        (err) => {
          console.warn('GoldenGuard SW registration failed:', err);
        }
      );
    });
  } else {
    // In development, unregister any existing service workers to avoid stale cache/dynamic import issues
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister().then((unregistered) => {
          if (unregistered) {
            console.log('Stale dev Service Worker cleared successfully.');
          }
        });
      }
    }).catch(err => console.warn('Error clearing service workers:', err));
  }
}

createRoot(document.getElementById('root')!).render(
    <App />
);
