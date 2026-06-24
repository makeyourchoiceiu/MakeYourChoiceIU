import LanguageSwitcher from '../components/LanguageToggle';
import {ReactNode} from "react";

export const AppLayout = ({ children }: { children: ReactNode }) => (
  <div>
    <nav className="flex justify-between p-4 bg-gray-800 text-white">
      <div>My Electives</div>
      <LanguageSwitcher />   {/* ✅ add this */}
    </nav>
    <main>{children}</main>
  </div>
);