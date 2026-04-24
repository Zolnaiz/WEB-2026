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

app.use((req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = (payload) => {
    if (payload && typeof payload === 'object' && Object.prototype.hasOwnProperty.call(payload, 'success')) {
      return originalJson(payload);
    }
    if (res.statusCode >= 400) {
      const message = payload?.message || 'Request failed';
      const data = payload && typeof payload === 'object' ? { ...payload } : undefined;
      if (data?.message) delete data.message;
      return originalJson({ success: false, message, ...(data && Object.keys(data).length ? { data } : {}) });
    }
    return originalJson({ success: true, data: payload ?? null });
  };
  next();
});

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

  const parsed = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  parsed.users ||= [];
  parsed.courses ||= [];
  parsed.lessons ||= [];
  parsed.groups ||= [];
  parsed.submissions ||= [];
  parsed.exams ||= [];
  parsed.examVariants ||= [];
  parsed.examQuestions ||= [];
  parsed.examAttempts ||= [];
  parsed.attendanceTypes ||= [];
  parsed.attendanceRecords ||= [];
  parsed.leaveRequests ||= [];
  return parsed;
}

let db = readData();
function persist() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
}
const genId = (prefix) => `${prefix}-${crypto.randomUUID().slice(0, 8)}`;

function signToken(payload) {
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 12;
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({ ...payload, exp })).toString('base64url');
  const sig = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

function verifyToken(token) {
  const [header, body, sig] = token.split('.');
  if (!header || !body || !sig) return null;
  const expected = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  if (sig !== expected) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8'));
    if (!payload?.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
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

const ROLES = ['admin', 'teacher', 'student'];
function sanitizeUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

function inCourseGroup(userId, courseId) {
  return db.groups.some((g) => g.courseId === courseId && g.userIds.includes(userId));
}

function findCourse(courseId) {
  return db.courses.find((course) => course.id === courseId);
}

function canAccessCourse(user, courseId) {
  const course = findCourse(courseId);
  if (!course) return false;
  if (user.role === 'admin') return true;
  if (user.role === 'teacher') return course.teacherId === user.id;
  return inCourseGroup(user.id, courseId);
}

function ensureTeacherOwnsCourse(req, res, courseId) {
  if (req.user.role === 'admin') return true;
  if (req.user.role === 'teacher' && canAccessCourse(req.user, courseId)) return true;
  res.status(403).json({ message: 'Forbidden' });
  return false;
}

app.get('/api/health', (_, res) => res.json({ ok: true }));

app.post('/api/auth/register', (req, res) => {
  const { name, email, password, role = 'student' } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'name, email, password are required' });
  if (!ROLES.includes(role)) return res.status(400).json({ message: 'Invalid role' });
  if (db.users.some((u) => u.email === email)) return res.status(400).json({ message: 'Email already exists' });

  const user = { id: genId('u'), name, email, password, role };
  db.users.push(user);
  persist();

  const token = signToken({ id: user.id, email: user.email, role: user.role, name: user.name });
  res.status(201).json({ token, user: sanitizeUser(user) });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'email and password are required' });
  const user = db.users.find((u) => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const token = signToken({ id: user.id, email: user.email, role: user.role, name: user.name });
  res.status(200).json({ token, user: sanitizeUser(user) });
});

app.post('/api/auth/logout', auth, (_req, res) => {
  res.status(200).json({ message: 'Logged out' });
});

app.get('/api/auth/me', auth, (req, res) => {
  const user = db.users.find((u) => u.id === req.user.id);
  if (!user) return res.status(401).json({ message: 'Unauthorized' });
  res.json({ user: sanitizeUser(user) });
});

