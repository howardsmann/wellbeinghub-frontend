// src/api.ts
const apiBase = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

export type AuthUser = {
  numericId: number;
  name: string;
  email: string;
  role: string;
  location: string;
};

// ---------- Auth state helpers ----------
const TOKEN_KEY = "wb_token";
const USER_KEY  = "wb_user";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function getUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as AuthUser; } catch { return null; }
}
export function setUser(u: AuthUser | null) {
  if (u) localStorage.setItem(USER_KEY, JSON.stringify(u));
  else localStorage.removeItem(USER_KEY);
}

// ---------- API wrapper ----------
export async function api<T=any>(path: string, opts: RequestInit = {}, useAuth = false): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(opts.headers as any || {}) };
  if (useAuth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(apiBase + path, { ...opts, headers });
  if (!res.ok) {
    const text = await res.text().catch(()=> "");
    throw new Error(`HTTP ${res.status} – ${res.statusText}${text ? `: ${text}` : ""}`);
  }
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? await res.json() : (undefined as any);
}

// Brand CSS (unchanged)
export function setBrandCSSVars() {
  const r = document.documentElement;
  const set = (n: string, v: string) => r.style.setProperty(n, v);
  set('--fallback-primary',  import.meta.env.VITE_BRAND_PRIMARY ?? '#00326a');
  set('--fallback-accent1',  import.meta.env.VITE_BRAND_ACCENT_1 ?? '#009aa8');
  set('--fallback-accent2',  import.meta.env.VITE_BRAND_ACCENT_2 ?? '#009859');
  set('--fallback-accent3',  import.meta.env.VITE_BRAND_ACCENT_3 ?? '#009c93');
  set('--fallback-link',     import.meta.env.VITE_BRAND_LINK ?? '#4a90e2');
}
