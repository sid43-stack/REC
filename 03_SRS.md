# Software Requirements Specification (SRS)

# REC Command Center

## 1. Purpose
This document specifies the functional and non-functional requirements for the REC software system.

## 2. User Role
### Operator
The primary user monitors missions, observes incidents and interprets the evidence presented by REC.

## 3. Functional Requirements

### FR-01: Dashboard
The system shall display an overview of mission status and active alerts.

### FR-02: Telemetry
The system shall display battery, altitude, speed, location and connection status when data is available.

### FR-03: Map
The system shall display:
- Drone position.
- Mission route.
- Search area.
- Incidents.

### FR-04: Sensor Evidence
The system shall display normalized evidence values for:
- Visual sensing.
- Thermal sensing.
- Acoustic sensing.

### FR-05: REC-SVLP
The system shall calculate a confidence score based on configured evidence rules.

### FR-06: Mission States
The system shall support:
- SEARCH
- SUSPICION
- INVESTIGATION
- VERIFICATION
- ALERT
- RETURN

### FR-07: Alerts
The system shall generate an incident when evidence reaches a configured threshold.

### FR-08: Incident History
The operator shall be able to view previous incidents generated during a mission.

## 4. Non-Functional Requirements
- The UI should remain understandable under high information density.
- The MVP should function on a standard laptop browser.
- Simulation mode should not require a drone.
- Components should be modular and reusable.
- The system should support future real-time data integration.

## 5. Error Handling
The system should visibly report:
- GPS unavailable.
- Sensor unavailable.
- Telemetry connection lost.
- Low battery.
- Stale data.

## 6. Acceptance Criteria
A complete simulated mission must demonstrate the transition from normal search to a potential survivor alert while exposing the evidence responsible for the decision.
