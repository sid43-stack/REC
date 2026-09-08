# REC System Architecture

## 1. Architecture Philosophy
REC is designed as a modular intelligence layer rather than a single tightly coupled device. The same command-center software should initially work with a simulator and later work with physical hardware.

## 2. Layered Architecture

```text
+---------------------------------------------------+
|                  REC COMMAND CENTER               |
| Dashboard | Map | Sensors | Alerts | Incidents    |
+--------------------------^------------------------+
                           |
+--------------------------+------------------------+
|             BACKEND / DATA GATEWAY                |
| API | WebSocket | Data Normalization | Logging    |
+--------------------------^------------------------+
                           |
+--------------------------+------------------------+
|                REC-SVLP ENGINE                    |
| Evidence Scoring | State Machine | Alerts         |
+--------------------------^------------------------+
                           |
+-------------+------------+-------------+----------+
              |            |             |
         Visual Data   Thermal Data   Acoustic Data
              |            |             |
+-------------+------------+-------------+----------+
|             DRONE / SENSOR PLATFORM               |
| Flight Controller | GPS | Camera | Thermal | Mic  |
+---------------------------------------------------+
```

## 3. Core Separation
### Flight Layer
Responsible for physical flight, stabilization and navigation.

### Sensing Layer
Collects environmental information.

### Intelligence Layer
Combines evidence and determines the next logical state.

### Presentation Layer
Communicates the mission situation to a human operator.

## 4. Why This Architecture Is Important
The software can be demonstrated before hardware is complete. Later hardware can be connected through a data adapter without redesigning the user interface.
