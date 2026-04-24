const BASE_URL = '/api/submissions';

async function handleResponse(response) {
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const message = payload.message || 'Request failed';
    const error = new Error(message);
    error.details = payload.errors || {};
    throw error;
  }
  return response.json();
}

export async function getSubmissions(course_id, options = {}) {
  const query = new URLSearchParams({ course_id, ...options }).toString();
  const response = await fetch(query ? `${BASE_URL}?${query}` : BASE_URL);
  return handleResponse(response);
}

export async function getLessonSubmissions(course_id, lesson_id, options = {}) {
  return getSubmissions(course_id, { lesson_id, ...options });
}

export async function getSubmission(id) {
  const response = await fetch(`${BASE_URL}/${id}`);
  return handleResponse(response);
}

export async function createSubmission(data) {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function updateSubmission(id, data) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function gradeSubmission(id, data) {
  const response = await fetch(`${BASE_URL}/${id}/grade`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}
