import LanguageSwitcher from '../components/LanguageSwitcher';

export const AppLayout = ({ children }) => (
  <div>
    <nav className="flex justify-between p-4 bg-gray-800 text-white">
      <div>My Courses</div>
      <LanguageSwitcher />   {/* ✅ add this */}
    </nav>
    <main>{children}</main>
  </div>
);