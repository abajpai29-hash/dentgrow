import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';

const PLAN_COLORS = {
  starter: 'bg-blue-900 text-blue-200',
  growth: 'bg-purple-900 text-purple-200',
  partner: 'bg-amber-900 text-amber-200',
};

const STATUS_COLORS = {
  active: 'text-green-400',
  trial: 'text-yellow-400',
  paused: 'text-orange-400',
  churned: 'text-red-400',
};

const HEALTH_ICONS = { green: '🟢', yellow: '🟡', red: '🔴' };

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [clinics, setClinics] = useState([]);
  const [mrr, setMrr] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([client.get('/clinics'), client.get('/clinics/mrr')])
      .then(([c, m]) => {
        setClinics(c.data);
        setMrr(m.data);
      })
      .finally(() => setLoading(false));
  }, []);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Top nav */}
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">🦷</span>
          <span className="text-lg font-bold text-teal-400">DentGrow</span>
          <span className="text-gray-600 text-sm ml-2">Super Admin</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/admin/messages" className="text-gray-400 hover:text-gray-200 text-sm">Messages</Link>
          <Link to="/admin/reviews" className="text-gray-400 hover:text-gray-200 text-sm">Reviews</Link>
          <Link to="/admin/campaigns" className="text-gray-400 hover:text-gray-200 text-sm">Campaigns</Link>
          <Link to="/admin/reports" className="text-gray-400 hover:text-gray-200 text-sm">Reports</Link>
          <button onClick={handleLogout} className="text-gray-500 hover:text-gray-300 text-sm">Logout</button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* MRR Overview */}
        {mrr && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
              <p className="text-gray-400 text-sm mb-1">Monthly Revenue</p>
              <p className="text-3xl font-bold text-green-400">₹{mrr.mrr?.toLocaleString('en-IN')}</p>
              <p className="text-gray-500 text-xs mt-1">MRR</p>
            </div>
            <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
              <p className="text-gray-400 text-sm mb-1">Total Clinics</p>
              <p className="text-3xl font-bold text-teal-400">{mrr.total_clinics}</p>
              <p className="text-gray-500 text-xs mt-1">onboarded</p>
            </div>
            <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
              <p className="text-gray-400 text-sm mb-1">Churned</p>
              <p className="text-3xl font-bold text-red-400">{mrr.churned}</p>
              <p className="text-gray-500 text-xs mt-1">this month</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold">All Clinics</h1>
          <Link
            to="/admin/clinics/new"
            className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + Onboard Clinic
          </Link>
        </div>

        {loading ? (
          <div className="text-gray-500 text-center py-12">Loading clinics...</div>
        ) : (
          <div className="space-y-3">
            {clinics.map((clinic) => (
              <Link key={clinic.id} to={`/admin/clinics/${clinic.id}`}>
                <div className="bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl p-5 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{HEALTH_ICONS[clinic.health]}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-100">{clinic.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PLAN_COLORS[clinic.plan]}`}>
                            {clinic.plan}
                          </span>
                          <span className={`text-xs font-medium ${STATUS_COLORS[clinic.status]}`}>
                            {clinic.status}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm mt-0.5">
                          {clinic.stats.appointments_this_month} appts this month
                          {' · '}
                          {clinic.stats.no_show_count} no-shows
                          {' · '}
                          {clinic.stats.messages_this_month} messages sent
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <p>{clinic.stats.total_patients} patients</p>
                      <p className="text-xs mt-0.5">
                        No-show {clinic.stats.no_show_rate}%
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
