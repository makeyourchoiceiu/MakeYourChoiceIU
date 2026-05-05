export interface StudentSelectionByTypeHandle {
    getSelections: (type: string, requiredCount: number) => Array<number | undefined>;
    setSelection: (
        type: string,
        requiredCount: number,
        index: number,
        electiveId: number | undefined
    ) => void;
    resetSelections: (type: string, requiredCount: number) => void;
    submitSelections: (type: string, requiredCount: number) => Promise<void>;
}