app.get('/api/users', auth, allow('admin'), (_req, res) => res.json({ items: db.users.map(sanitizeUser) }));
app.get('/api/users/:id', auth, allow('admin'), (req, res) => {
  const user = db.users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ message: 'Not found' });
  res.json({ item: sanitizeUser(user) });
});
app.post('/api/users', auth, allow('admin'), (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) return res.status(400).json({ message: 'name, email, password, role are required' });
  if (!ROLES.includes(role)) return res.status(400).json({ message: 'Invalid role' });
  if (db.users.some((u) => u.email === email)) return res.status(400).json({ message: 'Email already exists' });
  const user = { id: genId('u'), name, email, password, role };
  db.users.push(user);
  persist();
  res.status(201).json({ item: sanitizeUser(user) });
});
app.put('/api/users/:id', auth, allow('admin'), (req, res) => {
  const idx = db.users.findIndex((u) => u.id === req.params.id);
  if (idx < 0) return res.status(404).json({ message: 'Not found' });
  const updated = { ...db.users[idx], ...req.body };
  if (updated.role && !ROLES.includes(updated.role)) return res.status(400).json({ message: 'Invalid role' });
  db.users[idx] = updated;
  persist();
  res.json({ item: sanitizeUser(updated) });
});
app.delete('/api/users/:id', auth, allow('admin'), (req, res) => {
  const idx = db.users.findIndex((u) => u.id === req.params.id);
  if (idx < 0) return res.status(404).json({ message: 'Not found' });
  db.users.splice(idx, 1);
  persist();
  res.status(200).json({ message: 'User deleted' });
});

app.get('/api/courses', auth, (req, res) => {
  let items = db.courses;
  if (req.user.role === 'teacher') items = items.filter((course) => course.teacherId === req.user.id);
  if (req.user.role === 'student') items = items.filter((course) => inCourseGroup(req.user.id, course.id));
  res.json({ items });
});

app.get('/api/courses/:id', auth, (req, res) => {
  const item = findCourse(req.params.id);
  if (!item) return res.status(404).json({ message: 'Not found' });
  if (!canAccessCourse(req.user, item.id)) return res.status(403).json({ message: 'Forbidden' });
  res.json({ item });
});

app.post('/api/courses', auth, allow('admin', 'teacher'), (req, res) => {
  const { title, description = '', teacherId } = req.body;
  if (!title) return res.status(400).json({ message: 'title is required' });
  const ownerId = req.user.role === 'teacher' ? req.user.id : teacherId;
  if (!ownerId) return res.status(400).json({ message: 'teacherId is required' });
  const teacher = db.users.find((u) => u.id === ownerId && u.role === 'teacher');
  if (!teacher) return res.status(400).json({ message: 'teacherId must belong to teacher' });
  const item = { id: genId('co'), title, description, teacherId: ownerId, groupIds: [], createdAt: new Date().toISOString() };
  db.courses.push(item);
  persist();
  res.status(201).json({ item });
});

app.put('/api/courses/:id', auth, allow('admin', 'teacher'), (req, res) => {
  const idx = db.courses.findIndex((course) => course.id === req.params.id);
  if (idx < 0) return res.status(404).json({ message: 'Not found' });
  if (!ensureTeacherOwnsCourse(req, res, db.courses[idx].id)) return;
  if (req.user.role === 'teacher' && req.body.teacherId && req.body.teacherId !== req.user.id) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  db.courses[idx] = { ...db.courses[idx], ...req.body };
  persist();
  res.json({ item: db.courses[idx] });
});

app.delete('/api/courses/:id', auth, allow('admin', 'teacher'), (req, res) => {
  const idx = db.courses.findIndex((course) => course.id === req.params.id);
  if (idx < 0) return res.status(404).json({ message: 'Not found' });
  if (!ensureTeacherOwnsCourse(req, res, db.courses[idx].id)) return;
  db.courses.splice(idx, 1);
  persist();
  res.status(200).json({ message: 'Course deleted' });
});

app.get('/api/lessons', auth, (req, res) => {
  const { courseId } = req.query;
  let items = db.lessons;
  if (courseId) items = items.filter((lesson) => lesson.courseId === courseId);
  items = items.filter((lesson) => canAccessCourse(req.user, lesson.courseId));
  res.json({ items });
});

app.post('/api/lessons', auth, allow('admin', 'teacher'), (req, res) => {
  const { courseId, title, type = 'assignment', parentId = null, content = '' } = req.body;
  if (!courseId || !title) return res.status(400).json({ message: 'courseId and title are required' });
  if (!findCourse(courseId)) return res.status(400).json({ message: 'Invalid courseId' });
  if (!ensureTeacherOwnsCourse(req, res, courseId)) return;
  if (parentId && !db.lessons.some((lesson) => lesson.id === parentId && lesson.courseId === courseId)) {
    return res.status(400).json({ message: 'Invalid parentId for this course' });
  }
  const item = { id: genId('le'), courseId, title, type, parentId, content };
  db.lessons.push(item);
  persist();
  res.status(201).json({ item });
});

