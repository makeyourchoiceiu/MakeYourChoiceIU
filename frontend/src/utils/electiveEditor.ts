import type { Elective, ElectiveStatus } from '../types/elective';
import type {
    ElectiveEditorDraft,
    ElectiveEditorTypeOption,
} from '../types/electiveEditor';
import type { AdminSidebarItem } from '../types/adminSidebar';
import type { UpdateElectivePayload } from '../api/electives';
import { normalizeStoredMarkdown } from './markdown';

/**
 * Пустой draft для add flow.
 * Если есть prefilledType, подставляем его в type field.
 */
export function createEmptyElectiveDraft(prefilledType = ''): ElectiveEditorDraft {
    return {
        electiveType: prefilledType,
        title: '',
        teacher: '',
        language: '',
        program: '',
        yearsOfStudy: [],
        prerequisite: '',
        description: '',
    };
}

/**
 * Маппим существующий Elective в draft редактора.
 * Это нужно для режима edit.
 */
export function mapElectiveToEditorDraft(elective: Elective): ElectiveEditorDraft {
    return {
        electiveType: elective.electiveType,
        title: elective.name,
        teacher: elective.instructor,
        language: elective.programLanguage === 'RUS' ? 'RUS' : 'ENG',
        program:
            elective.programLanguage === 'ENG' || elective.programLanguage === 'RUS'
                ? elective.programLanguage
                : '',
        yearsOfStudy: elective.degreeYear,
        prerequisite: elective.prerequisite,
        description: normalizeStoredMarkdown(elective.description),
    };
}

/**
 * Все поля, которые считаем обязательными для полноценной публикации.
 * Если хотя бы одно пустое -> Save disabled, Save as draft enabled.
 */
export function isElectiveDraftComplete(draft: ElectiveEditorDraft): boolean {
    return (
        draft.electiveType.trim() !== '' &&
        draft.title.trim() !== '' &&
        draft.teacher.trim() !== '' &&
        draft.language !== '' &&
        draft.program !== '' &&
        draft.yearsOfStudy.length > 0 &&
        draft.description.trim() !== ''
    );
}


function mapEditorLanguageToApi(language: 'ENG' | 'RUS' | ''): string {
    if (language === 'ENG') {
        return 'english';
    }

    if (language === 'RUS') {
        return 'russian';
    }

    return '';
}

/**
 * Строим payload для create/update.
 *
 * Важно:
 * - фронт работает с удобным draft
 * - бэк ждёт snake_case и свои имена полей
 */
export function mapDraftToElectivePayload(
    draft: ElectiveEditorDraft,
    status: ElectiveStatus
): UpdateElectivePayload {
    return {
        name: draft.title.trim(),
        instructor: draft.teacher.trim(),
        description: draft.description.trim(),
        elective_language: mapEditorLanguageToApi(draft.language),
        prerequisite: draft.prerequisite.trim(),
        elective_type: draft.electiveType.trim(),
        program_language: draft.program,
        degree_year: draft.yearsOfStudy,
        status,
    };
}
/**
 * Sidebar items -> options для select в редакторе.
 * Исключаем 'all', потому что это не реальный тип электива.
 */
export function mapSidebarItemsToEditorTypeOptions(
    items: AdminSidebarItem[]
): ElectiveEditorTypeOption[] {
    return items
        .filter((item) => item.kind === 'type' && Boolean(item.electiveType))
        .map((item) => ({
            value: item.electiveType ?? '',
            label: item.title,
        }));
}
