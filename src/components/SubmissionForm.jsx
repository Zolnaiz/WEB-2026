import React, { useMemo, useState } from 'react';
import { validateSubmissionForm } from '../utils/validation';

const DEFAULT_VALUES = {
  content: '',
  image_url: '',
  file_url: '',
  video_url: '',
  group_id: '',
};

function getYoutubeEmbedUrl(url) {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtu.be')) {
      return `https://www.youtube.com/embed/${parsed.pathname.slice(1)}`;
    }
    const videoId = parsed.searchParams.get('v');
    if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    return '';
  } catch {
    return '';
  }
}

export default function SubmissionForm({ initialValues, onSubmit, isSubmitting, submitLabel = 'Submit' }) {
  const [values, setValues] = useState({ ...DEFAULT_VALUES, ...initialValues });
  const [errors, setErrors] = useState({});

  const youtubeEmbedUrl = useMemo(() => getYoutubeEmbedUrl(values.video_url), [values.video_url]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '', form: '' }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = validateSubmissionForm(values);

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    const confirmed = window.confirm('Confirm submission? You can edit it only before grading.');
    if (!confirmed) return;

    onSubmit(values);
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {errors.form && <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{errors.form}</p>}

      <div>
        <label className="mb-1 block text-sm font-medium">Answer Text</label>
        <textarea
          name="content"
          value={values.content}
          onChange={handleChange}
          className="h-32 w-full rounded-xl border border-slate-300 p-3 text-sm shadow-sm"
          placeholder="Write your explanation or answer..."
        />
        {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content}</p>}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Image URL</label>
          <input type="url" name="image_url" value={values.image_url} onChange={handleChange} className="w-full rounded-xl border border-slate-300 p-2.5 text-sm shadow-sm" />
          {errors.image_url && <p className="mt-1 text-sm text-red-600">{errors.image_url}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">File URL</label>
          <input type="url" name="file_url" value={values.file_url} onChange={handleChange} className="w-full rounded-xl border border-slate-300 p-2.5 text-sm shadow-sm" />
          {errors.file_url && <p className="mt-1 text-sm text-red-600">{errors.file_url}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">YouTube URL</label>
          <input type="url" name="video_url" value={values.video_url} onChange={handleChange} className="w-full rounded-xl border border-slate-300 p-2.5 text-sm shadow-sm" />
          {errors.video_url && <p className="mt-1 text-sm text-red-600">{errors.video_url}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Group ID (optional)</label>
          <input name="group_id" value={values.group_id} onChange={handleChange} className="w-full rounded-xl border border-slate-300 p-2.5 text-sm shadow-sm" placeholder="e.g. group-1" />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <h4 className="text-sm font-semibold text-slate-700">Live Preview</h4>
        <p className="mt-1 text-sm text-slate-600">Preview image and video embeds before sending.</p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {values.image_url && (
            <img src={values.image_url} alt="submission preview" className="h-40 w-full rounded-lg object-cover" />
          )}
          {youtubeEmbedUrl && (
            <iframe
              className="h-40 w-full rounded-lg"
              src={youtubeEmbedUrl}
              title="YouTube preview"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
          {!values.image_url && !youtubeEmbedUrl && <p className="text-sm text-slate-500">No media preview available yet.</p>}
        </div>
      </div>

      <button disabled={isSubmitting} type="submit" className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm disabled:opacity-60">
        {isSubmitting ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
}
