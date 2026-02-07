import { jwtDecode } from "jwt-decode";

export interface UserPayload {
  sub: string;
  role?: string;
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
