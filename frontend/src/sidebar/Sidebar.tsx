import { NavLink } from 'react-router-dom';
import { sidebarItems } from './sidebarItems';
import { getUserFromToken } from '../utils/auth';
import { navItemClass } from './navItemClass';

export default function Sidebar() {
  const user = getUserFromToken();
  if (!user) return null;

  return (
    <aside className="w-64 bg-gray-900 min-h-screen">
      <nav className="mt-6 space-y-1 px-2">
        {sidebarItems
          .filter(item => item.roles.includes(user.role))
          .map(item => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }: { isActive: boolean }) =>
                  navItemClass(isActive)
                }
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            );
          })}
      </nav>
    </aside>
  );
}
