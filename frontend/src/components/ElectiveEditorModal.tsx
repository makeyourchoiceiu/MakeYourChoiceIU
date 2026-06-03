import { ElectiveModal } from './ElectiveModal';
import { ElectiveEditorForm } from './ElectiveEditorForm';
import type {
    ElectiveEditorDraft,
    ElectiveEditorMode,
    ElectiveEditorTypeOption,
} from '../types/electiveEditor';
import { isElectiveDraftComplete } from '../utils/electiveEditor';
import buttonStyles from '../styles/button.module.css';

interface ElectiveEditorModalProps {
    open: boolean;
    mode: ElectiveEditorMode;
    draft: ElectiveEditorDraft;
    typeOptions: ElectiveEditorTypeOption[];
    onClose: () => void;
    onChangeField: <K extends keyof ElectiveEditorDraft>(
        key: K,
        value: ElectiveEditorDraft[K]
    ) => void;
    onSave: () => void;
    saving?: boolean;
    locale: 'en' | 'ru';
}

const TEXT = {
    en: {
        addTitle: 'Add elective',
        editTitle: 'Edit elective',
        cancel: 'Cancel',
        save: 'Save',
        hint: 'Description supports Markdown. Toolbar buttons insert basic formatting. TODO: improve paste handling from Word/Docs.',
        fields: {
            type: 'Type',
            title: 'Title',
            teacher: 'Teacher',
            language: 'Language',
            program: 'Program',
            yearsOfStudy: 'Years of study',
            prerequisite: 'Prerequisite',
            description: 'Description',
        },
    },
    ru: {
        addTitle: 'Добавить электив',
        editTitle: 'Редактировать электив',
        cancel: 'Отмена',
        save: 'Сохранить',
        hint: 'Описание поддерживает Markdown. Кнопки панели вставляют базовое форматирование. TODO: улучшить вставку из Word/Docs.',
        fields: {
            type: 'Тип',
            title: 'Название',
            teacher: 'Преподаватель',
            language: 'Язык',
            program: 'Программа',
            yearsOfStudy: 'Годы обучения',
            prerequisite: 'Пререквизиты',
            description: 'Описание',
        },
    },
} as const;

export function ElectiveEditorModal({
                                        open,
                                        mode,
                                        draft,
                                        typeOptions,
                                        onClose,
                                        onChangeField,
                                        onSave,
                                        saving = false,
                                        locale,
                                    }: ElectiveEditorModalProps) {
    const text = TEXT[locale];
    const isComplete = isElectiveDraftComplete(draft);

    return (
        <ElectiveModal
            open={open}
            title={mode === 'add' ? text.addTitle : text.editTitle}
            onClose={onClose}
            footer={
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button
                        type="button"
                        onClick={onClose}
                        className={`${buttonStyles.button} ${buttonStyles.sizeMd} ${buttonStyles.variantGhost}`}
                        disabled={saving}
                    >
                        {text.cancel}
                    </button>

                    <button
                        type="button"
                        onClick={onSave}
                        className={`${buttonStyles.button} ${buttonStyles.sizeMd} ${buttonStyles.variantPrimary}`}
                        disabled={!isComplete || saving}
                    >
                        {text.save}
                    </button>
                </div>
            }
        >
            <ElectiveEditorForm
                draft={draft}
                typeOptions={typeOptions}
                text={{
                    fields: text.fields,
                    hint: text.hint,
                }}
                onChange={onChangeField}
            />
        </ElectiveModal>
    );
}