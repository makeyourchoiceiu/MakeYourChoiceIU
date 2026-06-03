import type {
    StudentProfileElectiveType,
    StudentSidebarSection,
} from '../types/studentSidebar';

/**
 * Строит sidebar-секции для student page.
 *
 * Всегда добавляем main,
 * потом добавляем доступные студенту типы элективов.
 */
export function buildStudentSidebarSections(
    electiveTypes: StudentProfileElectiveType[]
): StudentSidebarSection[] {
    return [
        {
            key: 'main',
            label: 'Main',
            kind: 'main',
        },
        ...electiveTypes.map((item) => ({
            key: `type-${item.type}`,
            label: item.label,
            kind: 'elective-type' as const,
            electiveType: item.type,
            requiredCount: item.requiredCount,
        })),
    ];
}