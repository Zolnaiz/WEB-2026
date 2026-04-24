import { Link, Navigate, Route, Routes } from 'react-router-dom';

const HomePage = () => (
  <section className="rounded-xl bg-white p-6 shadow">
    <h2 className="text-2xl font-semibold text-slate-900">Home</h2>
    <p className="mt-2 text-slate-600">React + Router + Tailwind scaffold is ready.</p>
  </section>
);

const SubmissionsPage = () => (
  <section className="rounded-xl bg-white p-6 shadow">
    <h2 className="text-2xl font-semibold text-slate-900">Submissions</h2>
    <p className="mt-2 text-slate-600">Build submission workflows inside src/modules/submissions.</p>
  </section>
);

function App() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-10">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold">WEB-2026 Frontend</h1>
          <p className="text-slate-600">Use the routes below as your starting point.</p>
          <nav className="flex gap-3 text-sm font-medium text-indigo-600">
            <Link to="/">Home</Link>
            <Link to="/submissions">Submissions</Link>
          </nav>
        </header>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/submissions" element={<SubmissionsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
