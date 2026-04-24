import React from 'react';

export default function ErrorState({
  title = 'Something went wrong',
  message = 'Please try again.',
  onRetry,
  retryLabel = 'Retry',
}) {
  return (
    <section className="error-state" role="alert" aria-live="assertive">
      <h2>{title}</h2>
      <p>{message}</p>
      {onRetry ? (
        <button type="button" onClick={onRetry}>
          {retryLabel}
        </button>
      ) : null}
    </section>
  );
}
