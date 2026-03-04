import { Link } from 'react-router-dom';

export default function AdminReviews() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link to="/admin" className="text-gray-400 hover:text-gray-200">← Back</Link>
        <span className="font-semibold">Google Reviews</span>
      </nav>
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <p className="text-4xl mb-4">⭐</p>
        <h2 className="text-xl font-semibold mb-2">Google Review Automation</h2>
        <p className="text-gray-400 mb-1">Coming in Phase 2 — Growth tier feature</p>
        <p className="text-gray-500 text-sm max-w-md mx-auto mt-3">
          Automatically send Google review requests 48 hours after a completed appointment.
          Track reviews collected per clinic and estimated star rating trends.
        </p>
        <div className="mt-6 inline-block bg-gray-900 border border-gray-800 rounded-xl px-6 py-3 text-sm text-gray-400">
          Available for Growth & Partner plans
        </div>
      </div>
    </div>
  );
}
