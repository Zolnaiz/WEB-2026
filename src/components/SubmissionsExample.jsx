import React, { useEffect, useState } from 'react';
import { getSubmissions } from '../services/submissionService';

export default function SubmissionsExample() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function loadSubmissions() {
      setLoading(true);
      setError('');

      try {
        const data = await getSubmissions({ page: 1, pageSize: 10 });
        setSubmissions(data?.items ?? []);
      } catch (requestError) {
        setError(requestError.message || 'Failed to load submissions.');
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadSubmissions();

    return () => controller.abort();
  }, []);

  if (loading) {
    return <p className="text-sm text-slate-600">Loading submissions...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  return (
    <ul className="space-y-2">
      {submissions.map((submission) => (
        <li key={submission.id} className="rounded-md border border-slate-200 bg-white p-3">
          <p className="font-medium">{submission.id}</p>
          <p className="text-sm text-slate-600">{submission.content || 'No content'}</p>
        </li>
      ))}
      {submissions.length === 0 ? <li className="text-sm text-slate-500">No submissions found.</li> : null}
    </ul>
  );
}
