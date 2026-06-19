import axios from 'axios';
import type { components } from './schema';
import type { Elective } from '@/shared/types/elective';

// ------------------------------------------------------------------
// 1. DTO type (strictly internal to this module)
// ------------------------------------------------------------------
export type ElectiveDTO = components['schemas']['Elective'];

// ------------------------------------------------------------------
// 2. Mappers (the only place where DTO ↔ Model conversion happens)
// ------------------------------------------------------------------

/** Map backend `elective_type` to frontend `type` */
function mapElectiveType(dtoType: string | null | undefined): 'tech' | 'hum' | 'math' {
  if (dtoType === 'TECH') return 'tech';
  if (dtoType === 'HUM') return 'hum';
  if (dtoType === 'MATH') return 'math';
  // fallback – adjust if your backend uses different labels
  return 'tech';
}

/** Map backend `program_language` to frontend `language` */
function mapElectiveLanguage(dtoLang: string | undefined): 'English' | 'Russian' {
  if (dtoLang === 'english') return 'English';
  if (dtoLang === 'russian') return 'Russian';
  return 'English'; // fallback
}

/**
 * Convert backend DTO → frontend model.
 * Fields not present in the DTO (format, program) get sensible defaults.
 */
export function dtoToElective(dto: ElectiveDTO): Elective {
  return {
    id: String(dto.id ?? ''),
    title: dto.name ?? '',
    elective_language: mapElectiveLanguage(dto.elective_language),
    program_language: dto.program_language,
    format: 'offline', // not provided by backend
    instructor: dto.instructor ?? '',
    description: dto.description ?? '',
    type: mapElectiveType(dto.elective_type),
    degree_year: dto.degree_year ?? [],
    isArchived: dto.status === 0,
    backendType: dto.elective_type ?? '',
  };
}

/**
 * Convert frontend model → backend DTO (for POST / PATCH).
 * Only sends fields that the backend actually accepts.
 */
function electiveToDto(
  elective: Partial<Omit<Elective, 'id'>> & Pick<Elective, 'title' | 'type' >
): Partial<ElectiveDTO> {

  return {
    name: elective.title,
    instructor: elective.instructor,
    description: elective.description,
    elective_type: elective.type === 'tech' ? 'TECH' : elective.type === 'hum' ? 'HUM' : 'MATH',
    elective_language: elective.elective_language === 'English' ? 'english' : 'russian',
    program_language: elective.program_language,
    degree_year: elective.degree_year,
    status: elective.isArchived !== undefined ? (elective.isArchived ? 0 : 1) : 1,
    // prerequisite is not in your model – omit it, or add it to your model if needed
  };
}

// ------------------------------------------------------------------
// 3. Public API functions (all work with your internal `Elective` type)
// ------------------------------------------------------------------

/**
 * GET /api/electives/
 * Fetch a list of electives with optional filters.
 */
export async function fetchElectives(params?: {
  status?: number; // 1=active, 0=archived, -1=deleted
  elective_type?: string;
  program_language?: string;
  search?: string;
}): Promise<Elective[]> {
  const response = await axios.get('/api/electives/', { params });
  const data = response.data;

  // Handle paginated response (Django REST Framework style)
  if (data && typeof data === 'object' && 'results' in data && Array.isArray(data.results)) {
    return data.results.map(dtoToElective);
  }

  // Handle plain array
  if (Array.isArray(data)) {
    return data.map(dtoToElective);
  }

  // If it's a single object (maybe error or unexpected), log and return empty
  console.warn('Unexpected response format from /api/electives/', data);
  return [];
}

/**
 * GET /api/electives/{id}/
 * Fetch a single elective by its numeric ID.
 */
export async function fetchElectiveById(id: number): Promise<Elective> {
  const response = await axios.get<ElectiveDTO>(`/api/electives/${id}/`);
  return dtoToElective(response.data);
}

/**
 * POST /api/electives/
 * Create a new elective.
 */
export async function createElective(
  data: Omit<Elective, 'id'>
): Promise<Elective> {
  const payload = electiveToDto(data);
  const response = await axios.post<ElectiveDTO>('/api/electives/', payload);
  return dtoToElective(response.data);
}

/**
 * PATCH /api/electives/{id}/
 * Update an existing elective.
 * Supports partial updates – only the fields you provide will be changed.
 */
export async function updateElective(
  id: number,
  data: Partial<Omit<Elective, 'id'>>
): Promise<Elective> {
  const payload = electiveToDto(data as any); // cast is safe because it's partial
  const response = await axios.patch<ElectiveDTO>(`/api/electives/${id}/`, payload);
  return dtoToElective(response.data);
}

/**
 * POST /api/electives/{id}/archive/
 * Archive an elective (set status → 0).
 */
export async function archiveElective(id: number): Promise<Elective> {
  const response = await axios.post<ElectiveDTO>(`/api/electives/${id}/archive/`);
  return dtoToElective(response.data);
}

/**
 * Restore an archived elective (set status → 1).
 * Uses PATCH because there is no dedicated restore endpoint.
 */
export async function restoreElective(id: number): Promise<Elective> {
  const response = await axios.patch<ElectiveDTO>(`/api/electives/${id}/`, {
    status: 1,
  });
  return dtoToElective(response.data);
}

/**
 * Soft‑delete an elective (set status → -1).
 * Uses PATCH – the backend has no DELETE method.
 */
export async function deleteElective(id: number): Promise<Elective> {
  const response = await axios.patch<ElectiveDTO>(`/api/electives/${id}/`, {
    status: -1,
  });
  return dtoToElective(response.data);
}