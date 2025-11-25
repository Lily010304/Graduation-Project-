// App entrypoint
import './index.css';
import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import FullPageSlider from './components/FullPageSlider';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import Login from './components/Login.jsx';
import ManagerDashboard from './components/ManagerDashboard.jsx';
import InstructorRegister from './components/InstructorRegister.jsx';
import RegisterChooser from './components/RegisterChooser.jsx';
import StudentRegister from './components/StudentRegister.jsx';
import ParentRegister from './components/ParentRegister.jsx';
import EmailConfirmation from './components/EmailConfirmation.jsx';
import StudentDashboard from './components/StudentDashboard.jsx';
import InstructorDashboard from './components/InstructorDashboard.jsx';

const queryClient = new QueryClient();

function useHashRoute() {
  const [hash, setHash] = useState(window.location.hash || '#/');
  useEffect(() => {
    const onChange = () => setHash(window.location.hash || '#/');
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return hash;
}

const AppContent = () => {
  const hash = useHashRoute();
  if (hash.startsWith('#/confirm-email')) return <EmailConfirmation />;
  if (hash.startsWith('#/login')) return <Login />;
  if (hash.startsWith('#/manager')) return <ManagerDashboard />;
  if (hash.startsWith('#/register/instructor')) return <InstructorRegister />;
  if (hash.startsWith('#/register/student')) return <StudentRegister />;
  if (hash.startsWith('#/register/parent')) return <ParentRegister />;
  if (hash.startsWith('#/register')) return <RegisterChooser />;
  if (hash.startsWith('#/dashboard/student')) return <StudentDashboard />;
  if (hash.startsWith('#/dashboard/instructor')) return <InstructorDashboard />;
  return <FullPageSlider />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  </QueryClientProvider>
);

export default App;
