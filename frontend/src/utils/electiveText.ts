export type Locale = 'en' | 'ru';

export const ELECTIVE_TEXT = {
    en: {
        meta: {
            teacher: 'Teacher',
            language: 'Language',
            program: 'Program',
            year: 'Year',
            prerequisite: 'Prerequisite',
            status: 'Status',
            type: 'Type',
            degreeYears: 'Degree years',
        },
        statuses: {
            active: 'Active',
            archived: 'Archived',
            deleted: 'Deleted',
        },
        actions: {
            seeMore: 'See more',
            edit: 'Edit',
            archive: 'Archive',
            unarchive: 'Unarchive',
            delete: 'Delete',
            restore: 'Restore',
            addFav: 'Add to favourites',
            removeFav: 'Remove from favourites',
            openMenu: 'Open menu',
            close: 'Close',
        },
        hints: {
            matchInFullDescription: 'Match found in full description',
        },
    },
    ru: {
        meta: {
            teacher: 'Преподаватель',
            language: 'Язык',
            program: 'Программа',
            year: 'Курс',
            prerequisite: 'Пререквизиты',
            status: 'Статус',
            type: 'Тип',
            degreeYears: 'Годы обучения',
        },
        statuses: {
            active: 'Активный',
            archived: 'В архиве',
            deleted: 'Удалённый',
        },
        actions: {
            seeMore: 'Подробнее',
            edit: 'Редактировать',
            archive: 'Архивировать',
            unarchive: 'Вернуть из архива',
            delete: 'Удалить',
            restore: 'Восстановить',
            addFav: 'В избранное',
            removeFav: 'Убрать из избранного',
            openMenu: 'Открыть меню',
            close: 'Закрыть',
        },
        hints: {
            matchInFullDescription: 'Совпадение найдено в полном описании',
        },
    },
} as const;
