export type ElectiveStatus = -1 | 0 | 1;

export interface ElectiveDto {
    id: number;
    name: string;
    instructor: string; // как приходит с бэка
    description: string;
    elective_language: string;
    status: ElectiveStatus;
    prerequisite: string;
    elective_type: string;
    program_language: string;
    degree_year: string[];
}

export interface Elective {
    id: number;
    name: string;
    instructor: string; // как используем на фронте
    description: string;
    electiveLanguage: string;
    status: ElectiveStatus;
    prerequisite: string;
    electiveType: string;
    programLanguage: string;
    degreeYear: string[];
}
