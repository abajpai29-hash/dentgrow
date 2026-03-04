import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../../api/client';

const TREATMENTS = ['Cleaning', 'Filling', 'RCT', 'Crown', 'Extraction', 'Braces', 'Implant', 'Consultation', 'Whitening', 'Other'];

export default function AddPatient() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', mobile: '', age: '', gender: '', treatment_type: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.mobile.trim()) {
      setError('Name and mobile are required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await client.post('/patients', {
        name: form.name.trim(),
        mobile: form.mobile.trim(),
        age: form.age ? parseInt(form.age, 10) : null,
        gender: form.gender || null,
      });
      navigate('/clinic/patients');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add patient');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-3 sticky top-0">
        <Link to="/clinic/patients" className="text-gray-400 text-xl">←</Link>
        <h1 className="font-bold text-gray-900 text-lg">Add Patient</h1>
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
              placeholder="e.g. Priya Sharma"
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
              placeholder="e.g. 9876543210"
              className="w-full border-2 border-gray-200 focus:border-teal-500 rounded-2xl px-4 py-4 text-lg focus:outline-none"
              required
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-base font-semibold text-gray-800 mb-2">Age (optional)</label>
              <input
                type="number"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
                placeholder="e.g. 32"
                min="1"
                max="120"
                className="w-full border-2 border-gray-200 focus:border-teal-500 rounded-2xl px-4 py-4 text-lg focus:outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="block text-base font-semibold text-gray-800 mb-2">Gender (optional)</label>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                className="w-full border-2 border-gray-200 focus:border-teal-500 rounded-2xl px-4 py-4 text-lg focus:outline-none bg-white"
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-base font-semibold text-gray-800 mb-2">First Treatment (optional)</label>
            <select
              value={form.treatment_type}
              onChange={(e) => setForm({ ...form, treatment_type: e.target.value })}
              className="w-full border-2 border-gray-200 focus:border-teal-500 rounded-2xl px-4 py-4 text-lg focus:outline-none bg-white"
            >
              <option value="">Select treatment</option>
              {TREATMENTS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-2xl text-lg active:scale-95 transition-all disabled:opacity-60 mt-4"
          >
            {loading ? 'Adding...' : 'Add Patient'}
          </button>
        </form>
      </div>
    </div>
  );
}
