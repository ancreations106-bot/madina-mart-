/**
 * Admin Security Utilities for Madina Mart
 * Passwords are never stored in plaintext or logged.
 */

export async function hashPassword(plainText: string): Promise<string> {
  if (!plainText) return '';
  const encoder = new TextEncoder();
  const data = encoder.encode(plainText);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Initial default admin security hash (SHA-256 of the default credential)
export const DEFAULT_ADMIN_PASSWORD_HASH = '1ade942a8448f36f19ea477cb578d43ed34541d7599fb2218a287bb785706b1b';
export const ADMIN_HASH_STORAGE_KEY = 'mm_admin_pwd_hash';
