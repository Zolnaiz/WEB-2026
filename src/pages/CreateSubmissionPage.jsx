import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SubmissionForm from '../components/SubmissionForm';
import { useAuth } from '../hooks/useAuth';
import { useSubmissions } from '../hooks/useSubmissions';
import { useToast } from '../context/ToastContext';

export default function CreateSubmissionPage() {
  const { course_id, lesson_id } = useParams();
  const { user } = useAuth();
  const { pushToast } = useToast();
  const { createSubmission } = useSubmissions();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const created = await createSubmission({
        ...values,
        course_id,
        lesson_id,
        user_id: user.id,
      });
      pushToast('Submission created successfully', 'success');
      navigate(`/courses/${course_id}/lessons/${lesson_id}/submissions/${created.item.id}`);
    } catch (error) {
      pushToast(error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold">Create Submission</h2>
      <p className="mt-1 text-sm text-slate-500">Add assignment answer with files or video links.</p>
      <div className="mt-4">
        <SubmissionForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
    </section>
  );
}
