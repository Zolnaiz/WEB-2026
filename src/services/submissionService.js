import { apiClient } from './apiClient';

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
  return apiClient.get(`${SUBMISSIONS_ENDPOINT}${toQueryString(params)}`);
}

export function getLessonSubmissions(course_id, lesson_id, options = {}) {
  return getSubmissions({ course_id, lesson_id, ...options });
}

export function getSubmission(id) {
  return apiClient.get(`${SUBMISSIONS_ENDPOINT}/${id}`);
}

export function createSubmission(data) {
  return apiClient.post(SUBMISSIONS_ENDPOINT, data);
}

export function updateSubmission(id, data) {
  return apiClient.put(`${SUBMISSIONS_ENDPOINT}/${id}`, data);
}

export function gradeSubmission(id, data) {
  return apiClient.post(`${SUBMISSIONS_ENDPOINT}/${id}/grade`, data);
}
