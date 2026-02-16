import type { ElectiveType } from '../types/electives';

export type ElectiveTypeTab = {
    type: ElectiveType;      // 'tech' | 'hum' | 'math' | 'custom'
    title: string;           // название вкладки (можно локализовать на бэке)
};

export async function getAvailableElectiveTypes(groupId: string, locale: 'en' | 'ru'): Promise<ElectiveTypeTab[]> {
    // TODO: заменить на реальный запрос:
    // return axios.get(`${API_URL}/groups/${groupId}/elective-types`, { params: { locale } }).then(r => r.data);

    await new Promise((r) => setTimeout(r, 150));

    // мок: будто админ настроил для этой группы только tech + hum
    const tabsEn: ElectiveTypeTab[] = [
        { type: 'tech', title: 'Tech electives' },
        { type: 'hum', title: 'Hum electives' },
    ];

    const tabsRu: ElectiveTypeTab[] = [
        { type: 'tech', title: 'Тех. элективы' },
        { type: 'hum', title: 'Гум. элективы' },
    ];

    return locale === 'ru' ? tabsRu : tabsEn;
}
