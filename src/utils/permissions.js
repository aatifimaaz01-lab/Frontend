/**
 * Check if the user has a specific permission.
 * Super Admin always returns true (handled server-side, API returns all permissions).
 */
export function hasPermission(permissions, page, action) {
  if (!permissions || !permissions[page]) return false;
  return permissions[page].includes(action);
}
