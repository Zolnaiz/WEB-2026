import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../services/apiClient';

const SAMPLE_FALLBACK = [{ info: 'Offline/sample fallback data' }];

function toApiPath(pathname) {
  return pathname.replace(/\/(create|edit)$/,'').replace(/^\//, '/');
}

export default function ApiModulePage() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payload, setPayload] = useState(null);
  const apiPath = toApiPath(location.pathname);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const result = await api.get(apiPath);
        if (!active) return;
        setPayload(result);
      } catch (e) {
        if (!active) return;
        setError(e.message);
        setPayload({ items: SAMPLE_FALLBACK });
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [apiPath]);

  const title = location.pathname;
  const rows = payload?.items || (payload?.item ? [payload.item] : []);

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      {loading && <div className="text-sm">Loading...</div>}
      {!loading && error && <div className="rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-700">API unavailable: {error}. Showing sample data fallback.</div>}
      {!loading && rows.length === 0 && <div className="text-sm text-slate-500">No data.</div>}
      {!loading && rows.length > 0 && (
        <div className="overflow-auto rounded border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr>
                {Object.keys(rows[0]).map((key) => (
                  <th key={key} className="border-b p-2 text-left">{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id || index}>
                  {Object.keys(rows[0]).map((key) => (
                    <td key={key} className="border-b p-2">{String(row[key] ?? '')}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
