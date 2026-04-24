import React from 'react';

export default function SubmissionMeta({ submission }) {
  const isGroup = Boolean(submission?.is_group_assignment);
  const members = submission?.applied_group_members ?? [];

  return (
    <section className="submission-meta">
      <p>
        <strong>Assignment type:</strong> {isGroup ? 'Group assignment' : 'Individual assignment'}
      </p>

      {isGroup ? (
        <>
          <p className="submission-meta__group-note">This submission applies to all group members.</p>
          <div>
            <strong>Group members:</strong>
            {members.length > 0 ? (
              <ul>
                {members.map((member) => (
                  <li key={member.id ?? member.email ?? member.name}>{member.name ?? member.email}</li>
                ))}
              </ul>
            ) : (
              <p>No group members were provided.</p>
            )}
          </div>
        </>
      ) : null}
    </section>
  );
}
