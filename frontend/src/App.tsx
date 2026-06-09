import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './shared/components/LanguageSwitcher';

// Placeholder pages using translations
const HomePage = () => {
  const { t } = useTranslation();
  return <h1 className="text-2xl">{t('pages.home.welcome', 'Welcome to Elective Courses')}</h1>;
};

const CoursesPage = () => {
  const { t } = useTranslation();
  return <h1 className="text-2xl">{t('pages.course_list.title', 'Course List')}</h1>;
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

  return (
    <BrowserRouter>
      {/* Navigation bar with language switcher */}
      <nav className="p-4 bg-gray-800 text-white flex justify-between items-center">
        <div className="flex gap-4">
          <Link to="/">{t('nav.home', 'Home')}</Link>
          <Link to="/courses">{t('nav.courses', 'Courses')}</Link>
          <Link to="/dashboard">{t('nav.dashboard', 'Dashboard')}</Link>
          <Link to="/login">{t('nav.login', 'Login')}</Link>
        </div>
        <LanguageSwitcher />
      </nav>

      {/* Routes */}
      <div className="p-6">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:id" element={<CourseDetailPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;