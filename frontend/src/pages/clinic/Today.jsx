import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import ClinicLayout from '../../components/clinic/ClinicLayout';

const TREATMENT_ICONS = {
  Cleaning: '🪥', Filling: '🦷', RCT: '🔧', Crown: '👑',
  Extraction: '❌', Braces: '📐', Implant: '🔩',
  Consultation: '💬', Whitening: '✨', Other: '🔵',
};

const STATUS_STYLES = {
  scheduled: { dot: 'bg-gray-300', label: 'Scheduled', text: 'text-gray-600' },
  confirmed: { dot: 'bg-green-400', label: 'Arrived', text: 'text-green-600' },
  completed: { dot: 'bg-teal-400', label: 'Done', text: 'text-teal-600' },
  'no-show': { dot: 'bg-red-400', label: 'No-show', text: 'text-red-500' },
};

function formatTime(datetime) {
  return new Date(datetime).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata',
  });
}

export default function ClinicToday() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  // toast: { message, patientId } | null
  const [toast, setToast] = useState(null);
  // notes: { [apptId]: { open: bool, text: string, saving: bool } }
  const [notes, setNotes] = useState({});

  useEffect(() => {
    client.get('/appointments', { params: { filter: 'today' } })
      .then((res) => setAppointments(res.data))
      .finally(() => setLoading(false));
  }, []);

  function showToast(message, patientId) {
    setToast({ message, patientId });
    setTimeout(() => setToast(null), 6000);
  }

  async function updateStatus(apptId, status, patientId) {
    setUpdating(apptId);
    try {
      const res = await client.patch(`/appointments/${apptId}/status`, { status });
      setAppointments((prev) =>
        prev.map((a) => (a.id === apptId ? { ...a, ...res.data } : a))
      );
      if (status === 'completed') {
        showToast('Done ✓  Follow-up WhatsApp will be sent tomorrow', patientId);
      } else if (status === 'no-show') {
        showToast('No-show marked. Re-booking message will be sent automatically', null);
      }
    } catch {
      alert('Failed to update. Try again.');
    } finally {
      setUpdating(null);
    }
  }

  async function saveNotes(apptId) {
    const noteText = notes[apptId]?.text || '';
    setNotes((prev) => ({ ...prev, [apptId]: { ...prev[apptId], saving: true } }));
    try {
      await client.patch(`/appointments/${apptId}/status`, { treatment_notes: noteText });
      setAppointments((prev) =>
        prev.map((a) => (a.id === apptId ? { ...a, treatment_notes: noteText } : a))
      );
      setNotes((prev) => ({ ...prev, [apptId]: { open: false, text: '', saving: false } }));
    } catch {
      alert('Failed to save notes. Try again.');
      setNotes((prev) => ({ ...prev, [apptId]: { ...prev[apptId], saving: false } }));
    }
  }

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Asia/Kolkata',
  });

  // Pending first (by time), completed/no-show pushed to bottom
  const sorted = [...appointments].sort((a, b) => {
    const terminal = (s) => s === 'completed' || s === 'no-show';
    if (terminal(a.status) && !terminal(b.status)) return 1;
    if (!terminal(a.status) && terminal(b.status)) return -1;
    return new Date(a.datetime) - new Date(b.datetime);
  });

  const topActions = (
    <Link
      to="/clinic/appointments/add"
      className="bg-teal-600 text-white text-sm font-medium px-4 py-2 rounded-xl active:scale-95 transition-transform"
    >
      + Appointment
    </Link>
  );

  return (
    <ClinicLayout title="Today" rightAction={topActions}>
      <div className="max-w-2xl mx-auto px-4 py-5">
        <p className="text-gray-500 text-sm mb-4">{today}</p>

        {/* Toast confirmation */}
        {toast && (
          <div className="bg-teal-50 border border-teal-200 text-teal-800 text-sm rounded-xl px-4 py-3 mb-4 flex items-center justify-between gap-3">
            <span>{toast.message}</span>
            {toast.patientId && (
              <Link
                to={`/clinic/appointments/add?patient_id=${toast.patientId}`}
                className="shrink-0 text-teal-700 font-semibold underline underline-offset-2"
              >
                Book next visit →
              </Link>
            )}
          </div>
        )}

        {loading ? (
          <div className="text-center text-gray-400 py-16">Loading...</div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-3">📭</p>
            <p className="text-gray-500 font-medium mb-4">No appointments today</p>
            <Link to="/clinic/appointments/add" className="inline-block bg-teal-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl">
              + Add Appointment
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map((appt) => {
              const style = STATUS_STYLES[appt.status];
              const isUpdating = updating === appt.id;
              const isPast = appt.status === 'completed' || appt.status === 'no-show';
              const noteState = notes[appt.id] || { open: false, text: '', saving: false };

              return (
                <div
                  key={appt.id}
                  className={`bg-white rounded-2xl border p-4 shadow-sm ${isPast ? 'opacity-50 border-gray-100' : 'border-gray-200'}`}
                >
                  {/* Patient + treatment */}
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

                  {appt.treatment_notes && !noteState.open && (
                    <p className="text-gray-400 text-xs mb-3 bg-gray-50 rounded-xl px-3 py-2">
                      {appt.treatment_notes}
                    </p>
                  )}

                  {!isPast && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateStatus(appt.id, 'completed', appt.patient_id)}
                        disabled={isUpdating}
                        className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 rounded-xl text-sm active:scale-95 transition-all disabled:opacity-50"
                      >
                        {isUpdating ? 'Saving...' : 'Done'}
                      </button>
                      <button
                        onClick={() => updateStatus(appt.id, 'no-show', appt.patient_id)}
                        disabled={isUpdating}
                        className="px-4 bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2.5 rounded-xl text-sm active:scale-95 transition-all disabled:opacity-50"
                      >
                        No-show
                      </button>
                    </div>
                  )}

                  {/* Optional notes for completed/no-show */}
                  {isPast && !appt.treatment_notes && (
                    noteState.open ? (
                      <div className="mt-2">
                        <textarea
                          autoFocus
                          rows={2}
                          value={noteState.text}
                          onChange={(e) => setNotes((prev) => ({ ...prev, [appt.id]: { ...prev[appt.id], text: e.target.value } }))}
                          placeholder="Treatment notes..."
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
                        />
                        <div className="flex gap-2 mt-1.5">
                          <button
                            onClick={() => saveNotes(appt.id)}
                            disabled={noteState.saving}
                            className="text-xs bg-teal-600 text-white px-3 py-1.5 rounded-lg disabled:opacity-50"
                          >
                            {noteState.saving ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={() => setNotes((prev) => ({ ...prev, [appt.id]: { open: false, text: '', saving: false } }))}
                            className="text-xs text-gray-400 px-2 py-1.5"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setNotes((prev) => ({ ...prev, [appt.id]: { open: true, text: '', saving: false } }))}
                        className="mt-1 text-xs text-gray-400 hover:text-gray-600"
                      >
                        + Add notes
                      </button>
                    )
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ClinicLayout>
  );
}
