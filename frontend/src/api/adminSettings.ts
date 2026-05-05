import type {
    ElectiveTypeDto,
    ProgramDto,
    SettingsResponse,
    StreamDto,
    TrackDto,
} from '../types/adminSettings';
import { getCsrfToken } from '../utils/csrf';

function buildHeaders(withJson = false): HeadersInit {
    const csrfToken = getCsrfToken();
    return {
        Accept: 'application/json',
        ...(withJson ? { 'Content-Type': 'application/json' } : {}),
        ...(csrfToken ? { 'X-CSRFToken': csrfToken } : {}),
    };
}

async function ensureOk(response: Response): Promise<void> {
    if (response.ok) {
        return;
    }
    const bodyText = await response.text().catch(() => '');
    try {
        const parsed = JSON.parse(bodyText) as { message?: string; detail?: string; status?: string };
        throw new Error(parsed.message || parsed.detail || parsed.status || `HTTP ${response.status}`);
    } catch {
        throw new Error(bodyText || `HTTP ${response.status}`);
    }
}

export async function getSettings(): Promise<SettingsResponse> {
    const response = await fetch('/api/settings/', {
        method: 'GET',
        credentials: 'include',
        headers: buildHeaders(false),
    });
    await ensureOk(response);
    return response.json() as Promise<SettingsResponse>;
}

export async function createProgram(payload: { name: string; language: string }): Promise<void> {
    const response = await fetch('/api/programs/', {
        method: 'POST',
        credentials: 'include',
        headers: buildHeaders(true),
        body: JSON.stringify(payload),
    });
    await ensureOk(response);
}

export async function updateProgram(id: number, payload: Partial<{ name: string; language: string }>): Promise<void> {
    const response = await fetch(`/api/programs/${id}/`, {
        method: 'PATCH',
        credentials: 'include',
        headers: buildHeaders(true),
        body: JSON.stringify(payload),
    });
    await ensureOk(response);
}

export async function deleteProgram(id: number): Promise<void> {
    const response = await fetch(`/api/programs/${id}/`, {
        method: 'DELETE',
        credentials: 'include',
        headers: buildHeaders(false),
    });
    await ensureOk(response);
}

export async function createTrack(payload: { name: string; program: number }): Promise<void> {
    const response = await fetch('/api/tracks/', {
        method: 'POST',
        credentials: 'include',
        headers: buildHeaders(true),
        body: JSON.stringify(payload),
    });
    await ensureOk(response);
}

export async function updateTrack(id: number, payload: Partial<{ name: string; program: number }>): Promise<void> {
    const response = await fetch(`/api/tracks/${id}/`, {
        method: 'PATCH',
        credentials: 'include',
        headers: buildHeaders(true),
        body: JSON.stringify(payload),
    });
    await ensureOk(response);
}

export async function deleteTrack(id: number): Promise<void> {
    const response = await fetch(`/api/tracks/${id}/`, {
        method: 'DELETE',
        credentials: 'include',
        headers: buildHeaders(false),
    });
    await ensureOk(response);
}

export async function getElectiveTypes(): Promise<ElectiveTypeDto[]> {
    const response = await fetch('/api/elective_types/', {
        method: 'GET',
        credentials: 'include',
        headers: buildHeaders(false),
    });
    await ensureOk(response);
    return response.json() as Promise<ElectiveTypeDto[]>;
}

export async function createElectiveType(payload: { elective_type_name: string }): Promise<void> {
    const response = await fetch('/api/elective_types/', {
        method: 'POST',
        credentials: 'include',
        headers: buildHeaders(true),
        body: JSON.stringify(payload),
    });
    await ensureOk(response);
}

export async function deleteElectiveType(name: string): Promise<void> {
    const response = await fetch(`/api/elective_types/${encodeURIComponent(name)}/`, {
        method: 'DELETE',
        credentials: 'include',
        headers: buildHeaders(false),
    });
    await ensureOk(response);
}

export async function getPrograms(): Promise<ProgramDto[]> {
    const response = await fetch('/api/programs/', {
        method: 'GET',
        credentials: 'include',
        headers: buildHeaders(false),
    });
    await ensureOk(response);
    return response.json() as Promise<ProgramDto[]>;
}

export async function getTracks(): Promise<TrackDto[]> {
    const response = await fetch('/api/tracks/', {
        method: 'GET',
        credentials: 'include',
        headers: buildHeaders(false),
    });
    await ensureOk(response);
    return response.json() as Promise<TrackDto[]>;
}

export async function getStreams(): Promise<StreamDto[]> {
    const response = await fetch('/api/streams/', {
        method: 'GET',
        credentials: 'include',
        headers: buildHeaders(false),
    });
    await ensureOk(response);
    return response.json() as Promise<StreamDto[]>;
}

export async function createStream(payload: {
    degree_year: string;
    program_lang: string;
    elective_type: string;
    programs: number[];
    priorities: number;
}): Promise<{ id: number }> {
    const response = await fetch('/api/streams/', {
        method: 'POST',
        credentials: 'include',
        headers: buildHeaders(true),
        body: JSON.stringify(payload),
    });
    await ensureOk(response);
    return response.json() as Promise<{ id: number }>;
}

export async function addElectivesToStream(streamId: number, electiveIds: number[]): Promise<void> {
    const response = await fetch(`/api/streams/${streamId}/elective/`, {
        method: 'POST',
        credentials: 'include',
        headers: buildHeaders(true),
        body: JSON.stringify({ electiveIds }),
    });
    await ensureOk(response);
}

export async function updateStream(
    id: number,
    payload: Partial<{
        degree_year: string;
        program_lang: string;
        elective_type: string;
        programs: number[];
        priorities: number;
    }>
): Promise<void> {
    const response = await fetch(`/api/streams/${id}/`, {
        method: 'PATCH',
        credentials: 'include',
        headers: buildHeaders(true),
        body: JSON.stringify(payload),
    });
    await ensureOk(response);
}

export async function deleteStream(id: number): Promise<void> {
    const response = await fetch(`/api/streams/${id}/`, {
        method: 'DELETE',
        credentials: 'include',
        headers: buildHeaders(false),
    });
    await ensureOk(response);
}

export async function getStreamElectives(streamId: number): Promise<Array<{ id: number }>> {
    const response = await fetch(`/api/streams/${streamId}/elective/`, {
        method: 'GET',
        credentials: 'include',
        headers: buildHeaders(false),
    });
    await ensureOk(response);
    return response.json() as Promise<Array<{ id: number }>>;
}

export async function removeElectiveFromStream(streamId: number, electiveId: number): Promise<void> {
    const response = await fetch(`/api/streams/${streamId}/elective/${electiveId}/`, {
        method: 'DELETE',
        credentials: 'include',
        headers: buildHeaders(false),
    });
    await ensureOk(response);
}

export async function downloadSemesterExcel(semesterId: number): Promise<void> {
    const response = await fetch(`/semesters/excel/${semesterId}`, {
        method: 'GET',
        credentials: 'include',
        headers: buildHeaders(false),
    });
    if (!response.ok) {
        await ensureOk(response);
        return;
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `semester-${semesterId}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}
