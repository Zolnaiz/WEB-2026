import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const groups = {
  'group-1': ['user-student-1', 'user-student-2'],
  'group-2': ['user-student-3', 'user-student-4'],
};

const submissions = [
  {
    id: 'sub-1',
    course_id: 'course-1',
    lesson_id: 'lesson-1',
    user_id: 'user-student-1',
    group_id: 'group-1',
    group_members: groups['group-1'],
    content: 'Initial assignment draft about event-driven architecture.',
    image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475',
    file_url: 'https://example.com/file-1.pdf',
    video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    grade_point: null,
    feedback: '',
    status: 'pending',
    created_at: new Date(Date.now() - 8_000_000).toISOString(),
  },
  {
    id: 'sub-2',
    course_id: 'course-1',
    lesson_id: 'lesson-1',
    user_id: 'user-student-3',
    group_id: 'group-2',
    group_members: groups['group-2'],
    content: 'Final submission with optimization report and demo notes.',
    image_url: '',
    file_url: 'https://example.com/final-report.pdf',
    video_url: 'https://youtu.be/ysz5S6PUM-U',
    grade_point: 92,
    feedback: 'Strong analysis and clean documentation.',
    status: 'graded',
    created_at: new Date(Date.now() - 4_000_000).toISOString(),
    graded_at: new Date(Date.now() - 2_000_000).toISOString(),
  },
];

function isValidUrl(value) {
  if (!value) return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function validateSubmissionPayload(payload) {
  const errors = {};

  if (!payload.content?.trim()) {
    errors.content = 'Content is required';
  }

  const hasAsset = [payload.content?.trim(), payload.file_url?.trim(), payload.video_url?.trim(), payload.image_url?.trim()].some(Boolean);
  if (!hasAsset) {
    errors.general = 'At least one of text, image, file, or video must be provided';
  }

  if (!isValidUrl(payload.file_url)) errors.file_url = 'File URL must be valid';
  if (!isValidUrl(payload.video_url)) errors.video_url = 'Video URL must be valid';
  if (!isValidUrl(payload.image_url)) errors.image_url = 'Image URL must be valid';

  return errors;
}

app.get('/api/submissions', (req, res) => {
  const {
    course_id,
    lesson_id,
    user_id,
    status,
    search,
    student,
    group_id,
    sort = 'desc',
    page = 1,
    pageSize = 6,
  } = req.query;

  let data = submissions.filter((item) => {
    if (course_id && item.course_id !== course_id) return false;
    if (lesson_id && item.lesson_id !== lesson_id) return false;
    if (user_id && item.user_id !== user_id) return false;
    if (student && item.user_id !== student) return false;
    if (group_id && item.group_id !== group_id) return false;
    if (status && item.status !== status) return false;
    if (search && !item.content.toLowerCase().includes(String(search).toLowerCase())) return false;
    return true;
  });

  data = data.sort((a, b) => {
    const aTime = new Date(a.created_at).getTime();
    const bTime = new Date(b.created_at).getTime();
    return sort === 'asc' ? aTime - bTime : bTime - aTime;
  });

  const currentPage = Math.max(1, Number(page));
  const limit = Math.max(1, Number(pageSize));
  const total = data.length;
  const paginated = data.slice((currentPage - 1) * limit, (currentPage - 1) * limit + limit);

  return res.json({ items: paginated, total, page: currentPage, pageSize: limit });
});

app.get('/api/submissions/:id', (req, res) => {
  const item = submissions.find((entry) => entry.id === req.params.id);
  if (!item) return res.status(404).json({ message: 'Submission not found' });
  return res.json({ item });
});

app.post('/api/submissions', (req, res) => {
  const errors = validateSubmissionPayload(req.body);
  if (Object.keys(errors).length) return res.status(400).json({ message: 'Validation failed', errors });

  const {
    lesson_id,
    course_id,
    user_id,
    group_id = null,
    content,
    file_url = '',
    video_url = '',
    image_url = '',
  } = req.body;

  const item = {
    id: `sub-${Date.now()}`,
    course_id,
    lesson_id,
    user_id,
    group_id,
    group_members: group_id ? groups[group_id] || [user_id] : [user_id],
    content: content.trim(),
    file_url,
    video_url,
    image_url,
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

  const errors = validateSubmissionPayload(req.body);
  if (Object.keys(errors).length) return res.status(400).json({ message: 'Validation failed', errors });

  const { content, file_url = '', video_url = '', image_url = '', group_id = submissions[idx].group_id } = req.body;

  submissions[idx] = {
    ...submissions[idx],
    content: content.trim(),
    file_url,
    video_url,
    image_url,
    group_id,
    group_members: group_id ? groups[group_id] || submissions[idx].group_members : submissions[idx].group_members,
  };

  return res.json({ item: submissions[idx] });
});

app.post('/api/submissions/:id/grade', (req, res) => {
  const idx = submissions.findIndex((entry) => entry.id === req.params.id);
  if (idx < 0) return res.status(404).json({ message: 'Submission not found' });

  const { grade_point, feedback = '', grader_id, status = 'graded' } = req.body;
  const numericGrade = Number(grade_point);

  if (Number.isNaN(numericGrade) || numericGrade < 0 || numericGrade > 100) {
    return res.status(400).json({ message: 'Grade must be between 0 and 100' });
  }

  if (!['graded', 'needs_revision'].includes(status)) {
    return res.status(400).json({ message: 'Status must be graded or needs_revision' });
  }

  submissions[idx] = {
    ...submissions[idx],
    grade_point: numericGrade,
    feedback,
    grader_id,
    status,
    graded_at: new Date().toISOString(),
  };

  return res.json({ item: submissions[idx] });
});

app.listen(PORT, () => {
  console.log(`Submission API running on http://localhost:${PORT}`);
});
