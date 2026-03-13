export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

const TOKEN_STORAGE_KEY = "bayeux_token";
const USER_STORAGE_KEY = "bayeux_user";

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export function getStoredUser() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
}

export function setStoredUser(user: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export function clearStoredUser() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(USER_STORAGE_KEY);
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };

  const token = getToken();
  if (token) {
    headers["Authorization"] = `Token ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorMessage = `Erro na requisição (${res.status})`;
    try {
      const data = await res.json();
      if (data?.detail) errorMessage = data.detail;
      else if (typeof data === "object") {
        const firstKey = Object.keys(data)[0];
        if (firstKey) {
          const val = (data as any)[firstKey];
          if (Array.isArray(val)) {
            errorMessage = val.join(" ");
          } else if (typeof val === "string") {
            errorMessage = val;
          }
        }
      }
    } catch {
      // ignore
    }
    const error: any = new Error(errorMessage);
    error.status = res.status;
    throw error;
  }

  // Some endpoints return empty body
  if (res.status === 204) {
    return {} as T;
  }

  return (await res.json()) as T;
}

export async function login(email: string, password: string) {
  // Django token auth uses "username" field
  const payload = {
    username: email,
    password,
  };
  return request<{ token: string }>("/auth/login/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function register(form: FormData) {
  return request<{ token: string; user: any }>("/auth/registro/", {
    method: "POST",
    body: form,
  });
}

export async function fetchProfile() {
  return request<any>("/perfil/meu_perfil/");
}

export async function fetchBairros() {
  return request<any>("/bairros/");
}

export async function fetchResidenceValidation() {
  return request<any>("/validacao-residencia/");
}

export async function uploadResidenceValidation(form: FormData) {
  return request<any>("/validacao-residencia/", {
    method: "POST",
    body: form,
  });
}

export async function fetchMyActivities() {
  return request<any>("/atividades/minhas_atividades/");
}

export async function createActivity(form: FormData) {
  return request<any>("/atividades/", {
    method: "POST",
    body: form,
  });
}

export async function fetchMyAchievements() {
  return request<any>("/conquistas/");
}
