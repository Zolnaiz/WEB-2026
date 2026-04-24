import React, { useEffect, useState } from 'react';
import { api } from '../services/apiClient';
import { useToast } from '../context/ToastContext';

export default function ModuleCrudPage({ title, endpoint, fields, canWrite }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { pushToast } = useToast();

  const load = async () => {
    setLoading(true); setError('');
    try { const r = await api.get(endpoint); setItems(r.items || []); } catch (e) { setError(e.message); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [endpoint]);

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editingId) await api.put(`${endpoint}/${editingId}`, form);
      else await api.post(endpoint, form);
      setForm({}); setEditingId(null); pushToast('Saved', 'success'); load();
    } catch (err) { pushToast(err.message, 'error'); }
  };

  const edit = (it) => { setEditingId(it.id); setForm(it); };
  const del = async (id) => { try { await api.del(`${endpoint}/${id}`); pushToast('Deleted', 'success'); load(); } catch (e) { pushToast(e.message, 'error'); } };

  return <section className="space-y-3"><h2 className="text-xl font-semibold">{title}</h2>{loading && <div className="text-sm">Loading...</div>}{error && <div className="text-red-600 text-sm">{error}</div>}{!loading && !error && items.length===0 && <div className="text-sm text-slate-500">No data available.</div>}
  {!loading && !error && items.length>0 && <div className="bg-white border rounded overflow-auto"><table className="w-full text-sm"><thead><tr>{Object.keys(items[0]).map((k)=><th key={k} className="p-2 text-left border-b">{k}</th>)}{canWrite && <th className="p-2 border-b">actions</th>}</tr></thead><tbody>{items.map((it)=><tr key={it.id}>{Object.keys(items[0]).map((k)=><td key={k} className="p-2 border-b">{Array.isArray(it[k])?it[k].join(', '):String(it[k]??'')}</td>)}{canWrite && <td className="p-2 border-b"><button className="mr-2 text-blue-600" onClick={()=>edit(it)}>Edit</button><button className="text-red-600" onClick={()=>del(it.id)}>Delete</button></td>}</tr>)}</tbody></table></div>}
  {canWrite && <form className="bg-white border rounded p-3 grid grid-cols-1 md:grid-cols-2 gap-2" onSubmit={save}>{fields.map((f)=><input key={f} className="border rounded px-2 py-1" placeholder={f} value={Array.isArray(form[f]) ? form[f].join(',') : (form[f] || '')} onChange={(e)=>setForm((p)=>({...p,[f]: e.target.value.includes(',')?e.target.value.split(',').map((x)=>x.trim()):e.target.value}))} />)}<button className="px-3 py-1 rounded bg-indigo-600 text-white col-span-full w-fit">{editingId?'Update':'Create'}</button></form>}</section>;
}
