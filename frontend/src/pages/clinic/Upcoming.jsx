import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import ClinicLayout from '../../components/clinic/ClinicLayout';

const TREATMENT_ICONS = {
  Cleaning: '🪥', Filling: '🦷', RCT: '🔧', Crown: '👑',
  Extraction: '❌', Braces: '📐', Implant: '🔩',
  Consultation: '💬', Whitening: '✨', Other: '🔵',
};

function formatDateTime(dt) {
  const d = new Date(dt);
  const date = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' });
  const time = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' });
  return { date, time };
}

function isToday(dt) {
  const d = new Date(dt);
  const now = new Date();
  return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

function isTomorrow(dt) {
  const d = new Date(dt);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return d.getDate() === tomorrow.getDate() && d.getMonth() === tomorrow.getMonth() && d.getFullYear() === tomorrow.getFullYear();
}

function dayLabel(dt) {
  if (isToday(dt)) return 'Today';
  if (isTomorrow(dt)) return 'Tomorrow';
  return new Date(dt).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' });
}

export default function Upcoming() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get('/appointments', { params: { filter: 'upcoming' } })
      .then((res) => setAppointments(res.data))
      .finally(() => setLoading(false));
  }, []);

  // Group by day label
  const groups = appointments.reduce((acc, appt) => {
    const label = dayLabel(appt.datetime);
    if (!acc[label]) acc[label] = [];
    acc[label].push(appt);
    return acc;
  }, {});

  const addBtn = (
    <Link
      to="/clinic/appointments/add"
      className="bg-teal-600 text-white text-sm font-medium px-4 py-2 rounded-xl active:scale-95 transition-transform"
    >
      + Appointment
    </Link>
  );

  return (
    <ClinicLayout title="Upcoming" rightAction={addBtn}>
      <div className="max-w-2xl mx-auto px-4 py-5">
        {loading ? (
          <div className="text-center text-gray-400 py-16">Loading...</div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-3">📅</p>
            <p className="text-gray-500 font-medium mb-4">No upcoming appointments</p>
            <Link to="/clinic/appointments/add" className="inline-block bg-teal-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl">
              + Add Appointment
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groups).map(([label, appts]) => (
              <div key={label}>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{label}</p>
                <div className="space-y-2">
                  {appts.map((appt) => {
                    const { time } = formatDateTime(appt.datetime);
                    return (
                      <Link key={appt.id} to={`/clinic/patients/${appt.patient_id}`}>
                        <div className="bg-white rounded-2xl border border-gray-200 px-4 py-3 flex items-center justify-between hover:border-teal-300 transition-colors">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{TREATMENT_ICONS[appt.treatment_type] || '🦷'}</span>
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">{appt.patients?.name}</p>
                              <p className="text-gray-500 text-xs">{appt.treatment_type}</p>
                            </div>
                          </div>
                          <p className="text-gray-500 text-sm font-medium">{time}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ClinicLayout>
  );
}
