# 🛡️ GoldenGuard

### AI-Assisted Road Safety & Emergency Response Platform

GoldenGuard is an AI-assisted road safety and emergency response platform designed to help people respond faster and more confidently during road accidents and medical emergencies.

It combines **automatic crash detection, emergency SOS, GPS location, Gemini-powered First Aid assistance, CPR training, Good Samaritan awareness, Firebase-powered incident management, and Twilio SMS support** in one responsive web application.

---

## 🚨 Why GoldenGuard?

After a road accident, the first few minutes can be critical.

People may hesitate because they:

- Don't know what to do
- Don't know basic First Aid or CPR
- Are unsure whether they should help
- Cannot quickly communicate their location
- Panic during an emergency

GoldenGuard brings emergency communication, education, location sharing, and AI-assisted guidance together in one platform.

---

# ✨ Key Features

## 🚑 Emergency SOS

- ⚡ 1-Tap SOS
- 🎙️ Voice SOS
- 📍 GPS location
- 🚨 Emergency incident creation
- 🆘 Emergency contact information
- 🏥 Medical ID information
- 📩 Emergency SMS integration

---

## 💥 Automatic Crash Detection

GoldenGuard can use supported device motion sensors to detect a possible high-impact crash.

### Crash Flow

```text
Possible Crash
      ↓
15-Second Safety Countdown
      ↓
   Are You Safe?
      ↓
 ┌────┴────┐
 ↓         ↓
Cancel   Confirm
 ↓         ↓
Safe      SOS
```

When a possible crash is detected, the user gets a **15-second countdown** to cancel the alert if they are safe.

If there is no response, the automatic SOS workflow can be triggered.

> Crash detection depends on browser support, device sensors, permissions, and device conditions.

---

# 🤖 Gemini AI First Aid Assistant

GoldenGuard includes a **Google Gemini-powered First Aid assistant** for informational emergency guidance.

### AI Flow

```text
User
  ↓
GoldenGuard
  ↓
Backend API
  ↓
Google Gemini
  ↓
First Aid Guidance
```

The Gemini integration uses the server-side environment variable:

```text
GEMINI_API_KEY
```

If Gemini is unavailable, GoldenGuard can provide predefined emergency fallback guidance.

> AI guidance is informational and does not replace doctors, paramedics, ambulance services, or professional emergency instructions.

---

# 🩹 First Aid & CPR Training

GoldenGuard also focuses on preparing people before an emergency happens.

Training features include:

- 🫀 CPR learning
- 🩹 First Aid education
- 🚨 Emergency response guidance
- 📚 Training modules
- 🏆 Learning achievements
- 🛡️ Good Samaritan awareness

### Goal

> **Train before the emergency happens.**

---

# 🛡️ Good Samaritan Support

GoldenGuard includes educational information about the **Good Samaritan framework in India**.

The goal is to reduce hesitation and help people understand responsible ways to assist accident victims.

```text
Accident
   ↓
Bystander Hesitation
   ↓
Good Samaritan Awareness
   ↓
More Confidence
   ↓
Initial Assistance
```

---

# 📍 GPS & Emergency Mapping

GoldenGuard uses browser geolocation when permission is available.

Emergency information can include:

- Latitude
- Longitude
- Location status
- Emergency timestamp
- Incident details

The application also provides map-based safety functionality using **Leaflet and React Leaflet**.

> Location accuracy depends on the device, browser permissions, GPS availability, and network conditions.

---

# 📩 Emergency SMS

GoldenGuard includes **Twilio-based emergency SMS support**.

```text
Emergency Trigger
       ↓
GoldenGuard Backend
       ↓
Twilio
       ↓
Emergency SMS
```

Twilio credentials are configured through server-side environment variables.

> Never commit Twilio authentication credentials to GitHub.

---

# 🔥 Firebase Integration

GoldenGuard uses Firebase for cloud-backed application functionality.

### Firebase Services

- 🔐 Firebase Authentication
- 🔵 Google Sign-In
- 🔑 Email/Password Authentication
- ☁️ Cloud Firestore
- 👤 User profiles
- 🚨 Emergency records
- 📋 Incident data

---

# 📱 Progressive Web App

GoldenGuard is designed as a responsive web application with PWA support.

### Designed For

- 📱 Mobile
- 📲 Tablet
- 💻 Laptop
- 🖥️ Desktop

Includes:

- Installable web app support
- Service worker
- Responsive interface
- Mobile-friendly emergency workflows

---

# 🏗️ System Architecture

