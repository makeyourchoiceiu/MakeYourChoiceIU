export type StudentSidebarSectionKind = 'main' | 'elective-type';

export interface StudentSidebarSection {
    key: string;
    label: string;
    kind: StudentSidebarSectionKind;
    electiveType?: string;
    requiredCount?: number;
}

export interface StudentProfileElectiveType {
    type: string;
    label: string;
    requiredCount: number;
}