import type { ElectiveStatus } from './elective';

export interface AdminSidebarItem {
    id: string;
    kind: 'reset' | 'status' | 'type';
    title: string;
    status?: ElectiveStatus;
    electiveType?: string;
}
