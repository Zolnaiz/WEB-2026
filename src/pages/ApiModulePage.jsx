import React, { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../services/apiClient';

const routeConfig = {
  '/roles': { title: 'Roles', endpoint: '/roles' },
  '/school': { title: 'School', endpoint: '/school' },
  '/profile': { title: 'Profile', endpoint: '/profile' },
  '/profile/change-password': { title: 'Change Password', endpoint: '/profile/change-password', form: true },
  '/grade': { title: 'Grade', endpoint: '/grade' },
  '/question-types': { title: 'Question Types', endpoint: '/question-types' },
  '/question-levels': { title: 'Question Levels', endpoint: '/question-levels' },
};

export default function ApiModulePage() {
  const location = useLocation();
  const config = routeConfig[location.pathname] || { title: 'API Module', endpoint: location.pathname };
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ oldPassword: '', newPassword: '' });

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(config.endpoint);
      setData(res);
    } catch (err) {
      setError(`${err.message} (status: ${err.status ?? 'n/a'}, endpoint: ${err.endpoint ?? config.endpoint})`);
    } finally {
      setLoading(false);
    }
  };

  const rows = useMemo(() => {
    const items = data?.items || (data?.item ? [data.item] : []);
    return Array.isArray(items) ? items : [];
  }, [data]);

  const keys = useMemo(() => Array.from(new Set(rows.flatMap((row) => Object.keys(row || {})))), [rows]);

  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold">{config.title}</h2>
      {!config.form && <button className="rounded bg-indigo-600 px-3 py-1 text-white" onClick={load}>Load</button>}
      {error && <div className="rounded border border-red-300 bg-red-50 p-2 text-sm text-red-700">{error}</div>}
      {loading && <div className="text-sm text-slate-500">Loading...</div>}

      {config.form && (
        <form
          className="max-w-md space-y-2 rounded border bg-white p-3"
          onSubmit={async (event) => {
            event.preventDefault();
            setError('');
            try {
              await api.put('/profile/change-password', form);
              setForm({ oldPassword: '', newPassword: '' });
            } catch (err) {
              setError(`${err.message} (status: ${err.status ?? 'n/a'}, endpoint: ${err.endpoint ?? '/profile/change-password'})`);
            }
          }}
        >
          <input type="password" className="w-full rounded border px-2 py-1" placeholder="Old password" value={form.oldPassword} onChange={(e) => setForm({ ...form, oldPassword: e.target.value })} required />
          <input type="password" className="w-full rounded border px-2 py-1" placeholder="New password" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} required />
          <button className="rounded bg-indigo-600 px-3 py-1 text-white">Change Password</button>
        </form>
      )}

      {!config.form && rows.length > 0 && (
        <div className="overflow-auto rounded border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr>{keys.map((key) => <th key={key} className="border-b p-2 text-left">{key}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={row.id || idx}>{keys.map((key) => <td className="border-b p-2" key={key}>{typeof row[key] === 'object' ? JSON.stringify(row[key]) : String(row[key] ?? '')}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
