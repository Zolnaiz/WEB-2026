import React, { useState } from 'react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
import SubmissionMeta from '../../components/submissions/SubmissionMeta';

export default function SubmissionDetailPage({
  isLoading,
  error,
  submission,
  onRetry,
  onEdit,
  onDelete,
  isDeleting = false,
}) {
  const [showConfirm, setShowConfirm] = useState(false);

  if (isLoading) return <LoadingSpinner label="Loading submission…" />;

  if (error) {
    return (
      <ErrorState
        title="Unable to load submission"
        message={error.message ?? 'Please refresh and try again.'}
        onRetry={onRetry}
      />
    );
  }

  if (!submission) {
    return (
      <EmptyState
        title="Submission not found"
        description="The requested submission is unavailable or has been removed."
      />
    );
  }

  return (
    <article>
      <h1>{submission.title}</h1>
      <SubmissionMeta submission={submission} />
      <p>{submission.content}</p>
      <div>
        <button type="button" onClick={onEdit}>Edit</button>
        <button type="button" onClick={() => setShowConfirm(true)}>Delete</button>
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        title="Delete submission?"
        message="This action cannot be undone."
        confirmLabel="Delete"
        isConfirming={isDeleting}
        onCancel={() => setShowConfirm(false)}
        onConfirm={async () => {
          await onDelete(submission.id);
          setShowConfirm(false);
        }}
      />
    </article>
  );
}
