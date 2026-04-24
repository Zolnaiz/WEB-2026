import React from 'react';

export default function LoadingSpinner({ label = 'Loading…', inline = false }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={inline ? 'loading-spinner loading-spinner--inline' : 'loading-spinner'}
    >
      <span className="loading-spinner__icon" aria-hidden="true">⏳</span>
      <span className="loading-spinner__label">{label}</span>
    </div>
  );
}
