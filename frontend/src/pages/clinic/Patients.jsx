import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';

export default function ClinicPatients() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const delay = setTimeout(() => {
      client.get('/patients', { params: search ? { search } : {} })
        .then((res) => setPatients(res.data))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(delay);
  }, [search]);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link to="/clinic" className="text-gray-400">←</Link>
          <h1 className="font-bold text-gray-900 text-lg">Patients</h1>
        </div>
        <Link
          to="/clinic/patients/add"
          className="bg-teal-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl"
        >
          + Add Patient
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-4">
        {/* Search */}
        <input
          type="search"
          placeholder="Search by name or mobile..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base mb-4 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />

        {loading ? (
          <div className="text-center text-gray-400 py-16">Loading...</div>
        ) : (
          <div className="space-y-2">
            {patients.map((p) => (
              <Link key={p.id} to={`/clinic/patients/${p.id}`}>
                <div className="bg-white rounded-2xl border border-gray-200 px-4 py-4 flex items-center justify-between hover:border-teal-300 transition-colors">
                  <div>
                    <p className="font-semibold text-gray-900">{p.name}</p>
                    <p className="text-gray-500 text-sm">{p.mobile}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-sm">{p.age ? `${p.age} yrs` : ''}</p>
                    <p className="text-gray-400 text-xs">{p.gender}</p>
                  </div>
                </div>
              </Link>
            ))}
            {patients.length === 0 && !loading && (
              <div className="text-center py-16">
                <p className="text-gray-400">No patients found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
