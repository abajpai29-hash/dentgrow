import { useEffect, useState } from 'react';
import client from '../../api/client';
import ClinicLayout from '../../components/clinic/ClinicLayout';

const STATUS_COLORS = {
  sent: 'bg-blue-100 text-blue-700',
  delivered: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-600',
  pending: 'bg-gray-100 text-gray-500',
};

export default function ClinicMessagesLog() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get('/messages')
      .then((res) => setMessages(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ClinicLayout title="Messages">
      <div className="max-w-2xl mx-auto px-4 py-4">
        {loading ? (
          <div className="text-center text-gray-400 py-16">Loading...</div>
        ) : (
          <div className="space-y-2">
            {messages.map((msg) => (
              <div key={msg.id} className="bg-white rounded-2xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-gray-900">{msg.patients?.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[msg.delivery_status]}`}>
                    {msg.delivery_status}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">{msg.message_body}</p>
                <p className="text-gray-400 text-xs mt-2">
                  {new Date(msg.sent_at).toLocaleString('en-IN', {
                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true,
                    timeZone: 'Asia/Kolkata',
                  })}
                </p>
              </div>
            ))}
            {messages.length === 0 && (
              <div className="text-center py-16 text-gray-400">No messages sent yet</div>
            )}
          </div>
        )}
      </div>
    </ClinicLayout>
  );
}
