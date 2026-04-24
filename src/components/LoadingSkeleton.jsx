import React from 'react';

export default function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, index) => (
        <div key={index} className="animate-pulse rounded-xl border border-slate-200 bg-white p-4">
          <div className="h-4 w-40 rounded bg-slate-200" />
          <div className="mt-3 h-3 w-full rounded bg-slate-200" />
          <div className="mt-2 h-3 w-3/4 rounded bg-slate-200" />
        </div>
      ))}
    </div>
  );
}
