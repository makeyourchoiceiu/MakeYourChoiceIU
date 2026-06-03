interface SubmitElectivePriorityPayload {
    priority: number;
    elective_id: number;
}

export interface SubmitStudentElectivesPayload {
    student_id: number;
    iteration_id: number;
    elective_type: string;
    electives: SubmitElectivePriorityPayload[];
}

const API_BASE_URL = '/api/me';

export async function submitStudentElectives(
    payload: SubmitStudentElectivesPayload
): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/submissions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `HTTP error: ${response.status}`);
    }
}
