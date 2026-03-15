import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import client from '../../api/client';

export default function EditPatient() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', mobile: '', age: '', gender: '', notes: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    client.get(`/patients/${id}`).then((res) => {
      const p = res.data;
      setForm({
        name: p.name || '',
        mobile: p.mobile || '',
        age: p.age ?? '',
        gender: p.gender || '',
        notes: p.notes || '',
      });
    }).finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.mobile.trim()) {
      setError('Name and mobile are required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await client.patch(`/patients/${id}`, {
        name: form.name.trim(),
        mobile: form.mobile.trim(),
        age: form.age ? parseInt(form.age, 10) : null,
        gender: form.gender || null,
        notes: form.notes.trim() || null,
      });
      navigate(`/clinic/patients/${id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Loading...</div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-3 sticky top-0">
        <Link to={`/clinic/patients/${id}`} className="text-gray-400 text-xl">←</Link>
        <h1 className="font-bold text-gray-900 text-lg">Edit Patient</h1>
      </nav>

      <div className="max-w-lg mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-base font-semibold text-gray-800 mb-2">Patient Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border-2 border-gray-200 focus:border-teal-500 rounded-2xl px-4 py-4 text-lg focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-base font-semibold text-gray-800 mb-2">Mobile Number *</label>
            <input
              type="tel"
              value={form.mobile}
              onChange={(e) => setForm({ ...form, mobile: e.target.value })}
              className="w-full border-2 border-gray-200 focus:border-teal-500 rounded-2xl px-4 py-4 text-lg focus:outline-none"
              required
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-base font-semibold text-gray-800 mb-2">Age</label>
              <input
                type="number"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
                min="1"
                max="120"
                className="w-full border-2 border-gray-200 focus:border-teal-500 rounded-2xl px-4 py-4 text-lg focus:outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="block text-base font-semibold text-gray-800 mb-2">Gender</label>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                className="w-full border-2 border-gray-200 focus:border-teal-500 rounded-2xl px-4 py-4 text-lg focus:outline-none bg-white"
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-base font-semibold text-gray-800 mb-2">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="e.g. Allergic to penicillin, prefers morning appointments"
              rows={3}
              className="w-full border-2 border-gray-200 focus:border-teal-500 rounded-2xl px-4 py-4 text-base focus:outline-none resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-2xl text-lg active:scale-95 transition-all disabled:opacity-60 mt-4"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
