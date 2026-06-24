export interface Elective {
  id: string;
  title: string;
  elective_language: 'English' | 'Russian';
  program_language: string;
  format: 'offline' | 'online';
  instructor: string;
  description: string;
  type: 'tech' | 'hum' | 'math';
  degree_year: string[];
  isArchived: boolean;
  backendType: string;
}