app.put('/api/lessons/:id', auth, allow('admin', 'teacher'), (req, res) => {
  const idx = db.lessons.findIndex((lesson) => lesson.id === req.params.id);
  if (idx < 0) return res.status(404).json({ message: 'Not found' });
  if (!ensureTeacherOwnsCourse(req, res, db.lessons[idx].courseId)) return;
  db.lessons[idx] = { ...db.lessons[idx], ...req.body };
  persist();
  res.json({ item: db.lessons[idx] });
});

app.delete('/api/lessons/:id', auth, allow('admin', 'teacher'), (req, res) => {
  const idx = db.lessons.findIndex((lesson) => lesson.id === req.params.id);
  if (idx < 0) return res.status(404).json({ message: 'Not found' });
  if (!ensureTeacherOwnsCourse(req, res, db.lessons[idx].courseId)) return;
  db.lessons.splice(idx, 1);
  persist();
  res.status(200).json({ message: 'Lesson deleted' });
});

app.get('/api/groups', auth, (req, res) => {
  let items = db.groups;
  if (req.user.role === 'teacher') {
    const teacherCourseIds = db.courses.filter((course) => course.teacherId === req.user.id).map((course) => course.id);
    items = items.filter((group) => teacherCourseIds.includes(group.courseId));
  }
  if (req.user.role === 'student') items = items.filter((group) => group.userIds.includes(req.user.id));
  res.json({ items });
});

app.post('/api/groups', auth, allow('admin', 'teacher'), (req, res) => {
  const { courseId, name, userIds = [] } = req.body;
  if (!courseId || !name) return res.status(400).json({ message: 'courseId and name are required' });
  if (!ensureTeacherOwnsCourse(req, res, courseId)) return;
  const item = { id: genId('gr'), courseId, name, userIds: Array.isArray(userIds) ? userIds : [] };
  db.groups.push(item);
  persist();
  res.status(201).json({ item });
});

app.put('/api/groups/:id', auth, allow('admin', 'teacher'), (req, res) => {
  const idx = db.groups.findIndex((group) => group.id === req.params.id);
  if (idx < 0) return res.status(404).json({ message: 'Not found' });
  if (!ensureTeacherOwnsCourse(req, res, db.groups[idx].courseId)) return;
  db.groups[idx] = { ...db.groups[idx], ...req.body };
  persist();
  res.json({ item: db.groups[idx] });
});

app.delete('/api/groups/:id', auth, allow('admin', 'teacher'), (req, res) => {
  const idx = db.groups.findIndex((group) => group.id === req.params.id);
  if (idx < 0) return res.status(404).json({ message: 'Not found' });
  if (!ensureTeacherOwnsCourse(req, res, db.groups[idx].courseId)) return;
  db.groups.splice(idx, 1);
  persist();
  res.status(200).json({ message: 'Group deleted' });
});

app.get('/api/courses/:id/report', auth, allow('admin', 'teacher'), (req, res) => {
  const courseId = req.params.id;
  if (!findCourse(courseId)) return res.status(404).json({ message: 'Course not found' });
  if (!ensureTeacherOwnsCourse(req, res, courseId)) return;
  const report = {
    courseId,
    lessons: db.lessons.filter((lesson) => lesson.courseId === courseId).length,
    submissions: db.submissions.filter((submission) => submission.courseId === courseId).length,
    graded: db.submissions.filter((submission) => submission.courseId === courseId && submission.status === 'graded').length,
    students: new Set(db.groups.filter((group) => group.courseId === courseId).flatMap((group) => group.userIds)).size,
  };
  res.json({ item: report });
});

app.post('/api/groups/:id/users/:userId', auth, allow('admin', 'teacher'), (req, res) => {
  const group = db.groups.find((g) => g.id === req.params.id);
  if (!group) return res.status(404).json({ message: 'Group not found' });
  if (!ensureTeacherOwnsCourse(req, res, group.courseId)) return;
  if (!group.userIds.includes(req.params.userId)) group.userIds.push(req.params.userId);
  persist();
  res.json({ item: group });
});

app.delete('/api/groups/:id/users/:userId', auth, allow('admin', 'teacher'), (req, res) => {
  const group = db.groups.find((g) => g.id === req.params.id);
  if (!group) return res.status(404).json({ message: 'Group not found' });
  if (!ensureTeacherOwnsCourse(req, res, group.courseId)) return;
  group.userIds = group.userIds.filter((id) => id !== req.params.userId);
  persist();
  res.json({ item: group });
});

