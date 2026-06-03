import { useRef } from 'react';
import type {
    ElectiveEditorDraft,
    ElectiveEditorTypeOption,
    ElectiveEditorLanguage,
} from '../types/electiveEditor';
import buttonStyles from '../styles/button.module.css';
import styles from '../styles/electiveEditorForm.module.css';

interface ElectiveEditorFormText {
    fields: {
        type: string;
        title: string;
        teacher: string;
        language: string;
        program: string;
        yearsOfStudy: string;
        prerequisite: string;
        description: string;
    };
    hint: string;
}

interface ElectiveEditorFormProps {
    draft: ElectiveEditorDraft;
    typeOptions: ElectiveEditorTypeOption[];
    text: ElectiveEditorFormText;
    onChange: <K extends keyof ElectiveEditorDraft>(
        key: K,
        value: ElectiveEditorDraft[K]
    ) => void;
}

const LANGUAGE_OPTIONS: Array<{
    value: Exclude<ElectiveEditorLanguage, ''>;
    label: string;
}> = [
    { value: 'ENG', label: 'ENG' },
    { value: 'RUS', label: 'RUS' },
];
const PROGRAM_OPTIONS = ['ENG', 'RUS'];
const YEARS_OF_STUDY_OPTIONS = ['BS1', 'BS2', 'BS3', 'BS4', 'MS1', 'MS2'];
// TODO: later fetch available study years from backend instead of using predefined values

