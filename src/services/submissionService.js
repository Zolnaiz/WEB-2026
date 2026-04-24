import { api } from './apiClient';

const SUBMISSIONS_ENDPOINT = import.meta.env.VITE_SUBMISSIONS_ENDPOINT || '/submissions';

function toQueryString(params = {}) {
  const cleaned = Object.entries(params).reduce((acc, [key, value]) => {
    if (value === undefined || value === null || value === '') return acc;
    acc[key] = value;
    return acc;
  }, {});

  const query = new URLSearchParams(cleaned).toString();
  return query ? `?${query}` : '';
}

export function getSubmissions(params = {}) {
  return api.get(`${SUBMISSIONS_ENDPOINT}${toQueryString(params)}`);
}

export function getLessonSubmissions(course_id, lesson_id, options = {}) {
  return getSubmissions({ courseId: course_id, lessonId: lesson_id, ...options });
}

export function getSubmission(id) {
  return api.get(`${SUBMISSIONS_ENDPOINT}/${id}`);
}

export function createSubmission(data) {
  const normalized = {
    ...data,
    courseId: data.courseId ?? data.course_id,
    lessonId: data.lessonId ?? data.lesson_id,
    fileUrl: data.fileUrl ?? data.file_url,
  };
  return api.post(SUBMISSIONS_ENDPOINT, normalized);
}

export function updateSubmission(id, data) {
  const normalized = { ...data, fileUrl: data.fileUrl ?? data.file_url };
  return api.put(`${SUBMISSIONS_ENDPOINT}/${id}`, normalized);
}

export function gradeSubmission(id, data) {
  return api.post(`${SUBMISSIONS_ENDPOINT}/${id}/grade`, data);
}
