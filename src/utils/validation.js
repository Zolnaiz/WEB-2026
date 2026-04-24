export function isValidUrl(value) {
  if (!value) return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function validateSubmissionForm(payload) {
  const errors = {};
  if (!payload.content?.trim()) {
    errors.content = 'Content is required';
  }
  if (!isValidUrl(payload.file_url)) {
    errors.file_url = 'File URL must be a valid URL';
  }
  if (!isValidUrl(payload.video_url)) {
    errors.video_url = 'Video URL must be a valid URL';
  }
  return errors;
}

export function validateGradeForm(payload) {
  const errors = {};
  const grade = Number(payload.grade_point);

  if (Number.isNaN(grade)) {
    errors.grade_point = 'Grade is required';
  } else if (grade < 0 || grade > 100) {
    errors.grade_point = 'Grade must be between 0 and 100';
  }

  return errors;
}
