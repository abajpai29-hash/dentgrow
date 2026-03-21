import axios from 'axios';

// Raw GitHub URL — tunnel.js updates this file automatically on every reconnect
const PUBLIC_URL_RAW =
  'https://raw.githubusercontent.com/abajpai29/dentgrow/master/public-url.txt';

const CACHE_KEY = 'dentgrow_api_url';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

let resolvedBase = null;

async function resolveBase() {
  if (resolvedBase) return resolvedBase;

  // Local dev: use vite proxy
  if (import.meta.env.DEV) {
    resolvedBase = '/api';
    return resolvedBase;
  }

  // Check localStorage cache
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      resolvedBase = cached.url + '/api';
      return resolvedBase;
    }
  } catch {}

  // Fetch current tunnel URL from GitHub
  try {
    const res = await fetch(PUBLIC_URL_RAW + '?t=' + Date.now());
    const url = (await res.text()).trim();
    if (url.startsWith('http')) {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ url, ts: Date.now() }));
      resolvedBase = url + '/api';
      return resolvedBase;
    }
  } catch (e) {
    console.warn('[api] Could not fetch tunnel URL:', e.message);
  }

  // Fallback to build-time env or same-origin
  const fallback = import.meta.env.VITE_API_URL;
  resolvedBase = fallback ? fallback + '/api' : '/api';
  return resolvedBase;
}

const client = axios.create({ headers: { 'Content-Type': 'application/json' } });

client.interceptors.request.use(async (config) => {
  if (!config.baseURL) config.baseURL = await resolveBase();
  const token = localStorage.getItem('dentgrow_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('dentgrow_token');
      localStorage.removeItem('dentgrow_user');
      localStorage.removeItem(CACHE_KEY);
      window.location.href = '/#/login';
    }
    return Promise.reject(err);
  }
);

export default client;
