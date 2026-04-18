//WHY:  Simplified url logic and removed unnecessary parse logic

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export function getApiUrl(path) {
  if (!API_BASE_URL) {
    return path;
  }

  return `${API_BASE_URL}${path}`;
}
