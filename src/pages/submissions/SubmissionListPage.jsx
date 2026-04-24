import React from 'react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';

export default function SubmissionListPage({
  isLoading,
  error,
  submissions,
  onRetry,
  onCreate,
  onSelect,
}) {
  if (isLoading) return <LoadingSpinner label="Loading submissions…" />;

  if (error) {
    return (
      <ErrorState
        title="Unable to load submissions"
        message={error.message ?? 'Please refresh and try again.'}
        onRetry={onRetry}
      />
    );
  }

  if (!submissions || submissions.length === 0) {
    return (
      <EmptyState
        title="No submissions found"
        description="Create your first submission to get started."
        action={
          <button type="button" onClick={onCreate}>
            Create submission
          </button>
        }
      />
    );
  }

  return (
    <section>
      <h1>Submissions</h1>
      <ul>
        {submissions.map((submission) => (
          <li key={submission.id}>
            <button type="button" onClick={() => onSelect(submission.id)}>
              {submission.title}
            </button>
            <small>
              {submission.is_group_assignment ? 'Group assignment' : 'Individual assignment'}
            </small>
          </li>
        ))}
      </ul>
    </section>
  );
}
