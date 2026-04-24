import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'data.json');
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

const app = express();
app.use(cors());
app.use(express.json());

function readData() {
  if (!fs.existsSync(DATA_FILE)) {
    const now = new Date().toISOString();
    const seed = {
      users: [
        { id: 'u-admin', name: 'Admin User', email: 'admin@lms.com', password: 'admin123', role: 'admin' },
        { id: 'u-teacher', name: 'Teacher User', email: 'teacher@lms.com', password: 'teacher123', role: 'teacher' },
        { id: 'u-student', name: 'Student User', email: 'student@lms.com', password: 'student123', role: 'student' },
      ],
      courses: [{ id: 'c-1', title: 'Web Engineering', description: 'Core LMS demo course', teacherId: 'u-teacher', groupIds: ['g-1'], createdAt: now }],
      lessons: [{ id: 'l-1', courseId: 'c-1', title: 'Lesson 1', type: 'assignment', parentId: null, content: 'Build LMS module' }],
      groups: [{ id: 'g-1', courseId: 'c-1', name: 'Group A', userIds: ['u-student'] }],
      submissions: [],
      exams: [{ id: 'e-1', courseId: 'c-1', title: 'Midterm', durationMinutes: 30 }],
      examVariants: [{ id: 'v-1', examId: 'e-1', title: 'Variant A' }],
      examQuestions: [{ id: 'q-1', variantId: 'v-1', text: '2+2=?', options: ['3', '4', '5'], correctAnswer: '4' }],
      examAttempts: [],
      attendanceTypes: [{ id: 'at-1', name: 'present' }, { id: 'at-2', name: 'absent' }, { id: 'at-3', name: 'leave' }],
      attendanceRecords: [],
      leaveRequests: [],
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(seed, null, 2));
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

let db = readData();
function persist() { fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2)); }
const genId = (prefix) => `${prefix}-${crypto.randomUUID().slice(0, 8)}`;

function signToken(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}
function verifyToken(token) {
  const [header, body, sig] = token.split('.');
  if (!header || !body || !sig) return null;
  const expected = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  if (sig !== expected) return null;
  return JSON.parse(Buffer.from(body, 'base64url').toString('utf-8'));
}

function auth(req, res, next) {
  const raw = req.headers.authorization || '';
  const token = raw.startsWith('Bearer ') ? raw.slice(7) : '';
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ message: 'Unauthorized' });
  req.user = payload;
  next();
}
function allow(...roles) {
  return (req, res, next) => (roles.includes(req.user.role) ? next() : res.status(403).json({ message: 'Forbidden' }));
}

function inCourseGroup(userId, courseId) {
  return db.groups.some((g) => g.courseId === courseId && g.userIds.includes(userId));
}
function canAccessCourse(req, courseId) {
  return req.user.role === 'admin' || (req.user.role === 'teacher' && db.courses.some((c) => c.id === courseId && c.teacherId === req.user.id)) || inCourseGroup(req.user.id, courseId);
}

app.get('/api/health', (_, res) => res.json({ ok: true }));

app.post('/api/auth/register', (req, res) => {
  const { name, email, password, role = 'student' } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'name, email, password are required' });
  if (db.users.some((u) => u.email === email)) return res.status(409).json({ message: 'Email already exists' });
  const user = { id: genId('u'), name, email, password, role };
  db.users.push(user); persist();
  const token = signToken({ id: user.id, email: user.email, role: user.role, name: user.name });
  res.status(201).json({ token, user: { id: user.id, name, email, role } });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find((u) => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const token = signToken({ id: user.id, email: user.email, role: user.role, name: user.name });
  res.json({ token, user: { id: user.id, name: user.name, email, role: user.role } });
});

