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

  if (envUrl) {
    console.log('[API Config] Usando VITE_API_URL do .env:', envUrl);
    return envUrl;
  }

  // 2) Detectar modo desenvolvimento - usar proxy do Vite
  if (import.meta.env?.DEV) {
    // Em dev, usar /api que é proxied pelo Vite para localhost:8000
    console.log('[API Config] Modo DEV detectado, usando proxy /api');
    return '/api';
  }

  // 3) Detectar Codespaces/Port Forward: trocar -5173 por -8000
  if (typeof window !== 'undefined') {
    try {
      const { origin, hostname } = window.location;
      if (hostname.endsWith('.app.github.dev') && origin.includes('-5173')) {
        const codespaceUrl = origin.replace('-5173', '-8000');
        console.log('[API Config] Codespaces detectado:', codespaceUrl);
        return codespaceUrl;
      }
    } catch (e) {
      // segue para fallback
    }
  }

  // 4) Fallback local (produção)
  console.warn('[API Config] Fallback para http://localhost:8000');
  return 'http://localhost:8000';
}

const API_BASE = resolveApiBase();

if (!API_BASE) {
  console.error('VITE_API_URL não configurada e fallback falhou. Configure em frontend/.env.');
}

console.log('[API Config] API_BASE final:', API_BASE);

export default API_BASE;
