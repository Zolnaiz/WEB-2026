import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import LoadingSkeleton from '../components/LoadingSkeleton';
import SubmissionCard from '../components/SubmissionCard';
import { useSubmissions } from '../hooks/useSubmissions';

export default function CourseSubmissionsPage() {
  const { course_id } = useParams();
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [student, setStudent] = useState('');
  const [sort, setSort] = useState('desc');
  const { items, loading, error, page, totalPages, setPage, refetch } = useSubmissions({
    course_id,
    status,
    search,
    student,
    sort,
  });

  const applyFilters = () => {
    setPage(1);
    refetch({ course_id, status, search, student, sort, page: 1 });
  };

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold">Course Submissions Dashboard</h2>
        <p className="text-sm text-slate-500">Manage and grade all assignment submissions.</p>

        <div className="mt-4 grid gap-3 md:grid-cols-5">
          <input className="rounded-md border border-slate-300 p-2.5 text-sm" placeholder="Search content" value={search} onChange={(event) => setSearch(event.target.value)} />
          <input className="rounded-md border border-slate-300 p-2.5 text-sm" placeholder="Filter student id" value={student} onChange={(event) => setStudent(event.target.value)} />
          <select className="rounded-md border border-slate-300 p-2.5 text-sm" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="graded">Graded</option>
            <option value="needs_revision">Needs revision</option>
          </select>
          <select className="rounded-md border border-slate-300 p-2.5 text-sm" value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="desc">Newest first</option>
            <option value="asc">Oldest first</option>
          </select>
          <button className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white" onClick={applyFilters}>
            Apply Filters
          </button>
        </div>
      </div>

      {loading && <LoadingSkeleton />}
      {!loading && error && <ErrorState message={error} onRetry={refetch} />}
      {!loading && !error && items.length === 0 && <EmptyState message="No submissions match filters." />}
      {!loading && !error && items.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <SubmissionCard key={item.id} submission={item} />
          ))}
        </div>
      )}

      <div className="flex items-center justify-end gap-2">
        <button className="rounded-md border border-slate-300 px-3 py-2 text-sm disabled:opacity-60" disabled={page <= 1} onClick={() => setPage((prev) => prev - 1)}>
          Previous
        </button>
        <span className="text-sm text-slate-600">Page {page} of {totalPages}</span>
        <button className="rounded-md border border-slate-300 px-3 py-2 text-sm disabled:opacity-60" disabled={page >= totalPages} onClick={() => setPage((prev) => prev + 1)}>
          Next
        </button>
      </div>
    </section>
  );
}
