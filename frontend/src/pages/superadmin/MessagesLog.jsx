import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import client from '../../api/client';

const STATUS_COLORS = {
  sent: 'bg-blue-900 text-blue-300',
  delivered: 'bg-green-900 text-green-300',
  failed: 'bg-red-900 text-red-300',
  pending: 'bg-gray-800 text-gray-400',
};

export default function AdminMessagesLog() {
  const [searchParams] = useSearchParams();
  const clinicId = searchParams.get('clinic_id');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const params = {};
    if (clinicId) params.clinic_id = clinicId;
    if (filter !== 'all') params.status = filter;
    client.get('/messages', { params })
      .then((res) => setMessages(res.data))
      .finally(() => setLoading(false));
  }, [clinicId, filter]);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link to="/admin" className="text-gray-400 hover:text-gray-200">← Back</Link>
        <span className="font-semibold">Messages Log</span>
        {clinicId && <span className="text-gray-500 text-sm">filtered by clinic</span>}
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {['all', 'sent', 'delivered', 'failed'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`text-sm px-4 py-2 rounded-lg transition-colors ${
                filter === s
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-gray-500 text-center py-12">Loading messages...</div>
        ) : (
          <div className="space-y-2">
            {messages.map((msg) => (
              <div key={msg.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-200">
                        {msg.patients?.name || 'Unknown'}
                      </span>
                      <span className="text-gray-600">·</span>
                      <span className="text-xs text-gray-500">{msg.clinics?.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[msg.delivery_status]}`}>
                        {msg.delivery_status}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm truncate">{msg.message_body}</p>
                    <p className="text-gray-600 text-xs mt-1">{msg.type}</p>
                  </div>
                  <p className="text-gray-600 text-xs whitespace-nowrap">
                    {new Date(msg.sent_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                  </p>
                </div>
              </div>
            ))}
            {messages.length === 0 && (
              <div className="text-gray-500 text-center py-12">No messages found</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
