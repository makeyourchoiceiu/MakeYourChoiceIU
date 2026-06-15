export interface Course {
  id: string;
  title: string;
  language: 'English' | 'Russian';
  format: 'offline' | 'online';
  instructor: string;
  description: string;
  type: 'tech' | 'hum' | 'math';
  yearOfStudy: number[];
  program: string[];
  isArchived: boolean;
}