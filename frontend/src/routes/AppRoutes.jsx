import { Navigate, Route, Routes } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import OAuthCallback from '../pages/OAuthCallback';
import CreateStartupPage from '../pages/CreateStartupPage';
import InvestorProfilePage from '../pages/InvestorProfilePage';
import FounderDashboardPage from '../pages/FounderDashboardPage';
import InvestorDashboardPage from '../pages/InvestorDashboardPage';
import AdminUsersPage from '../pages/AdminUsersPage';
import DashboardSectionPage from '../pages/DashboardSectionPage';
import KnowledgeHub from '../pages/KnowledgeHub';
import StartupsPage from '../pages/StartupsPage';
import InvestorsPage from '../pages/InvestorsPage';
import StartupProfilePage from '../pages/StartupProfilePage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/dashboard/founder" element={<FounderDashboardPage />} />
      <Route path="/dashboard/founder/chat" element={<DashboardSectionPage role="founder" section="chat" />} />
      <Route path="/dashboard/founder/deals" element={<DashboardSectionPage role="founder" section="deals" />} />
      <Route path="/dashboard/founder/settings" element={<DashboardSectionPage role="founder" section="settings" />} />
      <Route path="/dashboard/founder/help" element={<DashboardSectionPage role="founder" section="help" />} />
      <Route path="/dashboard/investor" element={<InvestorDashboardPage />} />
      <Route path="/dashboard/investor/filters" element={<DashboardSectionPage role="investor" section="filters" />} />
      <Route path="/dashboard/investor/chat" element={<DashboardSectionPage role="investor" section="chat" />} />
      <Route path="/dashboard/investor/deals" element={<DashboardSectionPage role="investor" section="deals" />} />
      <Route path="/dashboard/investor/settings" element={<DashboardSectionPage role="investor" section="settings" />} />
      <Route path="/dashboard/investor/help" element={<DashboardSectionPage role="investor" section="help" />} />
      <Route path="/dashboard/admin/users" element={<AdminUsersPage />} />
      <Route path="/oauth-callback" element={<OAuthCallback />} />
      <Route path="/knowledge" element={<KnowledgeHub />} />
      <Route path="/startups" element={<StartupsPage />} />
      <Route path="/startup/:id" element={<StartupProfilePage />} />
      <Route path="/investors" element={<InvestorsPage />} />
      <Route path="/create-startup" element={<CreateStartupPage />} />
      <Route path="/investor-profile" element={<InvestorProfilePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}