import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register Service Worker for PWA Offline Capability & Push Notifications
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
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
} else if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch((e) => console.log('SW register:', e));
}

createRoot(document.getElementById('root')!).render(
    <App />
);
