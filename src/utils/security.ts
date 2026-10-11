import { UserShoppingItem } from '../types/grocery';
import { CATALOG_ITEMS } from '../data/catalog';

export const SECURITY_LIMITS = {
  MAX_LIST_ITEMS: 120,
  MAX_TEXT_INPUT_CHARS: 25000,
  MAX_FILE_UPLOAD_BYTES: 256 * 1024, // 256 KB
  MAX_ITEM_NAME_LENGTH: 80,
  MAX_NOTES_LENGTH: 120,
  MIN_QUANTITY: 0.1,
  MAX_QUANTITY: 999,
  MIN_MPG: 5,
  MAX_MPG: 150,
  MIN_GAS_PRICE: 0.5,
  MAX_GAS_PRICE: 25.0,
};

// Strip HTML tags, script injections, null bytes, and dangerous characters
export function sanitizeText(raw: unknown, maxLength = SECURITY_LIMITS.MAX_ITEM_NAME_LENGTH): string {
  if (typeof raw !== 'string') return '';
  return raw
    .replace(/<[^>]*>?/gm, '') // Strip HTML / XML / SVG tags
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Strip control characters & null bytes
    .replace(/[^\w\s.,!&'()\-/%]/g, '') // Whitelist common punctuation & alphanumeric
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

// Neutralize CSV Formula Injection (DDE attacks via Excel / Google Sheets)
export function sanitizeCsvCell(val: unknown): string {
  if (val === null || val === undefined) return '""';
  let str = String(val).replace(/[\0\r\n]/g, ' ').trim();

  // If cell starts with formula trigger (=, +, -, @, \t, \r, %, |), escape with single quote
  if (/^[=+\-@\t\r%|]/.test(str)) {
    str = `'${str}`;
  }

  return `"${str.replace(/"/g, '""')}"`;
}

// Clamp quantities to safe finite floating point numbers
export function sanitizeQuantity(raw: unknown): number {
  const num = Number(raw);
  if (!Number.isFinite(num) || isNaN(num)) return 1;
  const clamped = Math.max(SECURITY_LIMITS.MIN_QUANTITY, Math.min(SECURITY_LIMITS.MAX_QUANTITY, num));
  return +clamped.toFixed(2);
}

// Deeply validate and sanitize a user shopping item
export function validateAndSanitizeItem(candidate: unknown, fallbackIdPrefix = 'item'): UserShoppingItem | null {
  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
    return null;
  }

  // Prototype pollution guard
  const dangerousKeys = ['__proto__', 'constructor', 'prototype'];
  for (const k of dangerousKeys) {
    if (Object.prototype.hasOwnProperty.call(candidate, k)) {
      return null;
    }
  }

  const obj = candidate as Record<string, unknown>;

  const rawName = typeof obj.name === 'string' ? obj.name : '';
  const sanitizedName = sanitizeText(rawName, SECURITY_LIMITS.MAX_ITEM_NAME_LENGTH);
  if (!sanitizedName) return null;

  const rawUnit = typeof obj.unit === 'string' ? obj.unit : 'unit';
  const sanitizedUnit = sanitizeText(rawUnit, 20) || 'unit';

  const rawCategory = typeof obj.category === 'string' ? obj.category : 'Pantry & Bakery';
  const allowedCategories = [
    'Produce',
    'Dairy & Eggs',
    'Meat & Seafood',
    'Pantry & Bakery',
    'Beverages & Snacks',
    'Household',
  ];
  const category = allowedCategories.includes(rawCategory) ? rawCategory : 'Pantry & Bakery';

  // Find nearest valid catalog ID or fallback
  const rawCatalogId = typeof obj.catalogItemId === 'string' ? obj.catalogItemId : '';
  const isValidCatalog = CATALOG_ITEMS.some((c) => c.id === rawCatalogId);
  const catalogItemId = isValidCatalog ? rawCatalogId : 'pasta_spaghetti';

  const quantity = sanitizeQuantity(obj.quantity);

  const rawNotes = typeof obj.notes === 'string' ? obj.notes : '';
  const notes = sanitizeText(rawNotes, SECURITY_LIMITS.MAX_NOTES_LENGTH);

  const safeId = `${fallbackIdPrefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  return {
    id: safeId,
    catalogItemId,
    name: sanitizedName,
    quantity,
    unit: sanitizedUnit,
    category,
    allowSubstitutions: Boolean(obj.allowSubstitutions ?? true),
    notes: notes || undefined,
    checked: Boolean(obj.checked ?? false),
  };
}

// Safe localStorage wrapper that guards against quota exhaustion and tampering
export function safeLocalStorageSet(key: string, value: unknown): boolean {
  try {
    const serialized = JSON.stringify(value);
    // Limit to reasonable payload size (max 500 KB per key)
    if (serialized.length > 500 * 1024) return false;
    localStorage.setItem(key, serialized);
    return true;
  } catch (err) {
    // QuotaExceededError or security block
    return false;
  }
}

// Safe localStorage get with fallback
export function safeLocalStorageGet<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    const parsed = JSON.parse(item);
    return parsed !== null && parsed !== undefined ? parsed : fallback;
  } catch {
    return fallback;
  }
}
