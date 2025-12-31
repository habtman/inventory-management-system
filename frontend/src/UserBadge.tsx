import { getUserFromToken } from './utils/auth';

export default function UserBadge() {
  const user = getUserFromToken();
  if (!user) return null;

  const roleColor =
    user.role === 'admin'
      ? 'bg-red-100 text-red-700'
      : 'bg-blue-100 text-blue-700';

  const initials = user.email
    ? user.email.charAt(0).toUpperCase()
    : 'U';

  return (
    <div className="flex items-center gap-3">
      {/* Avatar */}
      <div className="w-9 h-9 rounded-full bg-indigo-600 text-white
                      flex items-center justify-center font-semibold">
        {initials}
      </div>

      {/* Info */}
      <div className="leading-tight">
        <div className="text-sm font-medium text-gray-900">
          {user.email ?? 'User'}
        </div>

        <span
          className={`inline-block mt-0.5 px-2 py-0.5 rounded-full
          text-xs font-semibold ${roleColor}`}
        >
          {user.role.toUpperCase()}
        </span>
      </div>
    </div>
  );
}
