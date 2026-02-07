import { jwtDecode } from "jwt-decode";

export interface UserPayload {
  sub: string;
  role?: string;
  name?: string;
}

export const getUser = () => {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    return jwtDecode<UserPayload>(token);
  } catch {
    return null;
  }
};

/** Display name for sidebar: name from JWT, or part before @ if sub is email, or "User". */
export function getDisplayFirstName(user: UserPayload): string {
  if (user.name?.trim()) return user.name.trim();
  if (user.sub?.includes("@")) {
    const part = user.sub.split("@")[0];
    if (part) return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
  }
  return "User";
}
