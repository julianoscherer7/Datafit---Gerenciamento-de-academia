// Centraliza a base URL da API usada pelo frontend
const API_BASE = import.meta.env.VITE_API_URL;

if (!API_BASE) {
  console.error('VITE_API_URL is not configured. Set it in frontend/.env before building.');
}

export default API_BASE;
