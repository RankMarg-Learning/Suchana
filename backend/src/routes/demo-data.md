# Exam Suchana - API Demo Data Insertion

This guide provides sample `curl` requests to populate the database with demo exam data for testing the **Government Exam Execution Platform**.

## Pre-requisites
- Backend server running (default: `http://localhost:3000`)
- `X-API-Key` must match your `API_KEY_SECRET` in `.env`
- `X-Admin-ID` can be any string (e.g., `admin_01`)

---

## 1. Create a New Exam (UC-01)
**POST** `/api/v1/exams`

### Sample: UPSC Civil Services 2025
```bash
curl -X POST http://localhost:3000/api/v1/exams \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_secret_key" \
  -H "X-Admin-ID: admin_01" \
  -d '{
    "title": "UPSC Civil Services Examination 2025",
    "shortTitle": "UPSC CSE 2025",
    "description": "The Civil Services Examination is a nationwide competitive examination in India conducted by the Union Public Service Commission for recruitment to various Civil Services of the Government of India.",
    "category": "UPSC",
    "conductingBody": "Union Public Service Commission",
    "minAge": 21,
    "maxAge": 32,
    "minQualification": "Graduate",
    "totalVacancies": 1056,
    "applicationFee": {
      "General/OBC": 100,
      "SC/ST/PH/Female": 0
    },
    "officialWebsite": "https://upsc.gov.in",
    "notificationUrl": "https://upsc.gov.in/notif.pdf",
    "isPublished": true
  }'
```

---

## 2. Add Lifecycle Events (UC-02)
Replace `{examId}` with the `id` returned from the previous request.

### A. Notification Released
**POST** `/api/v1/exams/{examId}/events`
```bash
curl -X POST http://localhost:3000/api/v1/exams/{examId}/events \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_secret_key" \
  -H "X-Admin-ID: admin_01" \
  -d '{
    "eventType": "NOTIFICATION_OUT",
    "title": "Official Notification Released",
    "description": "UPSC has released the official notification for CSE 2025.",
    "scheduledAt": "2025-02-01T10:00:00Z",
    "isConfirmed": true,
    "actionUrl": "https://upsc.gov.in/notifications"
  }'
```

### B. Registration Start (Triggers Notification)
**POST** `/api/v1/exams/{examId}/events`
```bash
curl -X POST http://localhost:3000/api/v1/exams/{examId}/events \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_secret_key" \
  -H "X-Admin-ID: admin_01" \
  -d '{
    "eventType": "REGISTRATION_START",
    "title": "Application Window Opens",
    "description": "Apply online for UPSC CSE 2025 starting today.",
    "scheduledAt": "2025-02-05T09:00:00Z",
    "endsAt": "2025-03-05T18:00:00Z",
    "isConfirmed": true,
    "actionUrl": "https://upsconline.nic.in"
  }'
```

### C. Admit Card Release
**POST** `/api/v1/exams/{examId}/events`
```bash
curl -X POST http://localhost:3000/api/v1/exams/{examId}/events \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_secret_key" \
  -H "X-Admin-ID: admin_01" \
  -d '{
    "eventType": "ADMIT_CARD_RELEASE",
    "title": "Prelims Admit Card Available",
    "description": "Download your admit card for UPSC CSE Prelims 2025.",
    "scheduledAt": "2025-05-15T12:00:00Z",
    "isConfirmed": false
  }'
```

---

## 3. Create Another Exam (SSC CGL)
**POST** `/api/v1/exams`

```bash
curl -X POST http://localhost:3000/api/v1/exams \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_secret_key" \
  -H "X-Admin-ID: admin_01" \
  -d '{
    "title": "SSC Combined Graduate Level Examination 2024",
    "shortTitle": "SSC CGL 2024",
    "description": "Staff Selection Commission - Combined Graduate Level Examination, often referred to as SSC CGL is an examination conducted to recruit staff to various posts in ministries, departments and organisations of the Government of India.",
    "category": "SSC",
    "conductingBody": "Staff Selection Commission",
    "minAge": 18,
    "maxAge": 32,
    "minQualification": "Graduate",
    "totalVacancies": 17727,
    "applicationFee": {
      "General/OBC": 100,
      "SC/ST/PH/Women": 0
    },
    "officialWebsite": "https://ssc.gov.in",
    "isPublished": true
  }'
```

---

## 4. Verify Data (Public API)

### List all published exams
**GET** `/api/v1/exams`
```bash
curl -X GET http://localhost:3000/api/v1/exams?isPublished=true
```

### View Exam Timeline (UC-04)
**GET** `/api/v1/exams/{examId}/timeline`
```bash
curl -X GET http://localhost:3000/api/v1/exams/{examId}/timeline
```
