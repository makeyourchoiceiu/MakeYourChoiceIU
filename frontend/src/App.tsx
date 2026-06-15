import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import ThemeToggle from '@/shared/components/ThemeToggle';
import LanguageToggle from '@/shared/components/LanguageToggle';
import CoursesPage from '@/pages/CoursesPage';
import { useProfileStore } from '@/stores/profileStore';

// Placeholder pages using translations
const HomePage = () => {
  const { t } = useTranslation();
  return <h1 className="text-2xl">{t('pages.home.welcome', 'Welcome to Elective Courses')}</h1>;
};

const CourseDetailPage = () => {
  const { t } = useTranslation();
  return <h1 className="text-2xl">{t('pages.course_detail.title', 'Course Details')}</h1>;
};

const DashboardPage = () => {
  const { t } = useTranslation();
  return <h1 className="text-2xl">{t('pages.dashboard.title', 'My Dashboard')}</h1>;
};

const LoginPage = () => {
  const { t } = useTranslation();
  return <h1 className="text-2xl">{t('pages.login.title', 'Login Page')}</h1>;
};

function App() {
  const { t } = useTranslation();
  const { loadProfile, student, loading } = useProfileStore();

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  if (loading && !student) {
    return <div className="flex min-h-screen items-center justify-center">Loading your profile...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <BrowserRouter>
        {/* Navigation bar with language switcher */}
        <nav className="p-4 bg-white dark:bg-gray-800 text-black dark:text-white flex justify-between items-center">
          <div className="flex gap-4">
            <Link to="/">{t('nav.home', 'Home')}</Link>
            <Link to="/courses">{t('nav.courses', 'Courses')}</Link>
            <Link to="/dashboard">{t('nav.dashboard', 'Dashboard')}</Link>
            <Link to="/login">{t('nav.login', 'Login')}</Link>
          </div>
          <div className="flex items-center gap-4">
            <LanguageToggle />
            <ThemeToggle />
          </div>
          {/*<div className="bg-gray-100 dark:bg-gray-900 text-black dark:text-white">*/}
          {/*  <h1 className="text-2xl">This adapts to theme</h1>*/}
          {/*</div>*/}
        </nav>


        {/* Routes */}
        <div className="p-0">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/courses/:id" element={<CourseDetailPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;