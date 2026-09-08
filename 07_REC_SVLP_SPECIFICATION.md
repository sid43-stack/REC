# REC-SVLP Specification

# Survivor Verification & Localization Protocol

## 1. Purpose
REC-SVLP is the core decision framework that determines how REC responds when potential survivor evidence is detected.

## 2. Core Principle
A single sensor observation should not automatically be treated as a confirmed survivor.

Instead:

```text
Search
  ↓
Detect unusual evidence
  ↓
Investigate location
  ↓
Collect additional evidence
  ↓
Estimate confidence
  ↓
Alert when appropriate
```

## 3. Mission States

### SEARCH
Normal area scanning.

### SUSPICION
One or more signals cross a preliminary threshold.

### INVESTIGATION
The system collects additional evidence around the suspicious location.

### VERIFICATION
The system evaluates whether the available evidence is sufficiently strong.

### ALERT
A high-priority incident is created.

### RETURN
The mission is completed or the system must return.

## 4. Initial Demonstration Score
For the software MVP:

`confidence = weighted visual + weighted thermal + weighted acoustic`

The exact weights should remain configurable rather than being permanently hard-coded.

## 5. Example Logic
- Low evidence → continue search.
- One strong signal → suspicion.
- Multiple supporting signals → investigation.
- Strong combined evidence → alert.

## 6. Important Limitation
The confidence score is a project decision-support metric. It should not be represented as a guarantee that a survivor has been confirmed.
