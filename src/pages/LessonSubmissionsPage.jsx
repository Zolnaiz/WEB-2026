import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import LoadingSkeleton from '../components/LoadingSkeleton';
import SubmissionCard from '../components/SubmissionCard';
import { useSubmissions } from '../hooks/useSubmissions';

export default function LessonSubmissionsPage() {
  const { course_id, lesson_id } = useParams();
  const { user } = useAuth();

  const params = { course_id, lesson_id, sort: 'desc' };
  if (user.role === 'student') params.user_id = user.id;

  const { items, loading, error, refetch } = useSubmissions(params);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Lesson Submissions</h2>
          <p className="text-sm text-slate-500">{lesson_id} in {course_id}</p>
        </div>
        {(user.role === 'student' || user.role === 'admin') && (
          <Link className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white" to={`/courses/${course_id}/lessons/${lesson_id}/submissions/create`}>
            New Submission
          </Link>
        )}
      </div>

      {loading && <LoadingSkeleton />}
      {!loading && error && <ErrorState message={error} onRetry={refetch} />}
      {!loading && !error && items.length === 0 && <EmptyState />}
      {!loading && !error && items.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <SubmissionCard key={item.id} submission={item} />
          ))}
        </div>
      )}
    </section>
  );
}
