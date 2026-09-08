# Technical Requirements Document (TRD)

# REC — Technical Requirements

## 1. Technical Objective
Build a modular command-and-control software system that can first operate with simulated data and later accept telemetry and sensor data from a physical drone platform.

## 2. Recommended Initial Technology Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS

### Visualization
- Leaflet for map visualization
- Recharts or a similar charting library for evidence history

### State Management
- React Context or Zustand

### Backend (Phase 2)
- Node.js
- Express or Fastify
- WebSocket / Socket.IO for real-time data

### Data Storage
- SQLite for early development
- PostgreSQL for a scalable version

## 3. High-Level Architecture

```text
Drone / Simulator
      |
      v
Telemetry + Sensor Data
      |
      v
Communication Layer
      |
      v
REC Backend / Data Gateway
      |
      +-------------------+
      |                   |
      v                   v
REC-SVLP Engine      Data Storage
      |                   |
      +---------+---------+
                |
                v
      REC Command Center
```

## 4. Frontend Modules
- Dashboard shell.
- Mission control.
- Live map.
- Sensor evidence panel.
- REC-SVLP intelligence panel.
- Incident list.
- Incident detail view.
- System logs.

## 5. Data Flow
1. A data source produces telemetry.
2. Sensor readings are normalized.
3. The REC-SVLP engine evaluates evidence.
4. The mission state is updated.
5. The frontend receives the new state.
6. The dashboard updates in near real time.

## 6. Future Hardware Architecture

```text
Pixhawk
  |
  | MAVLink
  v
Companion Interface / Gateway
  |
  +--> GPS / Flight Telemetry
  |
Sensors
  |
  +--> RGB Camera
  +--> Thermal Sensor
  +--> Microphone
  |
  v
Processing Layer
  |
  v
REC-SVLP
  |
  v
Command Center
```

## 7. Non-Functional Requirements
- Responsive dashboard.
- Clear information hierarchy.
- Modular architecture.
- Simulated mode must work without hardware.
- Hardware integration should not require rebuilding the frontend.
- Important state changes should be logged.
