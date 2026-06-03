import { useCallback, useMemo, useState } from 'react';
import type { AuthResponse } from '../types/auth';
import type { Elective } from '../types/elective';
import { mapStudentDataToElectives } from '../utils/authElectives';
import { submitStudentElectives } from '../api/studentVoting';
import { MOCK_STUDENT_EMAIL } from '../mocks/studentAuthMock';

interface StudentElectiveTypeGroup {
    type: string;
    requiredCount: number;
    electives: Elective[];
}

export interface StudentChosenGroup {
    type: string;
    electiveIds: number[];
}

type StudentSelectionByType = Record<string, Array<number | undefined>>;

interface UseStudentElectivesFlowParams {
    authResponse: AuthResponse | null;
}

interface UseStudentElectivesFlowResult {
    studentElectives: Elective[];
    favouriteIds: number[];
    availableTypes: StudentElectiveTypeGroup[];
    chosenByType: StudentChosenGroup[];
    studentId: number | null;
    iterationId: number | null;
    savingType: string | null;
    saveError: string | null;
    getSelections: (type: string, requiredCount: number) => Array<number | undefined>;
    setSelection: (
        type: string,
        requiredCount: number,
        index: number,
        electiveId: number | undefined
    ) => void;
    resetSelections: (type: string, requiredCount: number) => void;
    submitSelections: (type: string, requiredCount: number) => Promise<void>;
    handleToggleFavourite: (elective: Elective) => void;
    resetStudentState: () => void;
}

function ensureLength(
    source: Array<number | undefined>,
    requiredCount: number
): Array<number | undefined> {
    if (source.length === requiredCount) {
        return source;
    }

    if (source.length > requiredCount) {
        return source.slice(0, requiredCount);
    }

    return [...source, ...Array(requiredCount - source.length).fill(undefined)];
}

function mapChosenSelections(
    authResponse: AuthResponse | null
): StudentSelectionByType {
    if (!authResponse || authResponse.role === 'admin') {
        return {};
    }

    const result: StudentSelectionByType = {};

    for (const group of authResponse.student_data.chosen_electives) {
        const ordered = [...group.electives]
            .sort((a, b) => a.priority - b.priority)
            .map((item) => item.elective.id);
        result[group.elective_type] = ordered;
    }

    return result;
}