app.get('/api/auth/me', auth, (req, res) => {
  const user = db.users.find((u) => u.id === req.user.id);
  res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

const crud = (name, { roles = ['admin'], createValidate, updateValidate } = {}) => {
  app.get(`/api/${name}`, auth, (req, res) => res.json({ items: db[name] }));
  app.get(`/api/${name}/:id`, auth, (req, res) => {
    const item = db[name].find((x) => x.id === req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json({ item });
  });
  app.post(`/api/${name}`, auth, allow(...roles), (req, res) => {
    if (createValidate) {
      const err = createValidate(req.body, req);
      if (err) return res.status(400).json({ message: err });
    }
    const item = { id: genId(name.slice(0, 2)), ...req.body };
    db[name].push(item); persist();
    res.status(201).json({ item });
  });
  app.put(`/api/${name}/:id`, auth, allow(...roles), (req, res) => {
    if (updateValidate) {
      const err = updateValidate(req.body, req);
      if (err) return res.status(400).json({ message: err });
    }
    const i = db[name].findIndex((x) => x.id === req.params.id);
    if (i < 0) return res.status(404).json({ message: 'Not found' });
    db[name][i] = { ...db[name][i], ...req.body }; persist();
    res.json({ item: db[name][i] });
  });
  app.delete(`/api/${name}/:id`, auth, allow(...roles), (req, res) => {
    const i = db[name].findIndex((x) => x.id === req.params.id);
    if (i < 0) return res.status(404).json({ message: 'Not found' });
    db[name].splice(i, 1); persist();
    res.status(204).send();
  });
};

crud('users', { roles: ['admin'] });
crud('courses', { roles: ['admin', 'teacher'] });
crud('lessons', { roles: ['admin', 'teacher'] });
crud('groups', { roles: ['admin', 'teacher'] });
crud('attendanceTypes', { roles: ['admin'] });

app.get('/api/courses/:id/report', auth, allow('admin', 'teacher'), (req, res) => {
  const courseId = req.params.id;
  const report = {
    courseId,
    lessons: db.lessons.filter((l) => l.courseId === courseId).length,
    submissions: db.submissions.filter((s) => s.courseId === courseId).length,
    graded: db.submissions.filter((s) => s.courseId === courseId && s.status === 'graded').length,
    students: new Set(db.groups.filter((g) => g.courseId === courseId).flatMap((g) => g.userIds)).size,
  };
  res.json({ item: report });
});

app.post('/api/groups/:id/users/:userId', auth, allow('admin', 'teacher'), (req, res) => {
  const group = db.groups.find((g) => g.id === req.params.id);
  if (!group) return res.status(404).json({ message: 'Group not found' });
  if (!group.userIds.includes(req.params.userId)) group.userIds.push(req.params.userId);
  persist();
  res.json({ item: group });
});

app.delete('/api/groups/:id/users/:userId', auth, allow('admin', 'teacher'), (req, res) => {
  const group = db.groups.find((g) => g.id === req.params.id);
  if (!group) return res.status(404).json({ message: 'Group not found' });
  group.userIds = group.userIds.filter((id) => id !== req.params.userId);
  persist();
  res.json({ item: group });
});

app.get('/api/submissions', auth, (req, res) => {
  const { courseId, lessonId } = req.query;
  let items = db.submissions.filter((s) => (!courseId || s.courseId === courseId) && (!lessonId || s.lessonId === lessonId));
  if (req.user.role === 'student') items = items.filter((s) => s.userId === req.user.id || (s.groupId && inCourseGroup(req.user.id, s.courseId)));
  res.json({ items });
});

app.post('/api/submissions', auth, allow('student', 'admin'), (req, res) => {
  const { courseId, lessonId, content = '', fileUrl = '' } = req.body;
  if (!canAccessCourse(req, courseId)) return res.status(403).json({ message: 'Forbidden' });
  if (!content.trim() && !fileUrl.trim()) return res.status(400).json({ message: 'content OR fileUrl is required' });
  const item = { id: genId('sb'), courseId, lessonId, userId: req.user.id, content, fileUrl, status: 'submitted', grade: null, feedback: '', createdAt: new Date().toISOString() };
  db.submissions.push(item); persist();
  res.status(201).json({ item });
});

app.put('/api/submissions/:id', auth, allow('student', 'admin'), (req, res) => {
  const item = db.submissions.find((s) => s.id === req.params.id);
  if (!item) return res.status(404).json({ message: 'Not found' });
  if (item.status === 'graded') return res.status(400).json({ message: 'Already graded' });
  if (req.user.role === 'student' && item.userId !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
  const { content = '', fileUrl = '' } = req.body;
  if (!content.trim() && !fileUrl.trim()) return res.status(400).json({ message: 'content OR fileUrl is required' });
  Object.assign(item, { content, fileUrl }); persist();
  res.json({ item });
});

app.delete('/api/submissions/:id', auth, allow('student', 'admin'), (req, res) => {
  const idx = db.submissions.findIndex((s) => s.id === req.params.id);
  if (idx < 0) return res.status(404).json({ message: 'Not found' });
  const item = db.submissions[idx];
  if (req.user.role === 'student' && item.userId !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
  db.submissions.splice(idx, 1); persist();
  res.status(204).send();
});

app.post('/api/submissions/:id/grade', auth, allow('teacher', 'admin'), (req, res) => {
  const item = db.submissions.find((s) => s.id === req.params.id);
  if (!item) return res.status(404).json({ message: 'Not found' });
  if (!canAccessCourse(req, item.courseId)) return res.status(403).json({ message: 'Forbidden' });
  const { grade, feedback = '', status = 'graded' } = req.body;
  if (!['graded', 'rejected'].includes(status)) return res.status(400).json({ message: 'Invalid status' });
  item.grade = Number(grade);
  item.feedback = feedback;
  item.status = status;
  item.gradedBy = req.user.id;
  persist();
  res.json({ item });
});

crud('exams', { roles: ['admin', 'teacher'] });
crud('examVariants', { roles: ['admin', 'teacher'] });
crud('examQuestions', { roles: ['admin', 'teacher'] });

app.post('/api/exams/:examId/start', auth, allow('student'), (req, res) => {
  if (!canAccessCourse(req, db.exams.find((e) => e.id === req.params.examId)?.courseId)) return res.status(403).json({ message: 'Forbidden' });
  const variant = db.examVariants.find((v) => v.examId === req.params.examId);
  if (!variant) return res.status(404).json({ message: 'No variant' });
  const attempt = { id: genId('atp'), examId: req.params.examId, userId: req.user.id, variantId: variant.id, answers: {}, status: 'started', score: null };
  db.examAttempts.push(attempt); persist();
  res.status(201).json({ item: attempt });
});

app.get('/api/exam-attempts/:id/questions', auth, (req, res) => {
  const attempt = db.examAttempts.find((a) => a.id === req.params.id && a.userId === req.user.id);
  if (!attempt) return res.status(404).json({ message: 'Attempt not found' });
  const items = db.examQuestions.filter((q) => q.variantId === attempt.variantId).map((q) => ({ id: q.id, text: q.text, options: q.options }));
  res.json({ items });
});

app.post('/api/exam-attempts/:id/submit', auth, allow('student'), (req, res) => {
  const attempt = db.examAttempts.find((a) => a.id === req.params.id && a.userId === req.user.id);
  if (!attempt) return res.status(404).json({ message: 'Attempt not found' });
  attempt.answers = req.body.answers || {};
  attempt.status = 'finished';
  const qs = db.examQuestions.filter((q) => q.variantId === attempt.variantId);
  const correct = qs.filter((q) => attempt.answers[q.id] === q.correctAnswer).length;
  attempt.score = qs.length ? Math.round((correct / qs.length) * 100) : 0;
  persist();
  res.json({ item: attempt });
});

app.get('/api/exam-attempts/:id/result', auth, (req, res) => {
  const attempt = db.examAttempts.find((a) => a.id === req.params.id && (req.user.role !== 'student' || a.userId === req.user.id));
  if (!attempt) return res.status(404).json({ message: 'Attempt not found' });
  res.json({ item: attempt });
});

app.get('/api/attendance', auth, (req, res) => {
  const items = req.user.role === 'student' ? db.attendanceRecords.filter((r) => r.userId === req.user.id) : db.attendanceRecords;
  res.json({ items });
});
app.post('/api/attendance', auth, allow('teacher', 'admin'), (req, res) => {
  const item = { id: genId('ar'), ...req.body };
  db.attendanceRecords.push(item); persist();
  res.status(201).json({ item });
});

app.get('/api/leave-requests', auth, (req, res) => {
  const items = req.user.role === 'student' ? db.leaveRequests.filter((r) => r.userId === req.user.id) : db.leaveRequests;
  res.json({ items });
});
app.post('/api/leave-requests', auth, allow('student'), (req, res) => {
  const item = { id: genId('lr'), userId: req.user.id, status: 'submitted', ...req.body };
  db.leaveRequests.push(item); persist();
  res.status(201).json({ item });
});
app.post('/api/leave-requests/:id/approve', auth, allow('teacher', 'admin'), (req, res) => {
  const item = db.leaveRequests.find((r) => r.id === req.params.id);
  if (!item) return res.status(404).json({ message: 'Not found' });
  item.status = req.body.status || 'approved'; persist();
  res.json({ item });
});

app.listen(PORT, () => console.log(`LMS API running on http://localhost:${PORT}`));
