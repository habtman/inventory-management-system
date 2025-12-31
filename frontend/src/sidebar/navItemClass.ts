export function navItemClass(
  isActive: boolean,
  mobile = false
) {
  const base = mobile
    ? 'flex items-center gap-3 px-4 py-3'
    : 'flex items-center gap-3 px-3 py-2 rounded';

  return isActive
    ? `${base} bg-indigo-600 text-white`
    : `${base} text-gray-300 hover:bg-gray-700`;
}
