import {
  HomeIcon,
  ArrowsRightLeftIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

import { type UserRole } from '../utils/auth';


export interface MenuItem {
  label: string;
  path: string;
  icon: React.ElementType;
  roles: UserRole[];
}

export const menuItems: MenuItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: HomeIcon,
    roles: ['admin', 'manager']
  },
  {
    label: 'Stock Transfer',
    path: '/transfer',
    icon: ArrowsRightLeftIcon,
    roles: ['admin', 'manager']
  },
  {
    label: 'Users',
    path: '/admin/users',
    icon: UserGroupIcon,
    roles: ['admin']
  }
];
