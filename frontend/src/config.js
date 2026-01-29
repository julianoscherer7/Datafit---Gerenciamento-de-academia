// Centraliza a base URL da API usada pelo frontend
function resolveApiBase() {
  // 1) Preferir variável de ambiente do Vite
  let envUrl = import.meta.env?.VITE_API_URL;

  // Sanitizar possíveis erros de concatenação acidental
  if (envUrl && envUrl.includes('VITE_API_URL=')) {
    // Ex.: "http://localhost:8000VITE_API_URL=https://..." -> manter apenas a última URL válida
    const parts = envUrl.split('VITE_API_URL=').map(s => s.trim()).filter(Boolean);
    envUrl = parts[parts.length - 1];
  }

  if (envUrl) return envUrl;

  // 2) Detectar Codespaces/Port Forward: trocar -5173 por -8000
  if (typeof window !== 'undefined') {
    try {
      const { origin, hostname } = window.location;
      if (hostname.endsWith('.app.github.dev') && origin.includes('-5173')) {
        return origin.replace('-5173', '-8000');
      }
    } catch (e) {
      // segue para fallback
    }
  }

  // 3) Fallback local
  return 'http://localhost:8000';
}

const API_BASE = resolveApiBase();

if (!API_BASE) {
  console.error('VITE_API_URL não configurada e fallback falhou. Configure em frontend/.env.');
}

export default API_BASE;
