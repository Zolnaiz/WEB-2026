import React from 'react';

export default function EmptyState({
  title = 'No data yet',
  description = 'There is nothing to display right now.',
  action,
}) {
  return (
    <section className="empty-state" aria-live="polite">
      <h2>{title}</h2>
      <p>{description}</p>
      {action ?? null}
    </section>
  );
}
