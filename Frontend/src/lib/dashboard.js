export const STUDENT_ROLES = ["student", "tenant"];

export function getDashboardRole(role) {
  if (!role || role === "tenant") return "student";
  return role;
}

export function getDashboardBasePath(role) {
  return `/dashboard/${getDashboardRole(role)}`;
}
