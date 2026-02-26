// ============================================================
// DATAFIT Mobile — Storage seguro para JWT
// ============================================================
// Usa expo-secure-store (Keychain no iOS, EncryptedSharedPrefs
// no Android). NÃO usar AsyncStorage para tokens.
// ============================================================

import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'token';

/**
 * Salva o JWT no storage seguro do dispositivo.
 */
export async function saveToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

/**
 * Recupera o JWT do storage seguro.
 * Retorna `null` se não houver token armazenado.
 */
export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

/**
 * Remove o JWT do storage seguro (logout).
 */
export async function removeToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}
