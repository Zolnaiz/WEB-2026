import React from 'react';
import { getStatusBadgeClass } from '../utils/submissionAccess';

export default function StatusBadge({ status }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${getStatusBadgeClass(status)}`}>
      {status || 'pending'}
    </span>
  );
}
