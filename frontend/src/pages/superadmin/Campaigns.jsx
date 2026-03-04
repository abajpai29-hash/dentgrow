import { Link } from 'react-router-dom';

export default function AdminCampaigns() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link to="/admin" className="text-gray-400 hover:text-gray-200">← Back</Link>
        <span className="font-semibold">Broadcast Campaigns</span>
      </nav>
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <p className="text-4xl mb-4">📢</p>
        <h2 className="text-xl font-semibold mb-2">WhatsApp Broadcast Campaigns</h2>
        <p className="text-gray-400 mb-1">Coming in Phase 2 — Growth tier feature</p>
        <p className="text-gray-500 text-sm max-w-md mx-auto mt-3">
          Create targeted WhatsApp campaigns for any clinic. Segment by inactive patients,
          treatment type, or all patients. Schedule and track delivery.
        </p>
      </div>
    </div>
  );
}
