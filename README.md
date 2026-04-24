# LMS Assignment (Submission) Module

Production-style assignment submission module with React + Tailwind frontend and Node.js + Express backend.

## Folder Structure

```bash
.
├── backend/
│   └── server.js
├── src/
│   ├── components/
│   ├── context/
│   ├── hooks/
│   ├── pages/
│   ├── services/
│   └── utils/
├── index.html
├── package.json
└── ...
```

## Frontend Features

- React hooks only
- React Router v6 pages
- Tailwind-only UI
- Role-based route protection (`student`, `teacher`, `admin`)
- Assignment create/edit/view workflow
- Teacher/Admin grading modal with lock after grading
- Status badges (`pending`, `graded`, `late`)
- Loading skeleton, empty state, error state
- Search, status filter, pagination
- Toast notifications

## Backend Endpoints

- `GET /api/submissions`
- `GET /api/submissions/:id`
- `POST /api/submissions`
- `PUT /api/submissions/:id`
- `POST /api/submissions/:id/grade`

Submission shape:

```json
{
  "id": "sub-1",
  "lesson_id": "lesson-1",
  "user_id": "user-student-1",
  "content": "...",
  "file_url": "https://...",
  "video_url": "https://...",
  "grade_point": null,
  "feedback": "",
  "status": "pending",
  "created_at": "2026-04-24T00:00:00.000Z"
}
```

## Run Locally

```bash
npm install
npm run server   # starts Express on :4000
npm run dev      # starts Vite on :5173 (with /api proxy)
```

## Route Map

- `/courses/:course_id/submissions`
- `/courses/:course_id/lessons/:lesson_id/submissions`
- `/courses/:course_id/lessons/:lesson_id/submissions/create`
- `/courses/:course_id/lessons/:lesson_id/submissions/:id`
- `/courses/:course_id/lessons/:lesson_id/submissions/:id/edit`

## Example Requests

```bash
curl -X GET 'http://localhost:4000/api/submissions?course_id=course-1&lesson_id=lesson-1&page=1&pageSize=5'
```

```bash
curl -X POST 'http://localhost:4000/api/submissions' \
  -H 'Content-Type: application/json' \
  -d '{
    "course_id": "course-1",
    "lesson_id": "lesson-1",
    "user_id": "user-student-1",
    "content": "My final answer",
    "file_url": "https://example.com/answer.pdf",
    "video_url": "https://youtu.be/demo"
  }'
```

```bash
curl -X POST 'http://localhost:4000/api/submissions/sub-1/grade' \
  -H 'Content-Type: application/json' \
  -d '{
    "grade_point": 92,
    "feedback": "Great work. Improve conclusion.",
    "grader_id": "user-teacher-1"
  }'
```
