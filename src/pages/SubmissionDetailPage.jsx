import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import GradeModal from '../components/GradeModal';
import StatusBadge from '../components/StatusBadge';
import SubmissionActions from '../components/SubmissionActions';
import { useAuth } from '../hooks/useAuth';
import { useSubmissions } from '../hooks/useSubmissions';
import { useToast } from '../context/ToastContext';
import { canViewSubmission } from '../utils/submissionAccess';

function getYoutubeEmbedUrl(url) {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtu.be')) return `https://www.youtube.com/embed/${parsed.pathname.slice(1)}`;
    const videoId = parsed.searchParams.get('v');
    return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
  } catch {
    return '';
  }
}

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

  const embedVideoUrl = useMemo(() => getYoutubeEmbedUrl(submission?.video_url), [submission?.video_url]);

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
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Submission #{submission.id}</h2>
          <StatusBadge status={submission.status} />
        </div>
        <p className="text-sm text-slate-600">Student: {submission.user_id}</p>
        <p className="text-sm text-slate-600">Group: {submission.group_id || 'Individual'} | Members: {(submission.group_members || []).join(', ')}</p>
        <p className="mt-4 whitespace-pre-wrap text-sm text-slate-800">{submission.content}</p>

        <div className="mt-4 grid gap-4 text-sm md:grid-cols-2">
          {submission.image_url && <img src={submission.image_url} alt="submission" className="h-48 w-full rounded-lg object-cover" />}
          {embedVideoUrl && <iframe className="h-48 w-full rounded-lg" src={embedVideoUrl} title="Submitted video" allowFullScreen />}
          {submission.file_url && <a className="font-medium text-indigo-600" href={submission.file_url}>Open file resource</a>}
          {submission.grade_point !== null && <p><span className="font-medium">Grade:</span> {submission.grade_point}</p>}
          {submission.feedback && <p><span className="font-medium">Feedback:</span> {submission.feedback}</p>}
        </div>

        <SubmissionActions currentUser={user} submission={submission} onOpenGrade={() => setOpenGrade(true)} />
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
