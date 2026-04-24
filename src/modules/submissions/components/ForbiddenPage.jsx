import { Link } from 'react-router-dom';

export default function ForbiddenPage() {
  return (
    <main>
      <h1>403 - Forbidden</h1>
      <p>You do not have permission to access this submissions route.</p>
      <Link to="/">Return home</Link>
    </main>
  );
}
