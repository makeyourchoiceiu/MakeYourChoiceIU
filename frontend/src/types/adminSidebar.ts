export type AdminSidebarItemType = 'all' | 'tech' | 'hum' | 'math' | 'custom' | string;

export interface AdminSidebarItem {
    type: AdminSidebarItemType;
    title: string;
}