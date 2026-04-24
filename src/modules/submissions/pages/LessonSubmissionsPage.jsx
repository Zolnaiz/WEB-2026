import { useParams } from 'react-router-dom';

export default function LessonSubmissionsPage() {
  const { course_id: courseId, lesson_id: lessonId } = useParams();

  return (
    <main>
      <h1>Lesson Submissions</h1>
      <p>
        Showing submissions for course {courseId}, lesson {lessonId}.
      </p>
    </main>
  );
}
