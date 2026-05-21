import { Routes, Route, Navigate } from 'react-router-dom';
import App from './App';

export const routeViews = [
  'home',
  'explorer',
  'about',
  'privacy',
  'terms',
  'dashboard',
  'messenger',
  'live',
  'reels',
  'newsfeed',
  'profile',
  'timeline',
  'confession',
  'feedbacks',
  'lostfound',
  'scheduler'
] as const;

export type ViewType = typeof routeViews[number];

// Wrapper component to handle all routes - each route element is a simple wrapper
const HomeView = () => <App />;
const ExplorerView = () => <App />;
const AboutView = () => <App />;
const PrivacyView = () => <App />;
const TermsView = () => <App />;
const DashboardView = () => <App />;
const MessengerView = () => <App />;
const LiveView = () => <App />;
const ReelsView = () => <App />;
const NewsfeedView = () => <App />;
const ProfileView = () => <App />;
const TimelineView = () => <App />;
const ConfessionView = () => <App />;
const FeedbacksView = () => <App />;
const LostFoundView = () => <App />;
const SchedulerView = () => <App />;

export const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/home" replace />} />
    <Route path="/home" element={<HomeView />} />
    <Route path="/explorer" element={<ExplorerView />} />
    <Route path="/about" element={<AboutView />} />
    <Route path="/privacy" element={<PrivacyView />} />
    <Route path="/terms" element={<TermsView />} />
    <Route path="/dashboard" element={<DashboardView />} />
    <Route path="/messenger" element={<MessengerView />} />
    <Route path="/live" element={<LiveView />} />
    <Route path="/reels" element={<ReelsView />} />
    <Route path="/newsfeed" element={<NewsfeedView />} />
    <Route path="/profile" element={<ProfileView />} />
    <Route path="/timeline" element={<TimelineView />} />
    <Route path="/confession" element={<ConfessionView />} />
    <Route path="/feedbacks" element={<FeedbacksView />} />
    <Route path="/lostfound" element={<LostFoundView />} />
    <Route path="/scheduler" element={<SchedulerView />} />
    <Route path="*" element={<Navigate to="/home" replace />} />
  </Routes>
);