app.get('/api/submissions', auth, (req, res) => {
  const { courseId, lessonId } = req.query;
  let items = db.submissions.filter((submission) => (!courseId || submission.courseId === courseId) && (!lessonId || submission.lessonId === lessonId));

  if (req.user.role === 'teacher') {
    items = items.filter((submission) => canAccessCourse(req.user, submission.courseId));
  }

  if (req.user.role === 'student') {
    items = items.filter((submission) => submission.userId === req.user.id);
  }

  res.json({ items });
});

app.get('/api/submissions/:id', auth, (req, res) => {
  const item = db.submissions.find((submission) => submission.id === req.params.id);
  if (!item) return res.status(404).json({ message: 'Not found' });
  if (req.user.role === 'student' && item.userId !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
  if (req.user.role === 'teacher' && !canAccessCourse(req.user, item.courseId)) return res.status(403).json({ message: 'Forbidden' });
  res.json({ item });
});

app.post('/api/submissions', auth, allow('student', 'admin'), (req, res) => {
  const { courseId, lessonId, content = '', fileUrl = '' } = req.body;
  const safeContent = typeof content === 'string' ? content : '';
  const safeFileUrl = typeof fileUrl === 'string' ? fileUrl : '';
  if (!courseId || !lessonId) return res.status(400).json({ message: 'courseId and lessonId are required' });
  if (!db.lessons.some((lesson) => lesson.id === lessonId && lesson.courseId === courseId)) {
    return res.status(400).json({ message: 'lessonId must belong to courseId' });
  }
  if (!canAccessCourse(req.user, courseId)) return res.status(403).json({ message: 'Forbidden' });
  if (!safeContent.trim() && !safeFileUrl.trim()) return res.status(400).json({ message: 'content OR fileUrl is required' });

  const item = {
    id: genId('sb'),
    courseId,
    lessonId,
    userId: req.user.id,
    content: safeContent,
    fileUrl: safeFileUrl,
    status: 'submitted',
    grade: null,
    feedback: '',
    createdAt: new Date().toISOString(),
  };

  db.submissions.push(item);
  persist();
  res.status(201).json({ item });
});

app.put('/api/submissions/:id', auth, allow('student', 'admin'), (req, res) => {
  const item = db.submissions.find((submission) => submission.id === req.params.id);
  if (!item) return res.status(404).json({ message: 'Not found' });
  if (item.status === 'graded') return res.status(400).json({ message: 'Cannot edit graded submission' });
  if (item.status !== 'submitted') return res.status(400).json({ message: 'Only submitted records can be edited' });
  if (req.user.role === 'student' && item.userId !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

  const { content = '', fileUrl = '' } = req.body;
  const safeContent = typeof content === 'string' ? content : '';
  const safeFileUrl = typeof fileUrl === 'string' ? fileUrl : '';
  if (!safeContent.trim() && !safeFileUrl.trim()) return res.status(400).json({ message: 'content OR fileUrl is required' });

  item.content = safeContent;
  item.fileUrl = safeFileUrl;
  item.updatedAt = new Date().toISOString();
  persist();
  res.json({ item });
});

app.delete('/api/submissions/:id', auth, allow('student', 'admin'), (req, res) => {
  const idx = db.submissions.findIndex((submission) => submission.id === req.params.id);
  if (idx < 0) return res.status(404).json({ message: 'Not found' });
  const item = db.submissions[idx];
  if (req.user.role === 'student' && item.userId !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
  if (item.status === 'graded') return res.status(400).json({ message: 'Cannot delete graded submission' });
  if (req.user.role === 'student' && item.status !== 'submitted') return res.status(400).json({ message: 'Cannot delete after review' });
  db.submissions.splice(idx, 1);
  persist();
  res.status(200).json({ message: 'Submission deleted' });
});

app.post('/api/submissions/:id/grade', auth, allow('teacher', 'admin'), (req, res) => {
  const item = db.submissions.find((submission) => submission.id === req.params.id);
  if (!item) return res.status(404).json({ message: 'Not found' });
  if (!canAccessCourse(req.user, item.courseId)) return res.status(403).json({ message: 'Forbidden' });
  if (item.status !== 'submitted') return res.status(400).json({ message: 'Only submitted records can be graded' });

  const { grade, feedback = '', status = 'graded' } = req.body;
  if (!['graded', 'rejected'].includes(status)) return res.status(400).json({ message: 'Invalid status' });
  if (status === 'graded' && (Number.isNaN(Number(grade)) || Number(grade) < 0 || Number(grade) > 100)) {
    return res.status(400).json({ message: 'grade must be a number from 0 to 100' });
  }

  item.grade = status === 'graded' ? Number(grade) : null;
  item.feedback = feedback;
  item.status = status;
  item.gradedBy = req.user.id;
  item.gradedAt = new Date().toISOString();
  persist();
  res.json({ item });
});

app.get('/api/exams', auth, (req, res) => {
  let items = db.exams;
  if (req.user.role !== 'admin') items = items.filter((exam) => canAccessCourse(req.user, exam.courseId));
  res.json({ items });
});

app.post('/api/exams', auth, allow('admin', 'teacher'), (req, res) => {
  const { courseId, title, durationMinutes = 30 } = req.body;
  if (!courseId || !title) return res.status(400).json({ message: 'courseId and title are required' });
  if (!ensureTeacherOwnsCourse(req, res, courseId)) return;
  const item = { id: genId('ex'), courseId, title, durationMinutes: Number(durationMinutes) || 30 };
  db.exams.push(item);
  persist();
  res.status(201).json({ item });
});

app.put('/api/exams/:id', auth, allow('admin', 'teacher'), (req, res) => {
  const idx = db.exams.findIndex((exam) => exam.id === req.params.id);
  if (idx < 0) return res.status(404).json({ message: 'Not found' });
  if (!ensureTeacherOwnsCourse(req, res, db.exams[idx].courseId)) return;
  db.exams[idx] = { ...db.exams[idx], ...req.body };
  persist();
  res.json({ item: db.exams[idx] });
});

app.delete('/api/exams/:id', auth, allow('admin', 'teacher'), (req, res) => {
  const idx = db.exams.findIndex((exam) => exam.id === req.params.id);
  if (idx < 0) return res.status(404).json({ message: 'Not found' });
  if (!ensureTeacherOwnsCourse(req, res, db.exams[idx].courseId)) return;
  db.exams.splice(idx, 1);
  persist();
  res.status(200).json({ message: 'Exam deleted' });
});

app.get('/api/exam-variants', auth, (req, res) => {
  let items = db.examVariants;
  if (req.query.examId) items = items.filter((variant) => variant.examId === req.query.examId);
  items = items.filter((variant) => {
    const exam = db.exams.find((entry) => entry.id === variant.examId);
    return exam && canAccessCourse(req.user, exam.courseId);
  });
  res.json({ items });
});

app.post('/api/exam-variants', auth, allow('admin', 'teacher'), (req, res) => {
  const { examId, title } = req.body;
  const exam = db.exams.find((entry) => entry.id === examId);
  if (!exam || !title) return res.status(400).json({ message: 'examId and title are required' });
  if (!ensureTeacherOwnsCourse(req, res, exam.courseId)) return;
  const item = { id: genId('va'), examId, title };
  db.examVariants.push(item);
  persist();
  res.status(201).json({ item });
});

app.post('/api/exam-questions', auth, allow('admin', 'teacher'), (req, res) => {
  const { variantId, text, options, correctAnswer } = req.body;
  const variant = db.examVariants.find((entry) => entry.id === variantId);
  if (!variant || !text || !Array.isArray(options) || options.length < 2 || !correctAnswer) {
    return res.status(400).json({ message: 'variantId, text, options(>=2), correctAnswer are required' });
  }
  const exam = db.exams.find((entry) => entry.id === variant.examId);
  if (!exam) return res.status(400).json({ message: 'Invalid variantId' });
  if (!ensureTeacherOwnsCourse(req, res, exam.courseId)) return;
  const item = { id: genId('qu'), variantId, text, options, correctAnswer };
  db.examQuestions.push(item);
  persist();
  res.status(201).json({ item });
});

app.get('/api/exam-questions', auth, (req, res) => {
  let items = db.examQuestions;
  if (req.query.variantId) items = items.filter((q) => q.variantId === req.query.variantId);
  items = items.filter((question) => {
    const variant = db.examVariants.find((entry) => entry.id === question.variantId);
    if (!variant) return false;
    const exam = db.exams.find((entry) => entry.id === variant.examId);
    return exam && canAccessCourse(req.user, exam.courseId);
  });
  res.json({ items });
});

app.post('/api/exams/:examId/start', auth, allow('student'), (req, res) => {
  const exam = db.exams.find((entry) => entry.id === req.params.examId);
  if (!exam) return res.status(404).json({ message: 'Exam not found' });
  if (!canAccessCourse(req.user, exam.courseId)) return res.status(403).json({ message: 'Forbidden' });

  const variant = db.examVariants.find((entry) => entry.examId === exam.id);
  if (!variant) return res.status(404).json({ message: 'No variant' });
  const ongoingAttempt = db.examAttempts.find((entry) => entry.examId === exam.id && entry.userId === req.user.id && entry.status === 'started');
  if (ongoingAttempt) return res.status(409).json({ message: 'Exam already started', attemptId: ongoingAttempt.id });

  const attempt = {
    id: genId('atp'),
    examId: exam.id,
    userId: req.user.id,
    variantId: variant.id,
    answers: {},
    status: 'started',
    score: null,
    startedAt: new Date().toISOString(),
    finishedAt: null,
  };

  db.examAttempts.push(attempt);
  persist();
  res.status(201).json({ item: attempt });
});

app.get('/api/exam-attempts/:id/questions', auth, (req, res) => {
  const attempt = db.examAttempts.find((entry) => entry.id === req.params.id && (req.user.role !== 'student' || entry.userId === req.user.id));
  if (!attempt) return res.status(404).json({ message: 'Attempt not found' });
  const exam = db.exams.find((entry) => entry.id === attempt.examId);
  if (!exam || !canAccessCourse(req.user, exam.courseId)) return res.status(403).json({ message: 'Forbidden' });
  if (attempt.status !== 'started') return res.status(400).json({ message: 'Attempt already finished' });
  const startedAtMs = new Date(attempt.startedAt).getTime();
  const expiresAt = startedAtMs + ((Number(exam?.durationMinutes) || 30) * 60 * 1000);
  if (Date.now() > expiresAt) {
    attempt.status = 'finished';
    attempt.score = 0;
    attempt.finishedAt = new Date().toISOString();
    persist();
    return res.status(400).json({ message: 'Exam attempt has expired' });
  }
  const items = db.examQuestions
    .filter((q) => q.variantId === attempt.variantId)
    .map((q) => ({ id: q.id, text: q.text, options: q.options }));
  res.json({ items });
});

app.post('/api/exam-attempts/:id/answers', auth, allow('student'), (req, res) => {
  const attempt = db.examAttempts.find((entry) => entry.id === req.params.id && entry.userId === req.user.id);
  if (!attempt) return res.status(404).json({ message: 'Attempt not found' });
  if (attempt.status !== 'started') return res.status(400).json({ message: 'Attempt already finished' });
  const exam = db.exams.find((entry) => entry.id === attempt.examId);
  const expiresAt = new Date(attempt.startedAt).getTime() + ((Number(exam?.durationMinutes) || 30) * 60 * 1000);
  if (Date.now() > expiresAt) return res.status(400).json({ message: 'Exam attempt has expired' });

  const answers = req.body.answers || {};
  attempt.answers = { ...attempt.answers, ...answers };
  persist();
  res.json({ item: attempt });
});

app.post('/api/exam-attempts/:id/finish', auth, allow('student'), (req, res) => {
  const attempt = db.examAttempts.find((entry) => entry.id === req.params.id && entry.userId === req.user.id);
  if (!attempt) return res.status(404).json({ message: 'Attempt not found' });
  if (attempt.status !== 'started') return res.status(400).json({ message: 'Attempt already finished' });
  const exam = db.exams.find((entry) => entry.id === attempt.examId);
  const expiresAt = new Date(attempt.startedAt).getTime() + ((Number(exam?.durationMinutes) || 30) * 60 * 1000);
  if (Date.now() > expiresAt) return res.status(400).json({ message: 'Exam attempt has expired' });

  const qs = db.examQuestions.filter((q) => q.variantId === attempt.variantId);
  const correct = qs.filter((q) => attempt.answers[q.id] === q.correctAnswer).length;
  attempt.score = qs.length ? Math.round((correct / qs.length) * 100) : 0;
  attempt.status = 'finished';
  attempt.finishedAt = new Date().toISOString();
  persist();
  res.json({ item: attempt });
});

app.post('/api/exam-attempts/:id/submit', auth, allow('student'), (req, res) => {
  const attempt = db.examAttempts.find((entry) => entry.id === req.params.id && entry.userId === req.user.id);
  if (!attempt) return res.status(404).json({ message: 'Attempt not found' });
  if (attempt.status !== 'started') return res.status(400).json({ message: 'Attempt already finished' });
  const exam = db.exams.find((entry) => entry.id === attempt.examId);
  const expiresAt = new Date(attempt.startedAt).getTime() + ((Number(exam?.durationMinutes) || 30) * 60 * 1000);
  if (Date.now() > expiresAt) return res.status(400).json({ message: 'Exam attempt has expired' });

  attempt.answers = req.body.answers || {};
  const qs = db.examQuestions.filter((q) => q.variantId === attempt.variantId);
  const correct = qs.filter((q) => attempt.answers[q.id] === q.correctAnswer).length;
  attempt.score = qs.length ? Math.round((correct / qs.length) * 100) : 0;
  attempt.status = 'finished';
  attempt.finishedAt = new Date().toISOString();
  persist();
  res.json({ item: attempt });
});

app.get('/api/exam-attempts/:id/result', auth, (req, res) => {
  const attempt = db.examAttempts.find((entry) => entry.id === req.params.id && (req.user.role !== 'student' || entry.userId === req.user.id));
  if (!attempt) return res.status(404).json({ message: 'Attempt not found' });
  const exam = db.exams.find((entry) => entry.id === attempt.examId);
  if (!exam || !canAccessCourse(req.user, exam.courseId)) return res.status(403).json({ message: 'Forbidden' });
  res.json({ item: attempt });
});

app.get('/api/attendance-types', auth, (req, res) => {
  res.json({ items: db.attendanceTypes });
});

app.post('/api/attendance-types', auth, allow('admin'), (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: 'name is required' });
  const item = { id: genId('at'), name };
  db.attendanceTypes.push(item);
  persist();
  res.status(201).json({ item });
});

app.get('/api/attendance', auth, (req, res) => {
  let items = db.attendanceRecords;
  if (req.user.role === 'student') items = items.filter((record) => record.userId === req.user.id);
  if (req.user.role === 'teacher') {
    items = items.filter((record) => canAccessCourse(req.user, record.courseId));
  }
  res.json({ items });
});

app.post('/api/attendance', auth, allow('teacher', 'admin'), (req, res) => {
  const { userId, courseId, date, type } = req.body;
  if (!userId || !courseId || !date || !type) return res.status(400).json({ message: 'userId, courseId, date, type are required' });
  if (!ensureTeacherOwnsCourse(req, res, courseId)) return;

  const item = { id: genId('ar'), userId, courseId, date, type, markedBy: req.user.id };
  db.attendanceRecords.push(item);
  persist();
  res.status(201).json({ item });
});

app.get('/api/leave-requests', auth, (req, res) => {
  let items = db.leaveRequests;
  if (req.user.role === 'student') items = items.filter((request) => request.userId === req.user.id);
  if (req.user.role === 'teacher') items = items.filter((request) => canAccessCourse(req.user, request.courseId));
  res.json({ items });
});

app.post('/api/leave-requests', auth, allow('student'), (req, res) => {
  const { reason, date, courseId } = req.body;
  if (!reason || !date || !courseId) return res.status(400).json({ message: 'reason, date, courseId are required' });
  if (!canAccessCourse(req.user, courseId)) return res.status(403).json({ message: 'Forbidden' });
  if (db.leaveRequests.some((request) => request.userId === req.user.id && request.courseId === courseId && request.date === date && request.status === 'pending')) {
    return res.status(409).json({ message: 'Duplicate leave request for this session' });
  }

  const item = { id: genId('lr'), userId: req.user.id, reason, date, courseId, status: 'pending' };
  db.leaveRequests.push(item);
  persist();
  res.status(201).json({ item });
});

app.post('/api/leave-requests/:id/approve', auth, allow('teacher', 'admin'), (req, res) => {
  const item = db.leaveRequests.find((request) => request.id === req.params.id);
  if (!item) return res.status(404).json({ message: 'Not found' });
  if (!ensureTeacherOwnsCourse(req, res, item.courseId)) return;
  if (item.status !== 'pending') return res.status(400).json({ message: 'Only pending requests can be updated' });

  const status = req.body.status || 'approved';
  if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ message: 'status must be approved or rejected' });
  item.status = status;
  item.reviewedBy = req.user.id;
  persist();
  res.json({ item });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: 'Server error' });
});

app.listen(PORT, () => console.log(`LMS API running on http://localhost:${PORT}`));
