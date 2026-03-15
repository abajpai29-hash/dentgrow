import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import client from '../../api/client';

const TREATMENTS = ['Cleaning', 'Filling', 'RCT', 'Crown', 'Extraction', 'Braces', 'Implant', 'Consultation', 'Whitening', 'Other'];

export default function AddAppointment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ patient_id: '', datetime: '', treatment_type: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pre-select patient if patient_id is passed in URL (e.g. from patient detail page)
  useEffect(() => {
    const pid = searchParams.get('patient_id');
    if (pid) {
      client.get(`/patients/${pid}`).then((res) => {
        setPatients([res.data]);
        setForm((f) => ({ ...f, patient_id: pid }));
      });
    }
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => {
      if (search.length > 1) {
        client.get('/patients', { params: { search } }).then((res) => setPatients(res.data));
      }
    }, 300);
    return () => clearTimeout(delay);
  }, [search]);

  // Default datetime to next hour
  useEffect(() => {
    const now = new Date();
    now.setMinutes(0, 0, 0);
    now.setHours(now.getHours() + 1);
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setForm((f) => ({ ...f, datetime: local }));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.patient_id || !form.datetime || !form.treatment_type) {
      setError('All fields are required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await client.post('/appointments', {
        patient_id: form.patient_id,
        datetime: new Date(form.datetime).toISOString(),
        treatment_type: form.treatment_type,
      });
      navigate('/clinic');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to schedule appointment');
    } finally {
      setLoading(false);
    }
  }

  const selectedPatient = patients.find((p) => p.id === form.patient_id);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-3 sticky top-0">
        <Link to="/clinic" className="text-gray-400 text-xl">←</Link>
        <h1 className="font-bold text-gray-900 text-lg">Add Appointment</h1>
      </nav>

      <div className="max-w-lg mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Patient picker */}
          <div>
            <label className="block text-base font-semibold text-gray-800 mb-2">Patient *</label>
            {selectedPatient ? (
              <div className="flex items-center justify-between bg-teal-50 border-2 border-teal-400 rounded-2xl px-4 py-3">
                <div>
                  <p className="font-semibold text-gray-900">{selectedPatient.name}</p>
                  <p className="text-gray-500 text-sm">{selectedPatient.mobile}</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setForm({ ...form, patient_id: '' }); setSearch(''); }}
                  className="text-teal-600 text-sm font-medium"
                >
                  Change
                </button>
              </div>
            ) : (
              <>
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search patient by name or mobile..."
                  className="w-full border-2 border-gray-200 focus:border-teal-500 rounded-2xl px-4 py-4 text-base focus:outline-none"
                />
                {patients.length > 0 && search.length > 1 && (
                  <div className="border border-gray-200 rounded-2xl mt-2 bg-white shadow-sm overflow-hidden">
                    {patients.slice(0, 5).map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => { setForm({ ...form, patient_id: p.id }); setSearch(''); setPatients([]); }}
                        className="w-full text-left px-4 py-3 hover:bg-teal-50 border-b border-gray-100 last:border-b-0"
                      >
                        <p className="font-medium text-gray-900">{p.name}</p>
                        <p className="text-gray-500 text-sm">{p.mobile}</p>
                      </button>
                    ))}
                  </div>
                )}
                <Link to="/clinic/patients/add" className="block text-center text-teal-600 text-sm mt-2">
                  + Add new patient first
                </Link>
              </>
            )}
          </div>

          {/* Date + time */}
          <div>
            <label className="block text-base font-semibold text-gray-800 mb-2">Date & Time *</label>
            <input
              type="datetime-local"
              value={form.datetime}
              onChange={(e) => setForm({ ...form, datetime: e.target.value })}
              className="w-full border-2 border-gray-200 focus:border-teal-500 rounded-2xl px-4 py-4 text-base focus:outline-none"
              required
            />
          </div>

          {/* Treatment */}
          <div>
            <label className="block text-base font-semibold text-gray-800 mb-2">Treatment *</label>
            <select
              value={form.treatment_type}
              onChange={(e) => setForm({ ...form, treatment_type: e.target.value })}
              className="w-full border-2 border-gray-200 focus:border-teal-500 rounded-2xl px-4 py-4 text-base focus:outline-none bg-white"
              required
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
            {loading ? 'Scheduling...' : 'Schedule Appointment'}
          </button>
        </form>
      </div>
    </div>
  );
}