export function useStudentElectivesFlow({
    authResponse,
}: UseStudentElectivesFlowParams): UseStudentElectivesFlowResult {
    const [favouriteIds, setFavouriteIds] = useState<number[]>([]);
    const [selectionsByType, setSelectionsByType] = useState<StudentSelectionByType>({});
    const [submittedByType, setSubmittedByType] = useState<Record<string, number[]>>({});
    const [savingType, setSavingType] = useState<string | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);
    const isMockStudentMode = authResponse?.role === 'student' && authResponse.email === MOCK_STUDENT_EMAIL;

    const studentElectives = useMemo(() => {
        if (!authResponse || authResponse.role === 'admin') {
            return [];
        }

        return mapStudentDataToElectives(authResponse.student_data);
    }, [authResponse]);

    const availableTypes = useMemo<StudentElectiveTypeGroup[]>(() => {
        if (!authResponse || authResponse.role === 'admin') {
            return [];
        }

        return authResponse.student_data.available_electives.map((group) => ({
            type: group.elective_type,
            requiredCount: group.priorities,
            electives: group.electives.map((item) => ({
                id: item.id,
                name: item.name,
                instructor: item.instructor,
                description: item.description,
                electiveLanguage: item.elective_language,
                status: 1,
                prerequisite: item.prerequisite,
                electiveType: group.elective_type,
                programLanguage: '',
                degreeYear: [],
            })),
        }));
    }, [authResponse]);

    const chosenByType = useMemo<StudentChosenGroup[]>(() => {
        if (!authResponse || authResponse.role === 'admin') {
            return [];
        }

        const serverChosen = authResponse.student_data.chosen_electives.map((group) => ({
            type: group.elective_type,
            electiveIds: [...group.electives]
                .sort((a, b) => a.priority - b.priority)
                .map((item) => item.elective.id),
        }));

        const merged = new Map<string, number[]>(
            serverChosen.map((item) => [item.type, item.electiveIds])
        );

        for (const [type, ids] of Object.entries(submittedByType)) {
            merged.set(type, ids);
        }

        return Array.from(merged.entries()).map(([type, electiveIds]) => ({
            type,
            electiveIds,
        }));
    }, [authResponse, submittedByType]);

    const studentId = useMemo(() => {
        if (!authResponse || authResponse.role !== 'student') {
            return null;
        }

        return authResponse.student_id;
    }, [authResponse]);

    const iterationId = useMemo(() => {
        if (!authResponse || authResponse.role === 'admin') {
            return null;
        }

        return authResponse.student_data.iteration_id;
    }, [authResponse]);

    const initialSelectionsByType = useMemo(
        () => mapChosenSelections(authResponse),
        [authResponse]
    );

    const handleToggleFavourite = useCallback((elective: Elective) => {
        setFavouriteIds((prev) => {
            const exists = prev.includes(elective.id);
            return exists ? prev.filter((id) => id !== elective.id) : [...prev, elective.id];
        });
    }, []);

    const getSelections = useCallback(
        (type: string, requiredCount: number) => {
            const current = selectionsByType[type];

            if (current) {
                return ensureLength(current, requiredCount);
            }

            const fromServer = initialSelectionsByType[type] ?? [];
            return ensureLength(fromServer, requiredCount);
        },
        [initialSelectionsByType, selectionsByType]
    );

    const setSelection = useCallback(
        (
            type: string,
            requiredCount: number,
            index: number,
            electiveId: number | undefined
        ) => {
            setSelectionsByType((prev) => {
                const current = ensureLength(
                    prev[type] ?? initialSelectionsByType[type] ?? [],
                    requiredCount
                );
                const next = [...current];
                next[index] = electiveId;

                return {
                    ...prev,
                    [type]: next,
                };
            });
        },
        [initialSelectionsByType]
    );

    const resetSelections = useCallback((type: string, requiredCount: number) => {
        setSelectionsByType((prev) => ({
            ...prev,
            [type]: Array(requiredCount).fill(undefined),
        }));
    }, []);

    const submitSelections = useCallback(
        async (type: string, requiredCount: number) => {
            if (!studentId || !iterationId) {
                throw new Error('Missing student context for submission');
            }

            const selections = getSelections(type, requiredCount);
            const valid = selections.filter(
                (item): item is number => typeof item === 'number'
            );

            if (valid.length !== requiredCount) {
                throw new Error('Please fill all priorities before saving');
            }

            setSavingType(type);
            setSaveError(null);

            try {
                if (isMockStudentMode) {
                    await new Promise((resolve) => setTimeout(resolve, 250));
                } else {
                    await submitStudentElectives({
                        student_id: studentId,
                        iteration_id: iterationId,
                        elective_type: type,
                        electives: valid.map((electiveId, index) => ({
                            priority: index + 1,
                            elective_id: electiveId,
                        })),
                    });
                }
                setSubmittedByType((prev) => ({
                    ...prev,
                    [type]: valid,
                }));
            } catch (error) {
                setSaveError(error instanceof Error ? error.message : 'Failed to save choices');
                throw error;
            } finally {
                setSavingType(null);
            }
        },
        [getSelections, isMockStudentMode, iterationId, studentId]
    );

    const resetStudentState = useCallback(() => {
        setFavouriteIds([]);
        setSelectionsByType({});
        setSubmittedByType({});
        setSavingType(null);
        setSaveError(null);
    }, []);

    return {
        studentElectives,
        favouriteIds,
        availableTypes,
        chosenByType,
        studentId,
        iterationId,
        savingType,
        saveError,
        getSelections,
        setSelection,
        resetSelections,
        submitSelections,
        handleToggleFavourite,
        resetStudentState,
    };
}
