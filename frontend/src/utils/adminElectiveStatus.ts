import type { ElectiveStatus } from '../types/elective';
import { ELECTIVE_TEXT, type Locale } from './electiveText';

export interface AdminElectiveStatusPresentation {
    label: string;
    tone: 'active' | 'archived' | 'deleted';
}

export function getAdminElectiveStatusPresentation(
    status: ElectiveStatus,
    locale: Locale
): AdminElectiveStatusPresentation {
    const statusText = ELECTIVE_TEXT[locale].statuses;

    if (status === 1) {
        return {
            label: statusText.active,
            tone: 'active',
        };
    }

    if (status === 0) {
        return {
            label: statusText.archived,
            tone: 'archived',
        };
    }

    return {
        label: statusText.deleted,
        tone: 'deleted',
    };
}