```text
                         ┌───────────────┐
                         │     User      │
                         └───────┬───────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
              ▼                  ▼                  ▼
         Emergency SOS     Crash Detection     Training
              │                  │             & First Aid
              └──────────────────┼──────────────────┘
                                 │
                                 ▼
                       ┌──────────────────┐
                       │   GoldenGuard    │
                       │     Backend      │
                       └────────┬─────────┘
                                │
                 ┌──────────────┼──────────────┐
                 │              │              │
                 ▼              ▼              ▼
             Firebase       Gemini AI        Twilio
                 │              │              │
                 ▼              ▼              ▼
             Cloud Data     First Aid AI     SMS Alert
```

---

# 🧰 Technology Stack

### Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Leaflet
- React Leaflet
- Lucide React
- Recharts
- Motion

### Backend

- Node.js
- Express
- TypeScript
- esbuild

### AI

- Google Gemini
- `@google/genai`

### Cloud

- Firebase Authentication
- Firebase Firestore

### Communication

- Twilio

### Web APIs

- Browser Geolocation API
- Device Motion API
- Web Audio API
- Service Workers

---

# 📂 Project Structure

```text
Golden-Road-Safety/
│
├── api/
│   └── chat.ts
│
├── src/
│   ├── components/
│   │   ├── community/
│   │   ├── training/
│   │   └── ...
│   │
│   ├── context/
│   │   └── CrashDetectionContext.tsx
│   │
│   ├── lib/
│   │   ├── firebase.ts
│   │   ├── smsService.ts
│   │   ├── incidentService.ts
│   │   └── ...
│   │
│   └── pages/
│       ├── Training.tsx
│       ├── Legal.tsx
│       ├── Profile.tsx
│       └── ...
│
├── server.ts
├── package.json
├── vite.config.ts
└── README.md
```

---

# ⚙️ Getting Started

## Prerequisites

- Node.js 18+
- npm

## Clone

```bash
git clone https://github.com/nitesh933438/Golden-Road-Safety.git
cd Golden-Road-Safety
```

## Install Dependencies

```bash
npm install
```

---

# 🔑 Environment Variables

Create a `.env` file and configure the required services.

```env
GEMINI_API_KEY=your_gemini_api_key

VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id

TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_FROM_NUMBER=your_twilio_from_number
```

> Never commit real credentials, API keys, passwords, or authentication tokens to GitHub.

---

# ▶️ Run Locally

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

### Production Server

```bash
npm start
```

### Lint

```bash
npm run lint
```

---

# 🔐 Security

GoldenGuard uses external services and device capabilities that require proper security configuration.

Important practices:

- Keep Gemini API keys server-side.
- Keep Twilio credentials server-side.
- Never commit secrets to GitHub.
- Configure Firebase Authentication correctly.
- Configure Firestore security rules.
- Validate emergency requests.
- Request location and sensor permissions only when required.
- Do not rely only on frontend role checks for privileged operations.

---

# 🎯 Road Safety Challenge Alignment

GoldenGuard focuses on three important areas:

### 1. Faster Emergency Communication

Quick SOS, voice activation, crash detection, and location sharing are designed to reduce delays in emergency notification.

### 2. Training & Skill Gap

CPR and First Aid learning resources help users develop emergency-response knowledge before an accident occurs.

### 3. Psychological Hesitation

Good Samaritan awareness helps users become more confident about providing appropriate assistance in good faith.

---

# 🧪 Project Status

GoldenGuard is an actively developed road-safety and emergency-response prototype.

Feature availability can depend on:

- Firebase configuration
- Gemini API availability
- Twilio configuration
- Browser permissions
- GPS availability
- Device motion sensor support
- Network connectivity

Individual features may therefore behave differently depending on the device and deployment environment.

---

# 🚀 Future Scope

Potential future improvements include:

- 🏥 Hospital and ambulance system integration
- 🚓 Police and emergency-service integration
- 📡 Improved crash-detection algorithms
- 🌐 Multilingual emergency assistance
- 📴 Stronger offline-first functionality
- ⌚ Wearable and vehicle sensor integration
- 📊 Emergency response analytics
- 🤝 Verified responder networks
- 🗣️ Advanced voice-based emergency interaction

---

# ⚠️ Medical & Emergency Disclaimer

GoldenGuard is a technology prototype intended for emergency-response support, education, and public-safety innovation.

It does **not** replace:

- Doctors
- Paramedics
- Ambulance services
- Police
- Professional emergency dispatch
- Professional medical diagnosis

AI-generated information may be incomplete or incorrect.

For a life-threatening emergency, contact the appropriate emergency service immediately.

---

# ❤️ Mission

> **Make every road user more prepared to respond when an accident happens.**

GoldenGuard aims to make people more **informed, confident, and prepared** to provide appropriate initial assistance while connecting emergency technology, education, and community support.

---

## 🇮🇳 Built for Road Safety Innovation

### GoldenGuard

**Faster Response • Better Preparedness • Safer Roads**
