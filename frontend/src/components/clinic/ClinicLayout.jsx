import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const NAV = [
  { to: '/clinic', label: 'Today', icon: '📅' },
  { to: '/clinic/patients', label: 'Patients', icon: '👥' },
  { to: '/clinic/messages', label: 'Messages', icon: '💬' },
];

export default function ClinicLayout({ title, rightAction, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Match active tab — /clinic/patients/add should still highlight Patients
  function isActive(to) {
    if (to === '/clinic') return pathname === '/clinic';
    return pathname.startsWith(to);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <span className="text-xl">🦷</span>
          <div>
            <span className="font-bold text-teal-600 text-base">{title || 'DentGrow'}</span>
            {user?.name && (
              <p className="text-xs text-gray-400 leading-none">{user.name}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {rightAction}
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="text-xs text-gray-400 px-2 py-1 rounded-lg hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Page content — padded so bottom nav doesn't cover content */}
      <main className="flex-1 pb-20">
        {children}
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
        <div className="max-w-2xl mx-auto flex">
          {NAV.map(({ to, label, icon }) => {
            const active = isActive(to);
            return (
              <Link
                key={to}
                to={to}
                className={`flex-1 flex flex-col items-center justify-center py-3 gap-0.5 text-xs font-medium transition-colors
                  ${active ? 'text-teal-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <span className="text-xl leading-none">{icon}</span>
                <span>{label}</span>
                {active && <span className="absolute bottom-0 w-10 h-0.5 bg-teal-600 rounded-full" />}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
