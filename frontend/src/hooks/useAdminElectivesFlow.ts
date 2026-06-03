import { useCallback, useState } from 'react';
import {
    archiveElective,
    createElective,
    deleteElective,
    getElectives,
    updateElective,
    type UpdateElectivePayload,
} from '../api/electives';
import type { Elective } from '../types/elective';
import { sortAdminElectives } from '../utils/electivesList';

interface UseAdminElectivesFlowParams {
    canManageElectives: boolean;
    setAdminElectives: (nextElectives: Elective[]) => void;
}

interface UseAdminElectivesFlowResult {
    actionError: string | null;
    actionLoadingId: number | null;
    handleCreateElective: (payload: UpdateElectivePayload) => Promise<void>;
    handleUpdateElective: (id: number, payload: UpdateElectivePayload) => Promise<void>;
    handleArchiveElective: (elective: Elective) => Promise<void>;
    handleDeleteElective: (elective: Elective) => Promise<void>;
    handleRestoreElective: (elective: Elective) => Promise<void>;
    resetActionState: () => void;
}

export function useAdminElectivesFlow({
    canManageElectives,
    setAdminElectives,
}: UseAdminElectivesFlowParams): UseAdminElectivesFlowResult {
    const [actionError, setActionError] = useState<string | null>(null);
    const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

    const refreshElectives = useCallback(async () => {
        if (!canManageElectives) {
            return;
        }

        const nextElectives = await getElectives();
        setAdminElectives(sortAdminElectives(nextElectives));
    }, [canManageElectives, setAdminElectives]);

    const resetActionState = useCallback(() => {
        setActionError(null);
        setActionLoadingId(null);
    }, []);

    const handleCreateElective = useCallback(async (payload: UpdateElectivePayload) => {
        try {
            setActionError(null);
            setActionLoadingId(-1);

            await createElective(payload);
            await refreshElectives();
        } catch (err) {
            setActionError(err instanceof Error ? err.message : 'Failed to create elective');
        } finally {
            setActionLoadingId(null);
        }
    }, [refreshElectives]);

    const handleUpdateElective = useCallback(
        async (id: number, payload: UpdateElectivePayload) => {
            try {
                setActionError(null);
                setActionLoadingId(id);

                await updateElective(id, payload);
                await refreshElectives();
            } catch (err) {
                setActionError(err instanceof Error ? err.message : 'Failed to update elective');
            } finally {
                setActionLoadingId(null);
            }
        },
        [refreshElectives]
    );

    const handleArchiveElective = useCallback(async (elective: Elective) => {
        try {
            setActionError(null);
            setActionLoadingId(elective.id);

            await archiveElective(elective.id);
            await refreshElectives();
        } catch (err) {
            setActionError(err instanceof Error ? err.message : 'Failed to archive elective');
        } finally {
            setActionLoadingId(null);
        }
    }, [refreshElectives]);

    const handleDeleteElective = useCallback(async (elective: Elective) => {
        const confirmed = window.confirm(
            `Delete elective "${elective.name}"? This action cannot be undone.`
        );

        if (!confirmed) {
            return;
        }

        try {
            setActionError(null);
            setActionLoadingId(elective.id);

            await deleteElective(elective.id);
            await refreshElectives();
        } catch (err) {
            setActionError(err instanceof Error ? err.message : 'Failed to delete elective');
        } finally {
            setActionLoadingId(null);
        }
    }, [refreshElectives]);

    const handleRestoreElective = useCallback(async (elective: Elective) => {
        try {
            setActionError(null);
            setActionLoadingId(elective.id);

            await updateElective(elective.id, { status: 1 });
            await refreshElectives();
        } catch (err) {
            setActionError(err instanceof Error ? err.message : 'Failed to restore elective');
        } finally {
            setActionLoadingId(null);
        }
    }, [refreshElectives]);

    return {
        actionError,
        actionLoadingId,
        handleCreateElective,
        handleUpdateElective,
        handleArchiveElective,
        handleDeleteElective,
        handleRestoreElective,
        resetActionState,
    };
}
