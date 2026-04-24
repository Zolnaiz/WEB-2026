import { useParams } from 'react-router-dom';

export default function CourseSubmissionsPage() {
  const { course_id: courseId } = useParams();

  return (
    <main>
      <h1>Course Submissions</h1>
      <p>Showing submissions for course {courseId}.</p>
    </main>
  );
}