export function ElectiveEditorForm({
                                       draft,
                                       typeOptions,
                                       text,
                                       onChange,
                                   }: ElectiveEditorFormProps) {
    const descriptionRef = useRef<HTMLTextAreaElement | null>(null);

    function updateDescription(nextValue: string) {
        onChange('description', nextValue);
    }

    function wrapSelection(before: string, after = '') {
        const textarea = descriptionRef.current;

        if (!textarea) {
            updateDescription(`${draft.description}${before}${after}`);
            return;
        }

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = draft.description.slice(start, end);
        const nextValue =
            draft.description.slice(0, start) +
            before +
            selectedText +
            after +
            draft.description.slice(end);

        updateDescription(nextValue);

        requestAnimationFrame(() => {
            textarea.focus();
            textarea.setSelectionRange(
                start + before.length,
                start + before.length + selectedText.length
            );
        });
    }

    function insertLinePrefix(prefix: string) {
        const textarea = descriptionRef.current;

        if (!textarea) {
            updateDescription(`${draft.description}\n${prefix}`);
            return;
        }

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        const lineStart = draft.description.lastIndexOf('\n', start - 1) + 1;
        const selectedText = draft.description.slice(lineStart, end);
        const transformed = selectedText
            .split('\n')
            .map((line) => `${prefix}${line}`)
            .join('\n');

        const nextValue =
            draft.description.slice(0, lineStart) +
            transformed +
            draft.description.slice(end);

        updateDescription(nextValue);

        requestAnimationFrame(() => {
            textarea.focus();
        });
    }

    function insertLink() {
        wrapSelection('[', '](https://)');
    }

    function toggleLanguage(value: Exclude<ElectiveEditorLanguage, ''>) {
        onChange('language', draft.language === value ? '' : value);
    }

    function toggleYear(value: string) {
        const exists = draft.yearsOfStudy.includes(value);

        if (exists) {
            onChange(
                'yearsOfStudy',
                draft.yearsOfStudy.filter((item) => item !== value)
            );
            return;
        }

        onChange('yearsOfStudy', [...draft.yearsOfStudy, value]);
    }

    function toggleProgram(value: 'ENG' | 'RUS') {
        onChange('program', draft.program === value ? '' : value);
    }

    return (
        <div className={styles.form}>
            <label className={styles.field}>
                <span>{text.fields.type}</span>
                <select
                    value={draft.electiveType}
                    onChange={(event) => onChange('electiveType', event.target.value)}
                >
                    <option value="">Select type</option>
                    {typeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </label>

            <label className={styles.field}>
                <span>{text.fields.title}</span>
                <input
                    value={draft.title}
                    onChange={(event) => onChange('title', event.target.value)}
                />
            </label>

            <label className={styles.field}>
                <span>{text.fields.teacher}</span>
                <input
                    value={draft.teacher}
                    onChange={(event) => onChange('teacher', event.target.value)}
                />
            </label>

            <div className={styles.field}>
                <span>{text.fields.language}</span>
                <div className={styles.toggleGroup}>
                    {LANGUAGE_OPTIONS.map((option) => {
                        const isActive = draft.language === option.value;

                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => toggleLanguage(option.value)}
                                aria-pressed={isActive}
                                className={[
                                    buttonStyles.button,
                                    buttonStyles.sizeMd,
                                    isActive ? buttonStyles.variantPrimary : buttonStyles.variantGhost,
                                ].join(' ')}
                            >
                                {option.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className={styles.field}>
                <span>{text.fields.program}</span>
                <div className={styles.toggleGroup}>
                    {PROGRAM_OPTIONS.map((option) => {
                        const isActive = draft.program === option;

                        return (
                            <button
                                key={option}
                                type="button"
                                onClick={() => toggleProgram(option as 'ENG' | 'RUS')}
                                aria-pressed={isActive}
                                className={[
                                    buttonStyles.button,
                                    buttonStyles.sizeMd,
                                    isActive ? buttonStyles.variantPrimary : buttonStyles.variantGhost,
                                ].join(' ')}
                            >
                                {option}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className={styles.field}>
                <span>{text.fields.yearsOfStudy}</span>
                <div className={styles.toggleGroup}>
                    {YEARS_OF_STUDY_OPTIONS.map((year) => {
                        const isActive = draft.yearsOfStudy.includes(year);

                        return (
                            <button
                                key={year}
                                type="button"
                                onClick={() => toggleYear(year)}
                                aria-pressed={isActive}
                                className={[
                                    buttonStyles.button,
                                    buttonStyles.sizeMd,
                                    isActive ? buttonStyles.variantPrimary : buttonStyles.variantGhost,
                                ].join(' ')}
                            >
                                {year}
                            </button>
                        );
                    })}
                </div>
            </div>

            <label className={styles.field}>
                <span>{text.fields.prerequisite}</span>
                <input
                    value={draft.prerequisite}
                    onChange={(event) => onChange('prerequisite', event.target.value)}
                />
            </label>

            <div className={styles.field}>
                <span>{text.fields.description}</span>

                <div className={styles.toolbar}>
                    <button
                        type="button"
                        onClick={() => wrapSelection('**', '**')}
                        className={`${buttonStyles.button} ${buttonStyles.sizeMd} ${buttonStyles.variantGhost}`}
                    >
                        Bold
                    </button>

                    <button
                        type="button"
                        onClick={() => wrapSelection('_', '_')}
                        className={`${buttonStyles.button} ${buttonStyles.sizeMd} ${buttonStyles.variantGhost}`}
                    >
                        Italic
                    </button>

                    <button
                        type="button"
                        onClick={() => wrapSelection('## ')}
                        className={`${buttonStyles.button} ${buttonStyles.sizeMd} ${buttonStyles.variantGhost}`}
                    >
                        Heading
                    </button>

                    <button
                        type="button"
                        onClick={() => insertLinePrefix('- ')}
                        className={`${buttonStyles.button} ${buttonStyles.sizeMd} ${buttonStyles.variantGhost}`}
                    >
                        Bullet list
                    </button>

                    <button
                        type="button"
                        onClick={() => insertLinePrefix('1. ')}
                        className={`${buttonStyles.button} ${buttonStyles.sizeMd} ${buttonStyles.variantGhost}`}
                    >
                        Numbered list
                    </button>

                    <button
                        type="button"
                        onClick={insertLink}
                        className={`${buttonStyles.button} ${buttonStyles.sizeMd} ${buttonStyles.variantGhost}`}
                    >
                        Link
                    </button>
                </div>

                <textarea
                    ref={descriptionRef}
                    rows={10}
                    value={draft.description}
                    onChange={(event) => onChange('description', event.target.value)}
                    placeholder="Write description in Markdown..."
                />

                <div className={styles.hint}>{text.hint}</div>
            </div>
        </div>
    );
}