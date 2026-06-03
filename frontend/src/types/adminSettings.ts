export type ProgramLanguageCode = 'ENG' | 'RUS' | string;

export interface SettingsTrack {
    id: number;
    name: string;
}

export interface SettingsProgram {
    id: number;
    name: string;
    language: ProgramLanguageCode;
    tracks: SettingsTrack[];
}

export interface SettingsLanguage {
    code: ProgramLanguageCode;
    name: string;
    elective_types: Array<{ name: string }>;
    programs: SettingsProgram[];
}

export interface SettingsResponse {
    languages: SettingsLanguage[];
}

export interface ProgramDto {
    id: number;
    name: string;
    language: string;
}

export interface TrackDto {
    id: number;
    name: string;
    program: number;
}

export interface ElectiveTypeDto {
    elective_type_name: string;
}

export interface StreamDto {
    id: number;
    degree_year: string;
    program_lang: string;
    elective_type: string;
    programs: number[];
    priorities: number;
}
