# REC API and Data Specification

## 1. Development Approach
The frontend should initially use a mock data provider. The same data structure can later be supplied by a backend or hardware gateway.

## 2. Telemetry Object

```json
{
  "timestamp": "2026-09-05T10:00:00Z",
  "droneId": "REC-01",
  "latitude": 28.6139,
  "longitude": 77.2090,
  "altitude": 35.2,
  "speed": 7.4,
  "battery": 82,
  "gpsStatus": "LOCKED",
  "connection": "CONNECTED"
}
```

## 3. Sensor Evidence Object

```json
{
  "visual": 0.72,
  "thermal": 0.81,
  "acoustic": 0.64,
  "timestamp": "2026-09-05T10:00:05Z"
}
```

## 4. Incident Object

```json
{
  "incidentId": "INC-001",
  "timestamp": "2026-09-05T10:00:08Z",
  "latitude": 28.6142,
  "longitude": 77.2094,
  "confidence": 0.86,
  "status": "HIGH_PRIORITY",
  "evidence": {
    "visual": 0.72,
    "thermal": 0.91,
    "acoustic": 0.82
  }
}
```

## 5. Proposed Endpoints
- `GET /api/mission`
- `GET /api/telemetry`
- `GET /api/incidents`
- `GET /api/sensors`
- `POST /api/mission/start`
- `POST /api/mission/stop`

## 6. Real-Time Events
- `telemetry:update`
- `sensor:update`
- `mission:state-change`
- `incident:created`
- `system:warning`
