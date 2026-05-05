import { useCallback, useEffect, useMemo, useState } from 'react';
import { getElectiveTypes } from '../api/electives';
import type { AdminSidebarItem } from '../types/adminSidebar';
import type { Elective, ElectiveStatus } from '../types/elective';
import type { ElectiveEditorTypeOption } from '../types/electiveEditor';

interface UseAdminSidebarFiltersParams {
    electives: Elective[];
}

interface UseAdminSidebarFiltersResult {
    items: AdminSidebarItem[];
    selectedItemIds: string[];
    selectedStatuses: ElectiveStatus[];
    selectedElectiveTypes: string[];
    typeOptions: ElectiveEditorTypeOption[];
    toggleItem: (item: AdminSidebarItem) => void;
    resetFilters: () => void;
}

const STATUS_ITEMS: AdminSidebarItem[] = [
    { id: 'status:1', kind: 'status', title: 'Active', status: 1 },
    { id: 'status:0', kind: 'status', title: 'Archived', status: 0 },
    { id: 'status:-1', kind: 'status', title: 'Deleted', status: -1 },
];

function getFallbackTypeNames(electives: Elective[]): string[] {
    return Array.from(new Set(electives.map((elective) => elective.electiveType))).sort(
        (a, b) => a.localeCompare(b)
    );
}

export function useAdminSidebarFilters({
    electives,
}: UseAdminSidebarFiltersParams): UseAdminSidebarFiltersResult {
    const [backendTypeNames, setBackendTypeNames] = useState<string[]>([]);
    const [selectedStatuses, setSelectedStatuses] = useState<ElectiveStatus[]>([]);
    const [selectedElectiveTypes, setSelectedElectiveTypes] = useState<string[]>([]);

    useEffect(() => {
        let cancelled = false;

        async function loadElectiveTypes() {
            try {
                const typeNames = await getElectiveTypes();

                if (!cancelled) {
                    setBackendTypeNames(typeNames);
                }
            } catch {
                if (!cancelled) {
                    setBackendTypeNames([]);
                }
            }
        }

        loadElectiveTypes();

        return () => {
            cancelled = true;
        };
    }, []);

    const effectiveTypeNames = useMemo(() => {
        if (backendTypeNames.length > 0) {
            return backendTypeNames;
        }

        return getFallbackTypeNames(electives);
    }, [backendTypeNames, electives]);

    const items = useMemo<AdminSidebarItem[]>(() => {
        const typeItems = effectiveTypeNames.map((typeName) => ({
            id: `type:${typeName}`,
            kind: 'type' as const,
            title: typeName,
            electiveType: typeName,
        }));

        return [
            { id: 'all', kind: 'reset', title: 'All electives' },
            ...STATUS_ITEMS,
            ...typeItems,
        ];
    }, [effectiveTypeNames]);

    const selectedItemIds = useMemo(() => {
        return [
            ...selectedStatuses.map((status) => `status:${status}`),
            ...selectedElectiveTypes.map((typeName) => `type:${typeName}`),
        ];
    }, [selectedStatuses, selectedElectiveTypes]);

    const typeOptions = useMemo<ElectiveEditorTypeOption[]>(
        () =>
            effectiveTypeNames.map((typeName) => ({
                value: typeName,
                label: typeName,
            })),
        [effectiveTypeNames]
    );

    const resetFilters = useCallback(() => {
        setSelectedStatuses([]);
        setSelectedElectiveTypes([]);
    }, []);

    const toggleItem = useCallback(
        (item: AdminSidebarItem) => {
            if (item.kind === 'reset') {
                resetFilters();
                return;
            }

            if (item.kind === 'status' && item.status !== undefined) {
                setSelectedStatuses((prev) =>
                    prev.includes(item.status as ElectiveStatus)
                        ? prev.filter((status) => status !== item.status)
                        : [...prev, item.status as ElectiveStatus]
                );
                return;
            }

            if (item.kind === 'type' && item.electiveType) {
                setSelectedElectiveTypes((prev) =>
                    prev.includes(item.electiveType as string)
                        ? prev.filter((typeName) => typeName !== item.electiveType)
                        : [...prev, item.electiveType as string]
                );
            }
        },
        [resetFilters]
    );

    return {
        items,
        selectedItemIds,
        selectedStatuses,
        selectedElectiveTypes,
        typeOptions,
        toggleItem,
        resetFilters,
    };
}
