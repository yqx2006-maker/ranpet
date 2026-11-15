import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { AuthPage } from './pages/AuthPage';
import { CommunityPage } from './pages/CommunityPage';
import { DashboardPage } from './pages/DashboardPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { PetPage } from './pages/PetPage';
import { ProfilePage } from './pages/ProfilePage';
import { ProgressPage } from './pages/ProgressPage';
import { TrainingPage } from './pages/TrainingPage';
import { WorkoutSessionPage } from './pages/WorkoutSessionPage';
import { WorkoutSummaryPage } from './pages/WorkoutSummaryPage';
import { useAppStore } from './store/useAppStore';

function AppRoutes() {
  const currentUserId = useAppStore((state) => state.currentUserId);
  const user = useAppStore((state) =>
    state.users.find((item) => item.id === state.currentUserId),
  );
  const ensurePlan = useAppStore((state) => state.ensurePlan);
  const syncDaily = useAppStore((state) => state.syncDaily);

  useEffect(() => {
    if (!currentUserId) return;
    ensurePlan();
    syncDaily();
  }, [currentUserId, ensurePlan, syncDaily]);

  if (!currentUserId || !user) {
    return <AuthPage />;
  }

  if (!user.onboarded) {
    return <OnboardingPage />;
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="training" element={<TrainingPage />} />
        <Route path="progress" element={<ProgressPage />} />
        <Route path="community" element={<CommunityPage />} />
        <Route path="pet" element={<PetPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
      <Route path="session/:date" element={<WorkoutSessionPage />} />
      <Route path="summary/:logId" element={<WorkoutSummaryPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <AppRoutes />
    </BrowserRouter>
  );
}
