import React from 'react';
import SubmissionsExample from '../components/SubmissionsExample';

export default function SubmissionsExamplePage() {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">Submissions API Example</h2>
      <p className="text-sm text-slate-500">
        Example component using the submission service to fetch and display submissions.
      </p>
      <SubmissionsExample />
    </section>
  );
}
