import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';

const TREATMENT_ICONS = {
  Cleaning: '🪥', Filling: '🦷', RCT: '🔧', Crown: '👑',
  Extraction: '❌', Braces: '📐', Implant: '🔩',
  Consultation: '💬', Whitening: '✨', Other: '🔵',
};

const STATUS_STYLES = {
  scheduled: { dot: 'bg-gray-300', label: 'Scheduled', text: 'text-gray-600' },
  confirmed: { dot: 'bg-green-400', label: 'Confirmed', text: 'text-green-600' },
  completed: { dot: 'bg-teal-400', label: 'Completed', text: 'text-teal-600' },
  'no-show': { dot: 'bg-red-400', label: 'No-show', text: 'text-red-500' },
};

function formatTime(datetime) {
  return new Date(datetime).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata',
  });
}

export default function ClinicToday() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    client.get('/appointments', { params: { filter: 'today' } })
      .then((res) => setAppointments(res.data))
      .finally(() => setLoading(false));
  }, []);

  async function updateStatus(apptId, status) {
    setUpdating(apptId);
    try {
      const res = await client.patch(`/appointments/${apptId}/status`, { status });
      setAppointments((prev) =>
        prev.map((a) => (a.id === apptId ? { ...a, status: res.data.status } : a))
      );
    } catch (err) {
      alert('Failed to update. Try again.');
    } finally {
      setUpdating(null);
    }
  }

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Asia/Kolkata',
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <span className="text-xl">🦷</span>
          <span className="font-bold text-teal-600">DentGrow</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/clinic/patients" className="text-sm text-gray-600 font-medium">Patients</Link>
          <Link to="/clinic/messages" className="text-sm text-gray-600 font-medium">Messages</Link>
          <button onClick={() => { logout(); navigate('/login'); }} className="text-sm text-gray-400">Logout</button>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Date + actions */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Today's Appointments</h1>
            <p className="text-gray-500 text-sm">{today}</p>
          </div>
          <Link
            to="/clinic/appointments/add"
            className="bg-teal-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl active:scale-95 transition-transform"
          >
            + Add
          </Link>
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-16">Loading...</div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-3">📭</p>
            <p className="text-gray-500 font-medium">No appointments today</p>
            <Link to="/clinic/appointments/add" className="mt-4 inline-block text-teal-600 text-sm font-medium">
              + Schedule one
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((appt) => {
              const style = STATUS_STYLES[appt.status];
              const isUpdating = updating === appt.id;
              const isPast = appt.status === 'completed' || appt.status === 'no-show';

              return (
                <div
                  key={appt.id}
                  className={`bg-white rounded-2xl border p-4 shadow-sm ${isPast ? 'opacity-60' : 'border-gray-200'}`}
                >
                  {/* Time + treatment */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{TREATMENT_ICONS[appt.treatment_type] || '🦷'}</span>
                      <div>
                        <p className="font-semibold text-gray-900 text-base">{appt.patients?.name}</p>
                        <p className="text-gray-500 text-sm">{appt.treatment_type} · {formatTime(appt.datetime)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${style.dot}`}></span>
                      <span className={`text-xs font-medium ${style.text}`}>{style.label}</span>
                    </div>
                  </div>

                  {/* Action buttons — only show for non-terminal states */}
                  {!isPast && (
                    <div className="flex gap-2 mt-2">
                      {appt.status !== 'confirmed' && (
                        <button
                          onClick={() => updateStatus(appt.id, 'confirmed')}
                          disabled={isUpdating}
                          className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 font-medium py-2.5 rounded-xl text-sm active:scale-95 transition-all disabled:opacity-50"
                        >
                          ✓ Confirm
                        </button>
                      )}
                      <button
                        onClick={() => updateStatus(appt.id, 'completed')}
                        disabled={isUpdating}
                        className="flex-1 bg-teal-50 hover:bg-teal-100 text-teal-700 font-medium py-2.5 rounded-xl text-sm active:scale-95 transition-all disabled:opacity-50"
                      >
                        ✓ Complete
                      </button>
                      <button
                        onClick={() => updateStatus(appt.id, 'no-show')}
                        disabled={isUpdating}
                        className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2.5 rounded-xl text-sm active:scale-95 transition-all disabled:opacity-50"
                      >
                        ✗ No-show
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
