import React from 'react';

export default function EmptyState({ message = 'No submissions found.' }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}
