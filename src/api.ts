const apiBase = import.meta.env.VITE_API_BASE_URL ?? "";

export function setBrandCSSVars() {
  const r = document.documentElement;
  const p = (name: string, def: string) => r.style.setProperty(name, def);
  p('--fallback-primary',  import.meta.env.VITE_BRAND_PRIMARY ?? '#00326a');
  p('--fallback-accent1',  import.meta.env.VITE_BRAND_ACCENT_1 ?? '#009aa8');
  p('--fallback-accent2',  import.meta.env.VITE_BRAND_ACCENT_2 ?? '#009859');
  p('--fallback-accent3',  import.meta.env.VITE_BRAND_ACCENT_3 ?? '#009c93');
  p('--fallback-link',     import.meta.env.VITE_BRAND_LINK ?? '#4a90e2');
}

export async function api(path: string, opts: RequestInit = {}, token?: string) {
  const url = apiBase.replace(/\/$/, '') + path;
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(opts.headers as any || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, { ...opts, headers });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}
