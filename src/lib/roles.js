export const ADMIN_ROLES = new Set(["ADMIN", "SUPER_ADMIN"]);

export function isAdminRole(role) {
  return ADMIN_ROLES.has(role);
}

export function isSuperAdminRole(role) {
  return role === "SUPER_ADMIN";
}
