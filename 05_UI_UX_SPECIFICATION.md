# REC UI/UX Specification

## 1. Product Interface
The main application is named:

# REC Command Center

It should feel like a professional rescue operations interface rather than a generic website.

## 2. Primary Layout

```text
+----------------------------------------------------------+
| REC | Mission Status | Connection | Battery | Time       |
+----------------+---------------------------+-------------+
| Mission        |                           | Intelligence|
| Controls       |        LIVE MAP           | REC-SVLP    |
|                |                           | Evidence    |
+----------------+---------------------------+-------------+
| Sensor Status  | Incidents / Alerts / Mission Timeline   |
+----------------------------------------------------------+
```

## 3. Required Screens

### Screen 1: Main Command Center
The primary operational screen.

### Screen 2: Incident Detail
Shows location, confidence and evidence associated with an alert.

### Screen 3: Mission History
Shows past incidents and mission events.

### Screen 4: System Status
Shows telemetry and sensor connection health.

## 4. Core UI Components
- Status badge.
- Evidence score card.
- Mission mode indicator.
- Alert card.
- Map marker.
- Sensor health indicator.
- Mission timeline.

## 5. UX Principle
The operator should understand three things within seconds:
1. Where is the drone?
2. What is the drone detecting?
3. What action is REC currently taking?

## 6. Visual Style
- Modern.
- Technical.
- High information clarity.
- Dark command-center aesthetic.
- Strong distinction between normal, suspicious and critical states.
