export type ElectiveType = 'tech' | 'hum' | 'math' | 'custom';

export type Elective = {
    id: string;
    title: string;
    teacher: string;
    language: string;
    program: string;
    year: number;
    description: string;
    type: ElectiveType; //
};
