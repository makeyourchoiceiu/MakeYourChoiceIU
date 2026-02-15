import { useState } from 'react';

export function useVotingForm() {
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const handleSubmit = (ids: number[]) => {
        console.log('Selected electives:', ids);
        alert(`Submitted: ${ids.join(', ')}`);
        setSelectedIds(ids);
    };

    const handleClear = () => {
        console.log('Form cleared');
        setSelectedIds([]);
    };

    return {
        selectedIds,
        handleSubmit,
        handleClear
    };
}