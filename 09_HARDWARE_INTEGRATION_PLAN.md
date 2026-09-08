# REC Hardware Integration Plan

## 1. Principle
Hardware should be integrated after the software architecture is stable.

## 2. Proposed Components

### Flight Platform
- Suitable quadcopter platform.
- Pixhawk or compatible flight controller.
- GPS and compass.
- Battery and telemetry system.

### Sensing
- RGB camera.
- Thermal sensor.
- MEMS microphone or microphone array.

### Computing
Because the budget is constrained, the first prototype may use:
- ESP32 for lightweight sensor communication and control.
- A more capable companion computer only if advanced vision processing is required.

## 3. Communication Concept

```text
Flight Controller ---- Telemetry ----                                      Sensors -------- Sensor Data ----------> REC Data Gateway
                                        /
Companion / ESP32 ---------------------/
```

## 4. Integration Order
1. Receive flight telemetry.
2. Display telemetry in the dashboard.
3. Integrate GPS location.
4. Integrate thermal readings.
5. Integrate acoustic events.
6. Integrate visual events.
7. Connect evidence to REC-SVLP.

## 5. Safety
Physical flight testing must be approached separately from software testing. A simulated environment should be used to validate application behavior before relying on live flight data.
