//mport { type UserRole } from '../utils/auth';

import {
  LayoutDashboard,
  ArrowLeftRight,
  Users,
  Settings
} from 'lucide-react';

export type SidebarItem = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: ('admin' | 'manager')[];
};


/*export interface SidebarItem {
  label: string;
  to: string;
  icon: React.ElementType;
  roles: UserRole[];
}*/

export const sidebarItems: SidebarItem[] = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: LayoutDashboard,
    roles: ['admin', 'manager']
  },
  {
    label: 'Stock Transfer',
    to: '/stock-transfer',
    icon: ArrowLeftRight,
    roles: ['admin', 'manager']
  },
  {
    label: 'Users',
    to: '/users',
    icon: Users,
    roles: ['admin']
  },
  {
    label: 'Settings',
    to: '/settings',
    icon: Settings,
    roles: ['admin']
  }
];
