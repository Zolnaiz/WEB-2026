const URL_PATTERNS = {
  image: /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i,
  file: /\.(pdf|docx?|pptx?|xlsx?|zip|txt|md)(\?.*)?$/i,
  youtube: /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{6,}/i,
};

export function isValidHttpUrl(rawValue) {
  try {
    const parsed = new URL(rawValue);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function validateAttachmentUrl(url, linkType) {
  if (!url) return null;
  if (!isValidHttpUrl(url)) return 'Attachment URL must be a valid http(s) URL.';

  if (linkType && URL_PATTERNS[linkType] && !URL_PATTERNS[linkType].test(url)) {
    if (linkType === 'youtube') return 'Attachment URL must be a valid YouTube link.';
    if (linkType === 'image') return 'Attachment URL must be a valid image link.';
    if (linkType === 'file') return 'Attachment URL must be a valid file link.';
  }

  return null;
}

export function validateSubmission(payload) {
  const errors = {};

  if (!payload?.content || payload.content.trim().length === 0) {
    errors.content = 'Submission content cannot be empty.';
  }

  if (payload?.grade !== undefined && payload.grade !== null && payload.grade !== '') {
    const numericGrade = Number(payload.grade);
    if (Number.isNaN(numericGrade) || numericGrade < 0 || numericGrade > 100) {
      errors.grade = 'Grade must be a number from 0 to 100.';
    }
  }

  const urlError = validateAttachmentUrl(payload?.attachmentUrl, payload?.attachmentType);
  if (urlError) {
    errors.attachmentUrl = urlError;
  }

  return errors;
}
