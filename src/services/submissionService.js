const BASE_URL = process.env.API_BASE_URL || '';

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

const SUBMISSION_FIELDS = [
  'id',
  'lesson_id',
  'user_id',
  'content',
  'grade_point',
  'status',
  'created_at',
  'updated_at',
];

function toSnakeCase(value) {
  return value.replace(/[A-Z]/g, (match) => `_${match.toLowerCase()}`);
}

function normalizeSubmission(raw) {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const normalized = {};

  SUBMISSION_FIELDS.forEach((field) => {
    const camelKey = field.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    normalized[field] = raw[field] ?? raw[camelKey] ?? null;
  });

  return normalized;
}

function buildQuery(params = {}) {
  if (!params || typeof params !== 'object') {
    return '';
  }

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    const paramKey = key.includes('_') ? key : toSnakeCase(key);
    searchParams.append(paramKey, String(value));
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

async function parseResponse(response) {
  const rawBody = await response.text();
  let data = null;

  if (rawBody) {
    try {
      data = JSON.parse(rawBody);
    } catch (error) {
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}: ${response.statusText}`);
      }
      throw new Error('Invalid JSON received from server.');
    }
  }

  if (!response.ok) {
    const errorMessage =
      (data && (data.message || data.error)) ||
      `Request failed with status ${response.status}: ${response.statusText}`;
    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...DEFAULT_HEADERS,
      ...(options.headers || {}),
    },
  });

  return parseResponse(response);
}

export async function getSubmissions(params = {}) {
  const query = buildQuery(params);
  const data = await request(`/submissions${query}`, {
    method: 'GET',
  });

  const submissions = Array.isArray(data)
    ? data
    : Array.isArray(data?.submissions)
      ? data.submissions
      : [];

  return submissions.map(normalizeSubmission).filter(Boolean);
}

export async function getSubmissionById(id) {
  const data = await request(`/submissions/${id}`, {
    method: 'GET',
  });

  const submission = data?.submission || data;
  return normalizeSubmission(submission);
}

export async function createSubmission(payload) {
  const data = await request('/submissions', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  const submission = data?.submission || data;
  return normalizeSubmission(submission);
}

export async function updateSubmission(id, payload) {
  const data = await request(`/submissions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

  const submission = data?.submission || data;
  return normalizeSubmission(submission);
}
