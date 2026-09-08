# GoldenGuard — Real-Time Road Safety & Emergency Response Grid

> A comprehensive, full-stack road safety, emergency response, and intelligent first-aid coordination platform designed to eliminate emergency response delays and save lives on highways and urban roads.

---

## 📌 Project Overview

**GoldenGuard** is a mission-critical web application built to bridge the gap between road accident victims, emergency medical services (EMS), municipal police, and nearby Good Samaritan responders. Leveraging real-time geolocation, automated crash detection, server-side Gemini AI medical guidance, and instant SOS broadcasting, GoldenGuard provides an end-to-end incident management and emergency response grid.

---

## 🚨 Problem Statement

Road traffic accidents are among the leading causes of preventable fatalities worldwide. Critical barriers to survival include:
- **Delayed Notification**: Precious minutes lost before emergency dispatchers are alerted.
- **Location Uncertainty**: Inability of victims or panicked callers to provide precise GPS coordinates or nearest landmark details.
- **Lack of Immediate First Aid**: Bystanders willing to help but lacking immediate, certified first-aid or CPR instructions.
- **Fragmented Communication**: Disconnection between police dispatchers, trauma hospitals, and on-ground volunteer responders.

GoldenGuard solves these challenges with an integrated, zero-latency emergency grid.

---

## ✨ Key Features

### 1. Gemini AI First Aid & Trauma Assistant
- **Real-Time Guidance**: Server-side proxy integrating `@google/genai` to provide step-by-step emergency trauma instructions during cardiac arrest, severe bleeding, choking, and collisions.
- **API Key & Fallback Safety**: Securelyproxied via Express backend (`/api/gemini`) using `process.env.GEMINI_API_KEY`. Includes robust first-aid fallbacks in case of network or API limits.

### 2. Automatic Crash Detection & 15-Second SOS Countdown
- **Sensor Monitoring**: Utilizes device accelerometer and GPS velocity monitoring to detect high-g impacts or sudden deceleration crashes.
- **15-Second Abort Window**: Triggers an audible siren and visual countdown modal upon suspected crash detection, allowing conscious users to cancel false alarms before automatic emergency broadcasting.

### 3. Multi-Modal Emergency SOS (1-Tap & Voice SOS)
- **1-Tap SOS**: Instantly broadcasts emergency distress signals with precise GPS coordinates, Medical ID (blood group, allergies, ICE contacts), and active incident status to nearby responders and dispatchers.
- **Voice SOS / Audio Trigger**: Hands-free voice command support for rapid distress activation.

### 4. Smart Interactive Map & Resource Dispatch
- **Live GPS Tracking**: Real-time position tracking and speed telemetry.
- **Emergency Infrastructure**: Live map overlays locating nearby hospitals, police stations, AED-certified volunteers, and reported road hazards (potholes, oil spills, debris).
- **Traffic Layers**: Real-time safety hazard and traffic density indicators.

### 5. First Aid, CPR Training & Badges
- Interactive multimedia modules covering CPR, bleeding control, choking rescue, and trauma triage.
- Earnable digital certifications and badges for trained civilian responders.

### 6. Good Samaritan & Community Network
- Verified community responder network allowing nearby citizens to assist with hazard reporting, first-aid support, and community safety scoreboards.

### 7. Firebase Authentication & Cloud Firestore
- Secure Google OAuth and email/password authentication via Firebase Auth.
- Real-time cloud persistence for user profiles, emergency medical IDs, incident logs, and dispatch queues.

### 8. Progressive Web App (PWA) Support
- Fully installable PWA with offline caching, service workers, and responsive mobile-first design.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React icons, Recharts.
- **Backend**: Node.js, Express.js (custom full-stack server integration).
- **AI Integration**: Google GenAI SDK (`@google/genai`) for server-side medical triage and guidance.
- **Database & Auth**: Firebase Firestore & Firebase Authentication.
- **Build & Deployment**: Esbuild bundling, Docker-ready for Cloud Run deployment.

---

## 🏗️ Architecture & Workflow

```
[Client (React SPA)] 
       │
       ├── (HTTPS / REST) ──> [Express Server (server.ts)]
       │                             │
       │                             ├──> [Google GenAI API (/api/gemini)]
       │                             │
       │                             └──> [Firebase Firestore / Auth]
       │
       └── (Browser Geolocation & Sensors) ──> [Crash Detection Engine]
```

1. **Client Request**: User triggers SOS, hazard report, or asks Gemini AI for medical guidance.
2. **Server-Side Proxy**: Express securely handles API keys (`GEMINI_API_KEY`) and database transactions.
3. **Dispatch & Sync**: Firestore real-time snapshots instantly update admin dashboards, police dispatch, and nearby volunteer feeds.

---

## 📦 Installation & Environment Variables

### Prerequisites
- Node.js (v18+)
- npm

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd goldenguard
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory based on `.env.example`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Run Development Server
```bash
npm run dev
```
The app will be accessible at `http://localhost:3000`.

---

## 🚀 Deployment

To build and test the production bundle locally:
```bash
npm run build
npm start
```

For Cloud Run or containerized deployment:
- Uses `esbuild` to bundle `server.ts` into `dist/server.cjs`.
- Binds strictly to port `3000` and host `0.0.0.0`.

---

## 🔒 Security Notes
- **API Key Protection**: All third-party API keys (Gemini API) are kept strictly server-side (`server.ts`) and never exposed to browser bundles.
- **Role-Based Access Control (RBAC)**: Enforces strict authorization guards for Admin, Police, Hospital, Trainer, and Citizen roles.

---

## 🏆 Hackathon Challenge Alignment
- **Impact & Urgency**: Directly addresses emergency response latency in road accidents.
- **AI Integration**: Harnesses Google GenAI for instant, life-saving triage instructions.
- **Full-Stack Execution**: Production-ready architecture with persistent cloud database, real-time sensors, and offline PWA capability.

---

## 🌱 Future Scope
- Integration with national emergency hotline protocols (e.g., 112/911 CAD systems).
- IoT helmet and vehicle OBD-II Bluetooth crash sensor pairing.
- Automated drone AED dispatch integration.

---

## 📄 License
This project is built for hackathon demonstration and public safety advancement. Distributed under the MIT License.
