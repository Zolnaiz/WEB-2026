const BASE_URL = '/api/submissions';

async function handleResponse(response) {
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message || 'Request failed');
  }
  return response.json();
}

export async function getSubmissions(params = {}) {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(query ? `${BASE_URL}?${query}` : BASE_URL);
  return handleResponse(response);
}

export async function getSubmissionById(id) {
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
