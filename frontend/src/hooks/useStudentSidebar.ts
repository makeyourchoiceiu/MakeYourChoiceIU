import { useMemo, useState } from 'react';
import type {
    StudentProfileElectiveType,
    StudentSidebarSection,
} from '../types/studentSidebar';
import { buildStudentSidebarSections } from '../utils/studentSidebar';

interface UseStudentSidebarParams {
    electiveTypes: StudentProfileElectiveType[];
}

interface UseStudentSidebarResult {
    sections: StudentSidebarSection[];
    activeSectionKey: string;
    activeSection: StudentSidebarSection | null;
    setActiveSectionKey: (key: string) => void;
}

/**
 * Хук:
 * - собирает sidebar-секции
 * - хранит выбранный key
 * - вычисляет валидную активную секцию без useEffect
 */
export function useStudentSidebar({
                                      electiveTypes,
                                  }: UseStudentSidebarParams): UseStudentSidebarResult {
    const sections = useMemo(
        () => buildStudentSidebarSections(electiveTypes),
        [electiveTypes]
    );

    const [selectedSectionKey, setSelectedSectionKey] = useState('main');

    /**
     * Если текущий выбранный key существует в sections — используем его.
     * Если нет, откатываемся на первую доступную секцию.
     *
     * Это derived value, поэтому useEffect не нужен.
     */
    const activeSectionKey = useMemo(() => {
        const exists = sections.some((section) => section.key === selectedSectionKey);

        if (exists) {
            return selectedSectionKey;
        }

        return sections[0]?.key ?? 'main';
    }, [sections, selectedSectionKey]);

    const activeSection = useMemo(
        () => sections.find((section) => section.key === activeSectionKey) ?? null,
        [sections, activeSectionKey]
    );

    return {
        sections,
        activeSectionKey,
        activeSection,
        setActiveSectionKey: setSelectedSectionKey,
    };
}