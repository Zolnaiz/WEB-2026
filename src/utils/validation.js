export function isValidUrl(value) {
  if (!value) return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function isValidYouTubeUrl(url) {
  if (!url) return true;
  if (!isValidUrl(url)) return false;
  try {
    const parsed = new URL(url);
    return parsed.hostname.includes('youtube.com') || parsed.hostname.includes('youtu.be');
  } catch {
    return false;
  }
}

export function validateSubmissionForm(payload) {
  const errors = {};
  const hasAsset = [payload.content?.trim(), payload.file_url?.trim(), payload.video_url?.trim(), payload.image_url?.trim()].some(Boolean);

  if (!payload.content?.trim()) {
    errors.content = 'Content is required';
  }

  if (!hasAsset) {
    errors.form = 'At least one of text, image, file, or video is required';
  }

  if (!isValidUrl(payload.image_url)) {
    errors.image_url = 'Image URL must be a valid URL';
  }

  if (!isValidUrl(payload.file_url)) {
    errors.file_url = 'File URL must be a valid URL';
  }

  if (!isValidYouTubeUrl(payload.video_url)) {
    errors.video_url = 'Video URL must be a valid YouTube link';
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
