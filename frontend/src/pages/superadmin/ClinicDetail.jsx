import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import client from '../../api/client';

const PLAN_PRICES = { starter: 5999, growth: 9999, partner: 18999 };

export default function AdminClinicDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [clinic, setClinic] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    Promise.all([client.get(`/clinics/${id}`), client.get(`/analytics/${id}`)])
      .then(([c, a]) => {
        setClinic(c.data);
        setAnalytics(a.data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function updateField(field, value) {
    setUpdating(true);
    try {
      const res = await client.patch(`/clinics/${id}`, { [field]: value });
      setClinic(res.data);
    } catch (err) {
      alert(err.response?.data?.error || 'Update failed');
    } finally {
      setUpdating(false);
    }
  }

  if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400">Loading...</div>;
  if (!clinic) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400">Clinic not found</div>;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link to="/admin" className="text-gray-400 hover:text-gray-200">← Back</Link>
        <span className="text-gray-600">/</span>
        <span className="font-semibold">{clinic.name}</span>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Clinic header */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">{clinic.name}</h1>
              <p className="text-gray-400 mt-1">{clinic.owner_name} · {clinic.owner_mobile}</p>
              <p className="text-gray-500 text-sm">{clinic.email}</p>
            </div>
            <div className="flex gap-2">
              <select
                value={clinic.plan}
                onChange={(e) => updateField('plan', e.target.value)}
                disabled={updating}
                className="bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none"
              >
                <option value="starter">Starter ₹5,999</option>
                <option value="growth">Growth ₹9,999</option>
                <option value="partner">Partner ₹18,999</option>
              </select>
              <select
                value={clinic.status}
                onChange={(e) => updateField('status', e.target.value)}
                disabled={updating}
                className="bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none"
              >
                <option value="trial">Trial</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="churned">Churned</option>
              </select>
            </div>
          </div>
        </div>

        {/* Analytics grid */}
        {analytics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <p className="text-gray-400 text-xs mb-1">Appts this month</p>
              <p className="text-2xl font-bold text-teal-400">{analytics.appointments.this_month}</p>
              <p className="text-xs text-gray-500 mt-1">
                {analytics.appointments.change_pct >= 0 ? '+' : ''}{analytics.appointments.change_pct}% vs last month
              </p>
            </div>
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <p className="text-gray-400 text-xs mb-1">No-show rate</p>
              <p className={`text-2xl font-bold ${analytics.no_show.rate > 20 ? 'text-red-400' : 'text-green-400'}`}>
                {analytics.no_show.rate}%
              </p>
              <p className="text-xs text-gray-500 mt-1">{analytics.no_show.count} missed</p>
            </div>
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <p className="text-gray-400 text-xs mb-1">Messages sent</p>
              <p className="text-2xl font-bold text-purple-400">{analytics.messages.sent}</p>
              <p className="text-xs text-gray-500 mt-1">{analytics.messages.delivery_rate}% delivered</p>
            </div>
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <p className="text-gray-400 text-xs mb-1">Retention rate</p>
              <p className="text-2xl font-bold text-amber-400">{analytics.patients.retention_rate}%</p>
              <p className="text-xs text-gray-500 mt-1">{analytics.patients.total} total patients</p>
            </div>
          </div>
        )}

        {/* Clinic settings */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h2 className="font-semibold mb-4">Settings</h2>
          <div className="space-y-4">
            {[
              { key: 'google_review_link', label: 'Google Review Link' },
              { key: 'booking_link', label: 'Booking Link' },
              { key: 'instagram_handle', label: 'Instagram Handle' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-sm text-gray-400 mb-1">{label}</label>
                <input
                  type="text"
                  defaultValue={clinic[key] || ''}
                  onBlur={(e) => {
                    if (e.target.value !== clinic[key]) updateField(key, e.target.value);
                  }}
                  className="w-full bg-gray-800 border border-gray-700 text-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <Link
            to={`/admin/messages?clinic_id=${id}`}
            className="text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg transition-colors"
          >
            View Messages Log
          </Link>
        </div>
      </div>
    </div>
  );
}
