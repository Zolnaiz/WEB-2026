# LMS (F.ITM301 Alignment)

## Install & run

```bash
npm install
npm run server
npm run dev
```

Frontend runs at `http://localhost:5173` and backend API at `http://localhost:4000`.

## API base URL setup

Create `.env` from `.env.example` and set:

```bash
VITE_API_BASE_URL=/api
```

You can also point to an external API URL (for example `https://your-host/api`).

## Test accounts

- `admin@must.edu.mn / 123`
- `schooladmin@must.edu.mn / 123`
- `schoolteacher@must.edu.mn / 123`
- `schoolstudent@must.edu.mn / 123`

Passwords are hashed with bcrypt in backend storage.

## Known routes (assignment-critical)

- Auth: `/login`, `/register`, `/forgot-password`, `/reset-password`
- Profile: `/profile`, `/profile/change-password`
- School and role modules: `/schools/current`, `/roles`
- Course users/questions/grade modules:
  - `/courses/:course_id/users`
  - `/courses/:course_id/users/edit`
  - `/courses/:course_id/groups/:group_id/users`
  - `/question-types`
  - `/question-levels`
  - `/courses/:course_id/questions`
  - `/courses/:course_id/question-points`
  - `/courses/:course_id/questions/create`
  - `/courses/:course_id/questions/:question_id`
  - `/courses/:course_id/questions/:question_id/edit`
  - `/courses/:course_id/questions/report`
  - `/courses/:course_id/grade`
  - `/grade`
- Attendance modules:
  - `/course/:course_id/attendances`
  - `/course/:course_id/attendances/:lesson_id`
  - `/course/:course_id/attendances/:lesson_id/requests`
  - `/course/:course_id/attendances/requests`
- Exam report/check/result:
  - `/exams/:exam_id/report`
  - `/exams/:exam_id/students/:student_id/check`
  - `/exams/:exam_id/students/:student_id/result`

## Role access summary

- **Admin**: user/role/school/course management.
- **School admin**: school-level and user management.
- **Teacher**: course/lesson/submission grading/attendance/exam management.
- **Student**: lesson/exam/submission/grade viewing and participation.

## Notes

- Public registration creates **student** accounts only.
- Teacher/admin/school-admin accounts must be created by admin/school-admin endpoints.
- Several module pages include API-backed rendering with sample fallback when API is unavailable.
