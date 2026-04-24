import React, { useState } from 'react';
import { validateSubmissionForm } from '../utils/validation';

const DEFAULT_VALUES = {
  content: '',
  file_url: '',
  video_url: '',
};

export default function SubmissionForm({ initialValues, onSubmit, isSubmitting }) {
  const [values, setValues] = useState({ ...DEFAULT_VALUES, ...initialValues });
  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = validateSubmissionForm(values);

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    onSubmit(values);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="mb-1 block text-sm font-medium">Content</label>
        <textarea
          name="content"
          value={values.content}
          onChange={handleChange}
          className="h-32 w-full rounded-md border border-slate-300 p-3 text-sm"
        />
        {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">File URL</label>
        <input
          type="url"
          name="file_url"
          value={values.file_url}
          onChange={handleChange}
          className="w-full rounded-md border border-slate-300 p-2.5 text-sm"
        />
        {errors.file_url && <p className="mt-1 text-sm text-red-600">{errors.file_url}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Video URL</label>
        <input
          type="url"
          name="video_url"
          value={values.video_url}
          onChange={handleChange}
          className="w-full rounded-md border border-slate-300 p-2.5 text-sm"
        />
        {errors.video_url && <p className="mt-1 text-sm text-red-600">{errors.video_url}</p>}
      </div>

      <button
        disabled={isSubmitting}
        type="submit"
        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {isSubmitting ? 'Saving...' : 'Submit'}
      </button>
    </form>
  );
}
