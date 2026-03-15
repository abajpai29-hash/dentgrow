import ClinicLayout from '../../components/clinic/ClinicLayout';

export default function ClinicDashboard() {
  return (
    <ClinicLayout title="Dashboard">
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-5xl mb-4">📊</p>
        <p className="text-xl font-bold text-gray-800 mb-2">Analytics coming soon</p>
        <p className="text-gray-400 text-sm">Patients seen, no-show rate, messages sent, reviews generated — all in one view.</p>
      </div>
    </ClinicLayout>
  );
}
