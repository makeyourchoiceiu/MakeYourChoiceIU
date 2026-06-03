import type {
    AuthResponse,
    AuthUser,
    NormalizedStudentData,
    StudentAvailableElectiveGroupResponse,
} from '../types/auth';

const API_BASE_URL = '/api/auth';

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
    }

    return response.json() as Promise<T>;
}

export async function loginByEmail(email: string): Promise<AuthResponse> {
    const encodedEmail = encodeURIComponent(email.trim());

    const response = await fetch(`${API_BASE_URL}/email?email=${encodedEmail}`, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
        },
    });

    return handleResponse<AuthResponse>(response);
}

export function mapAuthResponseToUser(response: AuthResponse): AuthUser {
    return {
        email: response.email,
        role: response.role,
        group: null,
    };
}

function mapStudentElectiveType(
    item: StudentAvailableElectiveGroupResponse
) {
    return {
        type: item.elective_type,
        label: item.elective_type,
        requiredCount: item.priorities,
    };
}

export function mapStudentData(
    response: AuthResponse
): NormalizedStudentData | null {
    if (response.role === 'admin') {
        return null;
    }

    return {
        deadline: response.student_data.deadline,
        availableElectiveTypes: response.student_data.available_electives.map(
            mapStudentElectiveType
        ),
    };
}