import { useParams } from 'react-router-dom';

export default function CreateSubmissionPage() {
  const { course_id: courseId, lesson_id: lessonId } = useParams();

  return (
    <main>
      <h1>Create Submission</h1>
      <p>
        Create a new submission for course {courseId}, lesson {lessonId}.
      </p>
    </main>
  );
}
