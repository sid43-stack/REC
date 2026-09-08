# REC — Rapid Emergency & Crisis-response Drone

<div align="center">

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.x-38B2AC?logo=tailwind-css&logoColor=white)

**Autonomous Drone Ground Control Station (GCS) & Multi-Sensor Survivor Verification Protocol (REC-SVLP)**

</div>

---

## 📌 Overview

**REC** is an intelligent emergency and disaster-response unmanned aerial system (UAS) Ground Control Station. It combines real-time multi-drone telemetry, tactical mission mapping, advanced sensor simulation (Optical 4K, FLIR Thermal Radiometry, LiDAR 3D, and Acoustic Array), and a proprietary **Survivor Verification & Localization Protocol (REC-SVLP)** to rapidly pinpoint survivors in hazardous, degraded environments.

---

## 🚀 Key Features

- 🛰️ **Real-Time Telemetry & Drone Simulation**: Realistic multi-drone flight dynamics, waypoint navigation, battery monitoring, GPS accuracy, and pitch/roll/yaw attitude gauges.
- 🎯 **REC-SVLP Multi-Sensor Fusion Engine**:
  - **Optical 4K**: Computer vision object and survivor detection.
  - **FLIR Thermal Radiometry**: Heat signature detection, human body temperature delta analysis, and hot-spot detection.
  - **LiDAR 3D Point Cloud**: Structural collapse analysis, obstacle mapping, and rubble depth estimation.
  - **Acoustic Array**: Audio triangulation for emergency cries, whistles, and tapping.
- 🗺️ **Interactive Tactical Map**: Leaflet-based geospatial map supporting satellite imagery, flight paths, survivor heatmaps, drone tracking, and geofenced exclusion zones.
- 📋 **Incident Management & Triage**: Automatic incident dispatching, triage classification (Critical, High, Medium, Low), survivor health metrics, and audit logging.
- 📷 **Gimbal Camera Control & Imagery Vault**: Real-time camera feeds, PTZ (Pan/Tilt/Zoom) controls, thermal palette modes (Ironbow, White-Hot, Rainbow), and captured imagery review.
- 📊 **Telemetry & Mission Timeline**: Complete visual timeline recording mission status changes, sensor alerts, and flight milestones.

---

## 📂 Project Architecture

```
REC/
├── public/                     # Static assets and demo imagery
├── src/
│   ├── components/             # UI Components (Map, Sensors, SVLP Panel, Modals, etc.)
│   │   ├── GimbalCameraModal.tsx
│   │   ├── Header.tsx
│   │   ├── ImageryVault.tsx
│   │   ├── IncidentDetailModal.tsx
│   │   ├── IncidentList.tsx
│   │   ├── LiveMap.tsx
│   │   ├── MissionTimeline.tsx
│   │   ├── SensorPanel.tsx
│   │   ├── SVLPIntelligencePanel.tsx
│   │   └── SystemDiagnostics.tsx
│   ├── hooks/                  # React custom hooks (useRECData)
│   ├── services/               # Data and telemetry services
│   ├── simulation/             # Drone physics & REC-SVLP detection algorithms
│   │   ├── droneSimulator.ts
│   │   └── svlpEngine.ts
│   ├── types/                  # TypeScript interfaces (telemetry, incident, SVLP, etc.)
│   ├── App.tsx                 # Main Ground Control Station application layout
│   ├── index.css               # Design system & Tailwind styling
│   └── main.tsx                # Entry point
├── 01_PRD.md                   # Product Requirements Document
├── 02_TRD.md                   # Technical Requirements Document
├── 03_SRS.md                   # Software Requirements Specification
├── 04_SYSTEM_ARCHITECTURE.md   # Complete system architecture specification
├── 05_UI_UX_SPECIFICATION.md   # Ground control station UI/UX specification
├── 06_API_DATA_SPECIFICATION.md# Proposed API and data contracts
├── 07_REC_SVLP_SPECIFICATION.md# Core survivor verification protocol specification
├── 08_MVP_ROADMAP.md           # Development phases and MVP scope
├── 09_HARDWARE_INTEGRATION_PLAN.md # Hardware integration plan for physical UAS
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🛠️ Tech Stack

- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Mapping**: [Leaflet](https://leafletjs.com/) & React-Leaflet
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🏁 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- `npm` or `yarn` / `pnpm`

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/sid43-stack/REC.git
   cd REC
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173`.

4. **Build for production:**
   ```bash
   npm run build
   ```

---

## 📑 Detailed Documentation

All design and engineering specifications are included in the repository:

1. [`01_PRD.md`](01_PRD.md) — Product Requirements Document
2. [`02_TRD.md`](02_TRD.md) — Technical Requirements Document
3. [`03_SRS.md`](03_SRS.md) — Software Requirements Specification
4. [`04_SYSTEM_ARCHITECTURE.md`](04_SYSTEM_ARCHITECTURE.md) — System Architecture
5. [`05_UI_UX_SPECIFICATION.md`](05_UI_UX_SPECIFICATION.md) — Frontend & GCS Specification
6. [`06_API_DATA_SPECIFICATION.md`](06_API_DATA_SPECIFICATION.md) — Data Contracts & Schemas
7. [`07_REC_SVLP_SPECIFICATION.md`](07_REC_SVLP_SPECIFICATION.md) — Survivor Verification Protocol
8. [`08_MVP_ROADMAP.md`](08_MVP_ROADMAP.md) — MVP Scope & Development Roadmap
9. [`09_HARDWARE_INTEGRATION_PLAN.md`](09_HARDWARE_INTEGRATION_PLAN.md) — Physical Drone & Sensor Hardware Integration

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
