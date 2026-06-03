import { useState } from 'react';
import type { Elective, ElectiveStatus } from '../types/elective';
import type { ElectiveEditorDraft, ElectiveEditorMode } from '../types/electiveEditor';
import {
    createEmptyElectiveDraft,
    mapElectiveToEditorDraft,
} from '../utils/electiveEditor';

interface AdminElectiveEditorState {
    isOpen: boolean;
    mode: ElectiveEditorMode;
    editingElectiveId: number | null;
    editingElectiveStatus: ElectiveStatus | null;
    draft: ElectiveEditorDraft;
}

interface UseAdminElectiveEditorResult {
    isOpen: boolean;
    mode: ElectiveEditorMode;
    editingElectiveId: number | null;
    editingElectiveStatus: ElectiveStatus | null;
    draft: ElectiveEditorDraft;
    openAdd: (prefilledType?: string) => void;
    openEdit: (elective: Elective) => void;
    close: () => void;
    updateField: <K extends keyof ElectiveEditorDraft>(
        key: K,
        value: ElectiveEditorDraft[K]
    ) => void;
}

/**
 * Хук управляет исключительно состоянием add/edit модалки.
 * Никакого API здесь нет.
 */
export function useAdminElectiveEditor(): UseAdminElectiveEditorResult {
    const [state, setState] = useState<AdminElectiveEditorState>({
        isOpen: false,
        mode: 'add',
        editingElectiveId: null,
        editingElectiveStatus: null,
        draft: createEmptyElectiveDraft(),
    });

    function openAdd(prefilledType = '') {
        setState({
            isOpen: true,
            mode: 'add',
            editingElectiveId: null,
            editingElectiveStatus: null,
            draft: createEmptyElectiveDraft(prefilledType),
        });
    }

    function openEdit(elective: Elective) {
        setState({
            isOpen: true,
            mode: 'edit',
            editingElectiveId: elective.id,
            editingElectiveStatus: elective.status,
            draft: mapElectiveToEditorDraft(elective),
        });
    }

    function close() {
        setState((prev) => ({
            ...prev,
            isOpen: false,
        }));
    }

    function updateField<K extends keyof ElectiveEditorDraft>(
        key: K,
        value: ElectiveEditorDraft[K]
    ) {
        setState((prev) => ({
            ...prev,
            draft: {
                ...prev.draft,
                [key]: value,
            },
        }));
    }

    return {
        isOpen: state.isOpen,
        mode: state.mode,
        editingElectiveId: state.editingElectiveId,
        editingElectiveStatus: state.editingElectiveStatus,
        draft: state.draft,
        openAdd,
        openEdit,
        close,
        updateField,
    };
}
