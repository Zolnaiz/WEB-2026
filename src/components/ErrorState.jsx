import React from 'react';

export default function ErrorState({ message, onRetry }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4">
      <p className="text-sm text-red-700">{message || 'Something went wrong'}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-3 rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white">
          Retry
        </button>
      )}
    </div>
  );
}
