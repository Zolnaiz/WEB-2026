import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SubmissionForm from '../components/SubmissionForm';
import { useAuth } from '../hooks/useAuth';
import { useSubmissions } from '../hooks/useSubmissions';
import { useToast } from '../context/ToastContext';
import { canEditSubmission } from '../utils/submissionAccess';

export default function EditSubmissionPage() {
  const { course_id, lesson_id, id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { pushToast } = useToast();
  const { getSubmissionById, updateSubmission } = useSubmissions();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const data = await getSubmissionById(id);
        if (!canEditSubmission(user, data.item)) {
          pushToast('Submission cannot be edited (locked or no access)', 'error');
          navigate(`/courses/${course_id}/lessons/${lesson_id}/submissions/${id}`);
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

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      await updateSubmission(id, values);
      pushToast('Submission updated successfully', 'success');
      navigate(`/courses/${course_id}/lessons/${lesson_id}/submissions/${id}`);
    } catch (error) {
      pushToast(error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <p className="text-sm text-slate-500">Loading submission...</p>;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold">Edit Submission</h2>
      <div className="mt-4">
        <SubmissionForm initialValues={submission} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
    </section>
  );
}
