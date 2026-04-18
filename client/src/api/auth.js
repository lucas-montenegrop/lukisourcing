import { getApiUrl } from "./client.js";

function parseResponseBody(responseText) {
  if (!responseText) return null;

  try {
    return JSON.parse(responseText);
  } catch {
    return responseText;
  }
}

function normalizeAuthFormData(formData) {
  // WHY: Functionality is more reliable when auth requests send email in one consistent
  // format, so login and register do not break due to accidental spaces or uppercase letters.
  return {
    ...formData,
    email: typeof formData.email === "string" ? formData.email.trim().toLowerCase() : formData.email,
  };
}

async function sendAuthRequest(path, formData, fallbackMessage) {
  // WHY: Normalizing auth input in one shared request helper keeps register and login
  // behavior consistent without repeating the same cleanup in multiple components.
  const normalizedFormData = normalizeAuthFormData(formData);
  const response = await fetch(getApiUrl(path), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(normalizedFormData),
  });

  const responseText = await response.text();
  const data = parseResponseBody(responseText);

  if (!response.ok) {
    throw new Error(typeof data === "string" ? data : fallbackMessage);
  }

  if (!data || typeof data !== "object" || !data.token || !data.user) {
    throw new Error("The server did not return a complete login session.");
  }

  return data;
}

export function registerUser(formData) {
  return sendAuthRequest("/api/users/register", formData, "Unable to create your account.");
}

export function loginUser(formData) {
  return sendAuthRequest("/api/users/login", formData, "Unable to log in.");
}
