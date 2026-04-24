import React, { useMemo, useState } from 'react';

const SUBMISSION_TYPES = [
  { value: 'text', label: 'Text only' },
  { value: 'image_url', label: 'Image URL' },
  { value: 'file_link', label: 'File link' },
  { value: 'youtube_url', label: 'YouTube URL' },
];

const URL_REQUIRED_TYPES = new Set(['image_url', 'file_link', 'youtube_url']);

const isValidUrl = (value) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

export default function SubmissionForm({ initialValues, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: initialValues?.title || '',
    content: initialValues?.content || '',
    type: initialValues?.type || 'text',
    resourceUrl: initialValues?.resourceUrl || '',
  });
  const [errors, setErrors] = useState({});
  const [showConfirmation, setShowConfirmation] = useState(false);

  const requiresUrl = useMemo(() => URL_REQUIRED_TYPES.has(formData.type), [formData.type]);

  const validate = () => {
    const nextErrors = {};

    if (!formData.content.trim()) {
      nextErrors.content = 'Content is required.';
    }

    if (requiresUrl) {
      if (!formData.resourceUrl.trim()) {
        nextErrors.resourceUrl = 'A URL is required for this submission type.';
      } else if (!isValidUrl(formData.resourceUrl.trim())) {
        nextErrors.resourceUrl = 'Please provide a valid URL (http or https).';
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleAttemptSubmit = (event) => {
    event.preventDefault();
    if (validate()) {
      setShowConfirmation(true);
    }
  };

  const handleConfirmSubmit = () => {
    setShowConfirmation(false);
    onSubmit?.({
      ...formData,
      title: formData.title.trim(),
      content: formData.content.trim(),
      resourceUrl: formData.resourceUrl.trim(),
    });
  };

  return (
    <>
      <form onSubmit={handleAttemptSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
        <div>
          <label htmlFor="submission-title" className="mb-1 block text-sm font-medium text-slate-700">
            Title (optional)
          </label>
          <input
            id="submission-title"
            type="text"
            value={formData.title}
            onChange={handleChange('title')}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="submission-content" className="mb-1 block text-sm font-medium text-slate-700">
            Content <span className="text-red-500">*</span>
          </label>
          <textarea
            id="submission-content"
            value={formData.content}
            onChange={handleChange('content')}
            rows={6}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
          {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content}</p>}
        </div>

        <div>
          <label htmlFor="submission-type" className="mb-1 block text-sm font-medium text-slate-700">
            Submission Type
          </label>
          <select
            id="submission-type"
            value={formData.type}
            onChange={handleChange('type')}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          >
            {SUBMISSION_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="submission-resource-url" className="mb-1 block text-sm font-medium text-slate-700">
            URL / Link {requiresUrl && <span className="text-red-500">*</span>}
          </label>
          <input
            id="submission-resource-url"
            type="url"
            value={formData.resourceUrl}
            onChange={handleChange('resourceUrl')}
            placeholder="https://"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
          {errors.resourceUrl && <p className="mt-1 text-sm text-red-600">{errors.resourceUrl}</p>}
        </div>

        <div className="flex flex-wrap justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            Review & Submit
          </button>
        </div>
      </form>

      {showConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-lg">
            <h3 className="text-lg font-semibold text-slate-900">Confirm submission</h3>
            <p className="mt-2 text-sm text-slate-600">Please confirm you want to submit this work.</p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowConfirmation(false)}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmit}
                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white"
              >
                Confirm Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
