import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react'; // <-- import useEffect
import toast from 'react-hot-toast';
import type { Elective } from '@/shared/types/elective';

interface SidebarProps {
  deadline: string;
  activeType: 'main_menu' | 'tech' | 'hum' | 'math' | 'all';
  onSelectType: (type: 'main_menu' | 'tech' | 'hum' | 'math' | 'all') => void;
  electives: Elective[];
  onSubmitSelected?: (ids: string[], type: string) => Promise<void>;
}

export const Sidebar = ({
                          deadline,
                          activeType,
                          onSelectType,
                          electives,
                          onSubmitSelected,
                        }: SidebarProps) => {
  const { t } = useTranslation();
  const [selectedIds, setSelectedIds] = useState<(string | null)[]>(
    Array(5).fill(null)
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSelectedIds(Array(5).fill(null));
  }, [activeType]);

  const getFilteredElectives = (): Elective[] => {
    if (activeType === 'main_menu' || activeType === 'all') {
      return electives;
    }
    return electives.filter((e) => e.type === activeType);
  };

  const filtered = getFilteredElectives();

  const handleSelectChange = (index: number, value: string) => {
    const newSelected = [...selectedIds];
    newSelected[index] = value === '' ? null : value;
    setSelectedIds(newSelected);
  };

  const handleSubmit = async () => {
    const filled = selectedIds.filter((id): id is string => id !== null);
    if (filled.length === 0) {
      toast.error(t('sidebar.toast.noSelection'));
      return;
    }

    const firstSelected = filtered.find(e => e.id === filled[0]);
    if (!firstSelected) {
      toast.error(t('sidebar.toast.invalidSelection'));
      return;
    }
    const backendType = firstSelected.backendType;

    const allSame = filled.every(id => {
      const el = filtered.find(e => e.id === id);
      return el?.backendType === backendType;
    });
    if (!allSame) {
      toast.error(t('sidebar.toast.mixedTypes'));
      return;
    }

    const uniqueIds = new Set(filled);
    if (uniqueIds.size !== filled.length) {
      toast.error(t('sidebar.toast.duplicate'));
      return;
    }

    if (!onSubmitSelected) {
      toast.error(t('sidebar.toast.noHandler'));
      return;
    }

    setLoading(true);
    try {
      await onSubmitSelected(filled, backendType);
      toast.success(t('sidebar.toast.success'));
      setSelectedIds(Array(5).fill(null));
    } catch (err) {
      const message = err instanceof Error ? err.message : t('sidebar.toast.error');
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedIds(Array(5).fill(null));
  };

  return (
    <div className="w-64 sticky top-14 h-[calc(100vh-3.5rem)] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-5 flex flex-col gap-4 overflow-y-auto z-10">
      {/* Navigation buttons – unchanged */}
      <nav className="space-y-3 text-bold font-medium">
        <button
          onClick={() => onSelectType('main_menu')}
          className={`w-full text-left font-bold cursor-pointer transition-colors ${
            activeType === 'main_menu'
              ? 'text-gray-800 dark:text-gray-200'
              : 'text-green-iu hover:text-hover-green-iu dark:text-green-iu dark:hover:text-dark-hover-green-iu'
          }`}
        >
          {t('nav.main_menu')}
        </button>
        <button
          onClick={() => onSelectType('tech')}
          className={`w-full text-left font-bold cursor-pointer transition-colors ${
            activeType === 'tech'
              ? 'text-gray-800 dark:text-gray-200'
              : 'text-green-iu hover:text-hover-green-iu dark:text-green-iu dark:hover:text-dark-hover-green-iu'
          }`}
        >
          {t('nav.technical')}
        </button>
        <button
          onClick={() => onSelectType('hum')}
          className={`w-full text-left font-bold cursor-pointer transition-colors ${
            activeType === 'hum'
              ? 'text-gray-800 dark:text-gray-200'
              : 'text-green-iu hover:text-hover-green-iu dark:text-green-iu dark:hover:text-dark-hover-green-iu'
          }`}
        >
          {t('nav.humanitarian')}
        </button>
        <button
          onClick={() => onSelectType('math')}
          className={`w-full text-left font-bold cursor-pointer transition-colors ${
            activeType === 'math'
              ? 'text-gray-800 dark:text-gray-200'
              : 'text-green-iu hover:text-hover-green-iu dark:text-green-iu dark:hover:text-dark-hover-green-iu'
          }`}
        >
          {t('nav.mathematical')}
        </button>
      </nav>

      <div className="mt-auto">
        <div className="items-center justify-between mb-4">
          <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded flex flex-col gap-1 relative">
            <div className="text-red-600 dark:text-red-400 font-bold text-sm text-center">
              {t('sidebar.deadline')}:
            </div>
            <div className="text-red-600 dark:text-red-400 font-bold text-sm text-center">
              {deadline}
            </div>
          </div>
        </div>

        <h4 className="font-bold mb-2 border-b border-green-iu inline-block pb-1 text-sm text-gray-800 dark:text-gray-200">
          {t('sidebar.form')}
        </h4>

        <div className="space-y-2 mt-3">
          {[0, 1, 2, 3, 4].map((index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="font-bold text-gray-700 dark:text-gray-300 text-xs w-4">
                {index + 1}.
              </span>
              <select
                value={selectedIds[index] ?? ''}
                onChange={(e) => handleSelectChange(index, e.target.value)}
                className="w-full pr-4 bg-gray-200 dark:bg-gray-700 rounded-sm h-6 px-1 border-none outline-none text-sm text-gray-800 dark:text-gray-200"
                disabled={loading}
              >
                <option value="">— {t('sidebar.select_placeholder')} —</option>
                {filtered.map((elective) => (
                  <option key={elective.id} value={elective.id}>
                    {elective.title}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`bg-green-iu hover:bg-hover-green-iu dark:bg-green-iu dark:hover:bg-dark-hover-green-iu text-white font-bold py-1.5 px-4 rounded text-sm flex-1 shadow-md ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? t('sidebar.submitting') : t('sidebar.submit')}
          </button>
          <button
            onClick={handleReset}
            className="bg-gray-400 hover:bg-gray-500 text-white p-1.5 rounded-full"
            aria-label="Reset selections"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};