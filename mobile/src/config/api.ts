// ============================================================
// DATAFIT Mobile — Configuração centralizada da API
// ============================================================
// A URL é lida da variável de ambiente EXPO_PUBLIC_API_URL
// definida no arquivo .env na raiz do projeto mobile.
//
// No Expo SDK 49+, variáveis que começam com EXPO_PUBLIC_ são
// automaticamente injetadas em process.env — sem necessidade
// de babel-plugin-dotenv ou Constants.expoConfig.
// ============================================================

/**
 * URL base da API REST do DATAFIT.
 *
 * Prioridade:
 *  1. EXPO_PUBLIC_API_URL (variável de ambiente / .env)
 *  2. String vazia (dispara warning no console)
 */
export const API_BASE_URL: string =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, '') || '';

// ---------- validação em tempo de execução ----------
if (!API_BASE_URL) {
  console.warn(
    '[DATAFIT] ⚠️  EXPO_PUBLIC_API_URL não definida!\n' +
      'Crie o arquivo mobile/.env com:\n' +
      '  EXPO_PUBLIC_API_URL=http://SEU_BACKEND_URL\n' +
      'O app não conseguirá se comunicar com a API.',
  );
}

if (
  API_BASE_URL.includes('localhost') ||
  API_BASE_URL.includes('127.0.0.1')
) {
  console.warn(
    '[DATAFIT] ⚠️  API_BASE_URL aponta para localhost/127.0.0.1.\n' +
      'Em dispositivos físicos isso NÃO funciona.\n' +
      'Use o IP da máquina ou um tunnel (ex: ngrok).',
  );
}

// Log para debug rápido
console.log(`[DATAFIT] API_BASE_URL → ${API_BASE_URL || '(vazio)'}`);
