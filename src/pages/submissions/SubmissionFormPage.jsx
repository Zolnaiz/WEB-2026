import React, { useMemo, useState } from 'react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import SubmissionMeta from '../../components/submissions/SubmissionMeta';
import { validateSubmission } from '../../utils/submissionValidation';

const DEFAULT_FORM = {
  content: '',
  grade: '',
  attachmentUrl: '',
  attachmentType: 'file',
};

export default function SubmissionFormPage({
  initialSubmission,
  isLoading,
  error,
  isSaving,
  onRetry,
  onSubmit,
}) {
  const [form, setForm] = useState(() => ({
    ...DEFAULT_FORM,
    ...initialSubmission,
  }));
  const [errors, setErrors] = useState({});

  const isGroupAssignment = useMemo(
    () => Boolean(form.is_group_assignment || initialSubmission?.is_group_assignment),
    [form.is_group_assignment, initialSubmission?.is_group_assignment],
  );

  if (isLoading) return <LoadingSpinner label="Loading form…" />;

  if (error) {
    return (
      <ErrorState
        title="Unable to load submission form"
        message={error.message ?? 'Please refresh and try again.'}
        onRetry={onRetry}
      />
    );
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateSubmission(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    await onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h1>{form.id ? 'Edit submission' : 'New submission'}</h1>

      <SubmissionMeta submission={form} />

      {isGroupAssignment ? (
        <p className="form-info">This submission applies to all group members.</p>
      ) : null}

      <label htmlFor="content">Content</label>
      <textarea
        id="content"
        name="content"
        value={form.content}
        onChange={handleChange}
        aria-invalid={Boolean(errors.content)}
      />
      {errors.content ? <p role="alert">{errors.content}</p> : null}

      <label htmlFor="grade">Grade (0-100)</label>
      <input
        id="grade"
        name="grade"
        type="number"
        min="0"
        max="100"
        step="1"
        value={form.grade}
        onChange={handleChange}
        aria-invalid={Boolean(errors.grade)}
      />
      {errors.grade ? <p role="alert">{errors.grade}</p> : null}

      <label htmlFor="attachmentType">Attachment type</label>
      <select id="attachmentType" name="attachmentType" value={form.attachmentType} onChange={handleChange}>
        <option value="file">File</option>
        <option value="image">Image</option>
        <option value="youtube">YouTube</option>
      </select>

      <label htmlFor="attachmentUrl">Attachment URL</label>
      <input
        id="attachmentUrl"
        name="attachmentUrl"
        type="url"
        placeholder="https://"
        value={form.attachmentUrl}
        onChange={handleChange}
        aria-invalid={Boolean(errors.attachmentUrl)}
      />
      {errors.attachmentUrl ? <p role="alert">{errors.attachmentUrl}</p> : null}

      <button type="submit" disabled={isSaving}>
        {isSaving ? 'Saving…' : 'Save submission'}
      </button>
    </form>
  );
}
