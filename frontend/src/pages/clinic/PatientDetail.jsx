import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import client from '../../api/client';

const STATUS_COLORS = {
  scheduled: 'text-gray-500',
  confirmed: 'text-green-600',
  completed: 'text-teal-600',
  'no-show': 'text-red-500',
};

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get(`/patients/${id}`)
      .then((res) => setPatient(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Loading...</div>;
  if (!patient) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Patient not found</div>;

  const lastVisit = patient.appointments?.find((a) => a.status === 'completed');

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between sticky top-0">
        <div className="flex items-center gap-3">
          <Link to="/clinic/patients" className="text-gray-400 text-xl">←</Link>
          <h1 className="font-bold text-gray-900">{patient.name}</h1>
        </div>
        <Link
          to={`/clinic/appointments/add?patient_id=${patient.id}`}
          className="bg-teal-600 text-white text-sm font-medium px-4 py-2 rounded-xl"
        >
          + Appointment
        </Link>
      </nav>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Patient card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{patient.name}</h2>
              <p className="text-teal-600 font-medium mt-0.5">{patient.mobile}</p>
              <div className="flex gap-3 mt-2 text-sm text-gray-500">
                {patient.age && <span>{patient.age} yrs</span>}
                {patient.gender && <span>{patient.gender}</span>}
              </div>
            </div>
            <div className="text-right text-sm text-gray-400">
              <p>Patient since</p>
              <p className="font-medium text-gray-600">
                {new Date(patient.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>
          {patient.notes && (
            <div className="mt-4 bg-amber-50 rounded-xl px-4 py-3 text-sm text-amber-800">
              📋 {patient.notes}
            </div>
          )}
        </div>

        {/* Appointment history */}
        <h3 className="font-semibold text-gray-700 mb-3">
          Appointment History ({patient.appointments?.length || 0})
        </h3>

        {patient.appointments?.length === 0 ? (
          <div className="text-center py-8 text-gray-400">No appointments yet</div>
        ) : (
          <div className="space-y-2">
            {patient.appointments.map((appt) => (
              <div key={appt.id} className="bg-white rounded-2xl border border-gray-200 px-4 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{appt.treatment_type}</p>
                    <p className="text-gray-500 text-sm">
                      {new Date(appt.datetime).toLocaleString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit', hour12: true,
                        timeZone: 'Asia/Kolkata',
                      })}
                    </p>
                  </div>
                  <span className={`text-sm font-medium ${STATUS_COLORS[appt.status]}`}>
                    {appt.status}
                  </span>
                </div>
                {appt.treatment_notes && (
                  <p className="text-gray-400 text-xs mt-2">{appt.treatment_notes}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
