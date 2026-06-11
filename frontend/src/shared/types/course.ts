export interface Course {
  id: string;
  title: string;
  language: 'English' | 'Russian';
  format: 'offline' | 'online';
  instructor: string;
  description: string;
  isFavorite: boolean;
}

export interface UserProfile {
  name: string;
  id: string;
}