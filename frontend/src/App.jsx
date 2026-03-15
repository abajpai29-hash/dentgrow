import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Pages
import Login from './pages/Login';
// Super admin
import AdminDashboard from './pages/superadmin/Dashboard';
import AdminClinicDetail from './pages/superadmin/ClinicDetail';
import AdminMessagesLog from './pages/superadmin/MessagesLog';
import AdminReviews from './pages/superadmin/Reviews';
import AdminCampaigns from './pages/superadmin/Campaigns';
import AdminReports from './pages/superadmin/Reports';
// Clinic portal
import ClinicToday from './pages/clinic/Today';
import ClinicPatients from './pages/clinic/Patients';
import AddPatient from './pages/clinic/AddPatient';
import AddAppointment from './pages/clinic/AddAppointment';
import PatientDetail from './pages/clinic/PatientDetail';
import EditPatient from './pages/clinic/EditPatient';
import ClinicMessagesLog from './pages/clinic/MessagesLog';
import Upcoming from './pages/clinic/Upcoming';
import ClinicDashboard from './pages/clinic/ClinicDashboard';

function RequireAuth({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/login" replace />;
  return children;
}

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'superadmin') return <Navigate to="/admin" replace />;
  return <Navigate to="/clinic" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />

          {/* Super Admin Routes */}
          <Route path="/admin" element={
            <RequireAuth role="superadmin"><AdminDashboard /></RequireAuth>
          } />
          <Route path="/admin/clinics/:id" element={
            <RequireAuth role="superadmin"><AdminClinicDetail /></RequireAuth>
          } />
          <Route path="/admin/messages" element={
            <RequireAuth role="superadmin"><AdminMessagesLog /></RequireAuth>
          } />
          <Route path="/admin/reviews" element={
            <RequireAuth role="superadmin"><AdminReviews /></RequireAuth>
          } />
          <Route path="/admin/campaigns" element={
            <RequireAuth role="superadmin"><AdminCampaigns /></RequireAuth>
          } />
          <Route path="/admin/reports" element={
            <RequireAuth role="superadmin"><AdminReports /></RequireAuth>
          } />

          {/* Clinic Portal Routes */}
          <Route path="/clinic" element={
            <RequireAuth><ClinicToday /></RequireAuth>
          } />
          <Route path="/clinic/patients" element={
            <RequireAuth><ClinicPatients /></RequireAuth>
          } />
          <Route path="/clinic/patients/add" element={
            <RequireAuth><AddPatient /></RequireAuth>
          } />
          <Route path="/clinic/patients/:id" element={
            <RequireAuth><PatientDetail /></RequireAuth>
          } />
          <Route path="/clinic/patients/:id/edit" element={
            <RequireAuth><EditPatient /></RequireAuth>
          } />
          <Route path="/clinic/appointments/add" element={
            <RequireAuth><AddAppointment /></RequireAuth>
          } />
          <Route path="/clinic/messages" element={
            <RequireAuth><ClinicMessagesLog /></RequireAuth>
          } />
          <Route path="/clinic/upcoming" element={
            <RequireAuth><Upcoming /></RequireAuth>
          } />
          <Route path="/clinic/dashboard" element={
            <RequireAuth><ClinicDashboard /></RequireAuth>
          } />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}
