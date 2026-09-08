# Product Requirements Document (PRD)

# REC — Rapid Emergency & Crisis-response Drone

## 1. Product Overview
REC is a proposed intelligent disaster-response drone system designed to assist rescue teams in searching disaster zones and identifying locations that may require urgent investigation.

Unlike a conventional drone that only streams video or independently reports individual sensor readings, REC is designed around an evidence-based decision process. The system combines visual, thermal and acoustic signals to identify suspicious locations and trigger further investigation.

The software command center is the primary interface through which an operator monitors the mission, sensor evidence, drone status and possible survivor alerts.

## 2. Problem Statement
During earthquakes, building collapses, landslides, floods and similar emergencies, rescue teams may need to search large, dangerous and inaccessible areas. Manual searching can be slow and visually inspecting an area may not be sufficient when a person is obscured by debris or poor visibility.

There is a need for a system that can:
- Cover an assigned search area systematically.
- Collect multiple types of evidence.
- Highlight suspicious locations.
- Re-investigate locations instead of relying on a single observation.
- Provide rescue teams with understandable, prioritized information.

## 3. Proposed Solution
REC combines:
- RGB visual sensing.
- Thermal sensing.
- Acoustic sensing.
- GPS and flight telemetry.
- A decision layer called REC-SVLP.
- A command-center dashboard.

The proposed operational cycle is:

Search → Detect → Investigate → Verify → Alert

## 4. Target Users
- Disaster response teams.
- Search-and-rescue operators.
- Emergency management organizations.
- Drone operators supporting rescue missions.

## 5. Core Features

### 5.1 Mission Monitoring
The operator can view:
- Mission state.
- Battery level.
- Altitude.
- Speed.
- GPS status.
- Connection status.

### 5.2 Live Map
The system displays:
- Current drone position.
- Search path.
- Search area.
- Previously scanned areas.
- Suspicious locations.
- High-priority alerts.

### 5.3 Sensor Evidence Monitoring
The dashboard displays evidence from:
- RGB vision.
- Thermal sensing.
- Acoustic sensing.

### 5.4 REC-SVLP Decision Engine
The system combines available evidence and determines whether a location should:
- Continue being scanned.
- Be marked as suspicious.
- Enter investigation mode.
- Enter verification mode.
- Generate a rescue alert.

### 5.5 Incident Management
Each suspicious or high-priority event should contain:
- Unique incident ID.
- Timestamp.
- Estimated location.
- Sensor evidence.
- Confidence score.
- Current status.

## 6. MVP Scope
The first version should focus on software and simulated telemetry.

### Included
- Interactive command-center dashboard.
- Simulated drone movement.
- Interactive map.
- Simulated RGB, thermal and acoustic evidence.
- REC-SVLP evidence scoring.
- Incident alerts.
- Mission-state transitions.

### Not Required for the First MVP
- Real autonomous flight.
- Full real-time AI.
- SLAM.
- Swarm coordination.
- Advanced obstacle avoidance.

## 7. Success Criteria
The MVP is successful if it can:
1. Simulate a complete search mission.
2. Display changing sensor evidence.
3. Trigger REC-SVLP state changes.
4. Show suspicious locations on a map.
5. Generate understandable high-priority alerts.
6. Demonstrate why multiple evidence sources are stronger than a single detection.

## 8. Future Scope
- Real drone integration.
- Real thermal imaging.
- AI-based human detection.
- Acoustic classification and localization.
- SLAM-based mapping and GPS-denied navigation.
- Multi-drone coordination.
- Offline emergency communication.
