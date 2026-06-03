import type { Elective, ElectiveDto, ElectiveStatus } from '../types/elective';
import { getCsrfToken } from '../utils/csrf';
import { normalizeStoredMarkdown } from '../utils/markdown';

const API_BASE_URL = '/api/electives';

function mapElectiveDto(dto: ElectiveDto): Elective {
    return {
        id: dto.id,
        name: dto.name,
        instructor: dto.instructor,
        description: normalizeStoredMarkdown(dto.description),
        electiveLanguage: dto.elective_language,
        status: dto.status,
        prerequisite: dto.prerequisite,
        electiveType: dto.elective_type,
        programLanguage: dto.program_language,
        degreeYear: dto.degree_year,
    };
}

async function readErrorBody(response: Response): Promise<string> {
    try {
        const text = await response.text();
        return text || `HTTP error: ${response.status}`;
    } catch {
        return `HTTP error: ${response.status}`;
    }
}

async function handleJsonResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const errorBody = await readErrorBody(response);
        console.error('API error body:', errorBody);
        throw new Error(`HTTP error: ${response.status}`);
    }

    return response.json() as Promise<T>;
}

function buildJsonHeaders(includeContentType = false): HeadersInit {
    const csrfToken = getCsrfToken();

    return {
        Accept: 'application/json',
        ...(includeContentType ? { 'Content-Type': 'application/json' } : {}),
        ...(csrfToken ? { 'X-CSRFToken': csrfToken } : {}),
    };
}

export interface UpdateElectivePayload {
    name?: string;
    instructor?: string;
    description?: string;
    elective_language?: string;
    status?: ElectiveStatus;
    prerequisite?: string;
    elective_type?: string;
    program_language?: string;
    degree_year?: string[];
}

interface ElectiveTypeDto {
    elective_type_name: string;
}

export async function getElectiveById(id: number): Promise<Elective> {
    const response = await fetch(`${API_BASE_URL}/${id}/`, {
        method: 'GET',
        credentials: 'include',
        headers: buildJsonHeaders(false),
    });

    const data = await handleJsonResponse<ElectiveDto>(response);
    return mapElectiveDto(data);
}

export async function getElectives(): Promise<Elective[]> {
    const response = await fetch(`${API_BASE_URL}/`, {
        method: 'GET',
        credentials: 'include',
        headers: buildJsonHeaders(false),
    });

    const data = await handleJsonResponse<ElectiveDto[]>(response);
    return data.map(mapElectiveDto);
}

export async function getElectiveTypes(): Promise<string[]> {
    const response = await fetch('/api/elective_types/', {
        method: 'GET',
        credentials: 'include',
        headers: buildJsonHeaders(false),
    });

    const data = await handleJsonResponse<ElectiveTypeDto[]>(response);
    return data
        .map((item) => item.elective_type_name)
        .sort((a, b) => a.localeCompare(b));
}

export async function createElective(
    payload: UpdateElectivePayload
): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/`, {
        method: 'POST',
        credentials: 'include',
        headers: buildJsonHeaders(true),
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorBody = await readErrorBody(response);
        console.error('createElective error body:', errorBody);
        throw new Error(`HTTP error: ${response.status}`);
    }
}

export async function updateElective(
    id: number,
    payload: UpdateElectivePayload
): Promise<Elective> {
    const response = await fetch(`${API_BASE_URL}/${id}/`, {
        method: 'PATCH',
        credentials: 'include',
        headers: buildJsonHeaders(true),
        body: JSON.stringify(payload),
    });

    const data = await handleJsonResponse<ElectiveDto>(response);
    return mapElectiveDto(data);
}

export async function archiveElective(id: number): Promise<Elective> {
    const response = await fetch(`${API_BASE_URL}/${id}/`, {
        method: 'PATCH',
        credentials: 'include',
        headers: buildJsonHeaders(true),
        body: JSON.stringify({ status: 0 }),
    });

    const data = await handleJsonResponse<ElectiveDto>(response);
    return mapElectiveDto(data);
}

export async function deleteElective(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/${id}/`, {
        method: 'PATCH',
        credentials: 'include',
        headers: buildJsonHeaders(true),
        body: JSON.stringify({ status: -1 }),
    });

    if (!response.ok) {
        const errorBody = await readErrorBody(response);
        console.error('deleteElective error body:', errorBody);
        throw new Error(`HTTP error: ${response.status}`);
    }
}
