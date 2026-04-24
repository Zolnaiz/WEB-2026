import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const submissions = [
  {
    id: 'sub-1',
    course_id: 'course-1',
    lesson_id: 'lesson-1',
    user_id: 'user-student-1',
    content: 'Initial assignment draft about event-driven architecture.',
    file_url: 'https://example.com/file-1.pdf',
    video_url: '',
    grade_point: null,
    feedback: '',
    status: 'pending',
    created_at: new Date().toISOString(),
  },
];

function getStatusByDueDate(submission) {
  if (submission.status === 'graded') return 'graded';
  return submission.status || 'pending';
}

app.get('/api/submissions', (req, res) => {
  const { course_id, lesson_id, user_id, status, search, page = 1, pageSize = 5 } = req.query;

  let data = submissions.filter((item) => {
    if (course_id && item.course_id !== course_id) return false;
    if (lesson_id && item.lesson_id !== lesson_id) return false;
    if (user_id && item.user_id !== user_id) return false;
    if (status && getStatusByDueDate(item) !== status) return false;
    if (search && !item.content.toLowerCase().includes(String(search).toLowerCase())) return false;
    return true;
  });

  const currentPage = Number(page);
  const limit = Number(pageSize);
  const total = data.length;

  data = data.slice((currentPage - 1) * limit, (currentPage - 1) * limit + limit);

  return res.json({ items: data, total, page: currentPage, pageSize: limit });
});

app.get('/api/submissions/:id', (req, res) => {
  const item = submissions.find((entry) => entry.id === req.params.id);
  if (!item) return res.status(404).json({ message: 'Submission not found' });
  return res.json({ item });
});

app.post('/api/submissions', (req, res) => {
  const { lesson_id, course_id, user_id, content, file_url = '', video_url = '' } = req.body;
  if (!content?.trim()) return res.status(400).json({ message: 'Content is required' });

  const item = {
    id: `sub-${Date.now()}`,
    course_id,
    lesson_id,
    user_id,
    content: content.trim(),
    file_url,
    video_url,
    grade_point: null,
    feedback: '',
    status: 'pending',
    created_at: new Date().toISOString(),
  };

  submissions.unshift(item);
  return res.status(201).json({ item });
});

app.put('/api/submissions/:id', (req, res) => {
  const idx = submissions.findIndex((entry) => entry.id === req.params.id);
  if (idx < 0) return res.status(404).json({ message: 'Submission not found' });

  if (submissions[idx].status === 'graded') {
    return res.status(400).json({ message: 'Submission is locked after grading' });
  }

  const { content, file_url = '', video_url = '' } = req.body;
  if (!content?.trim()) return res.status(400).json({ message: 'Content is required' });

  submissions[idx] = {
    ...submissions[idx],
    content: content.trim(),
    file_url,
    video_url,
  };

  return res.json({ item: submissions[idx] });
});

app.post('/api/submissions/:id/grade', (req, res) => {
  const idx = submissions.findIndex((entry) => entry.id === req.params.id);
  if (idx < 0) return res.status(404).json({ message: 'Submission not found' });

  const { grade_point, feedback = '', grader_id } = req.body;
  const numericGrade = Number(grade_point);

  if (Number.isNaN(numericGrade) || numericGrade < 0 || numericGrade > 100) {
    return res.status(400).json({ message: 'Grade must be between 0 and 100' });
  }

  submissions[idx] = {
    ...submissions[idx],
    grade_point: numericGrade,
    feedback,
    grader_id,
    status: 'graded',
    graded_at: new Date().toISOString(),
  };

  return res.json({ item: submissions[idx] });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Submission API running on http://localhost:${PORT}`);
});
