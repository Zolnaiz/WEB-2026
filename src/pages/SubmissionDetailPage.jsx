import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import GradeModal from '../components/GradeModal';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../hooks/useAuth';
import { useSubmissions } from '../hooks/useSubmissions';
import { useToast } from '../context/ToastContext';
import { canEditSubmission, canGradeSubmission, canViewSubmission } from '../utils/submissionAccess';

export default function SubmissionDetailPage() {
  const { course_id, lesson_id, id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { pushToast } = useToast();
  const { getSubmissionById, gradeSubmission } = useSubmissions();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openGrade, setOpenGrade] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const data = await getSubmissionById(id);
        if (!canViewSubmission(user, data.item)) {
          pushToast('You do not have access to this submission', 'error');
          navigate(`/courses/${course_id}/lessons/${lesson_id}/submissions`);
          return;
        }
        setSubmission(data.item);
      } catch (error) {
        pushToast(error.message, 'error');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [course_id, getSubmissionById, id, lesson_id, navigate, pushToast, user]);

  const handleGrade = async (payload) => {
    setIsSubmitting(true);
    try {
      const data = await gradeSubmission(id, { ...payload, grader_id: user.id });
      setSubmission(data.item);
      setOpenGrade(false);
      pushToast('Submission graded successfully', 'success');
    } catch (error) {
      pushToast(error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <p className="text-sm text-slate-500">Loading submission...</p>;
  if (!submission) return <EmptyState message="Submission not found." />;

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Submission #{submission.id}</h2>
          <StatusBadge status={submission.status} />
        </div>
        <p className="text-sm text-slate-600">Student: {submission.user_id}</p>
        <p className="mt-4 whitespace-pre-wrap text-sm text-slate-800">{submission.content}</p>

        <div className="mt-4 grid gap-2 text-sm">
          {submission.file_url && <a className="text-indigo-600" href={submission.file_url}>File URL</a>}
          {submission.video_url && <a className="text-indigo-600" href={submission.video_url}>Video URL</a>}
          {submission.grade_point !== null && <p><span className="font-medium">Grade:</span> {submission.grade_point}</p>}
          {submission.feedback && <p><span className="font-medium">Feedback:</span> {submission.feedback}</p>}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {canEditSubmission(user, submission) && (
            <Link
              className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white"
              to={`/courses/${course_id}/lessons/${lesson_id}/submissions/${id}/edit`}
            >
              Edit Submission
            </Link>
          )}

          {canGradeSubmission(user) && submission.status !== 'graded' && (
            <button onClick={() => setOpenGrade(true)} className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white">
              Grade Submission
            </button>
          )}
        </div>
      </div>

      <GradeModal
        open={openGrade}
        submission={submission}
        onClose={() => setOpenGrade(false)}
        onSubmit={handleGrade}
        isSubmitting={isSubmitting}
      />
    </section>
  );
}
