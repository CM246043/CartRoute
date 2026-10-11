import { UserShoppingItem, RouteStrategyPlan } from '../types/grocery';
import { CATALOG_ITEMS } from '../data/catalog';
import {
  sanitizeCsvCell,
  sanitizeText,
  sanitizeQuantity,
  validateAndSanitizeItem,
  SECURITY_LIMITS,
} from './security';

// Format shopping list as clean plain text
export function formatListAsText(
  items: UserShoppingItem[],
  plan?: RouteStrategyPlan
): string {
  let text = `🛒 CartRoute Shopping List (${items.length} items)\n`;
  text += `Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}\n\n`;

  if (plan && plan.stops.length > 0) {
    text += `📍 RECOMMENDED SHOPPING ROUTE:\n`;
    text += `Strategy: ${plan.title}\n`;
    text += `Estimated Groceries: $${plan.groceryTotal.toFixed(2)} | Fuel: $${plan.fuelCost.toFixed(2)} | Distance: ${plan.totalDistanceMiles} miles\n\n`;

    plan.stops.forEach((stop) => {
      text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      text += `STOP #${stop.stopNumber}: ${stop.store.name.toUpperCase()}\n`;
      text += `Address: ${stop.store.address}, ${stop.store.city}, ${stop.store.state}\n`;
      text += `Store Subtotal: $${stop.finalTotal.toFixed(2)}\n`;
      text += `Items to buy here:\n`;
      stop.items.forEach((itemObj) => {
        const u = itemObj.userItem;
        const couponNote = itemObj.couponApplied
          ? ` [✂️ Clip: -$${itemObj.couponApplied.discountValue.toFixed(2)}]`
          : '';
        text += `  [ ] ${u.quantity} ${u.unit} ${sanitizeText(u.name)} — $${itemObj.price.toFixed(2)} (${itemObj.aisle})${couponNote}\n`;
      });
      text += `\n`;
    });
  } else {
    // Group by category
    const categories = Array.from(new Set(items.map((i) => i.category)));
    categories.forEach((cat) => {
      text += `📁 ${cat.toUpperCase()}:\n`;
      const catItems = items.filter((i) => i.category === cat);
      catItems.forEach((i) => {
        text += `  [ ] ${i.quantity} ${i.unit} ${sanitizeText(i.name)}\n`;
      });
      text += `\n`;
    });
  }

  text += `\nCreated with CartRoute — Smart Grocery & Route Optimizer`;
  return text;
}

// Generate CSV string for export with anti-formula injection hardening
export function formatListAsCSV(items: UserShoppingItem[]): string {
  const headers = ['Item Name', 'Quantity', 'Unit', 'Category', 'Allow Substitutions', 'Notes'];
  const rows = items.slice(0, SECURITY_LIMITS.MAX_LIST_ITEMS).map((item) => [
    sanitizeCsvCell(item.name),
    sanitizeQuantity(item.quantity),
    sanitizeCsvCell(item.unit),
    sanitizeCsvCell(item.category),
    item.allowSubstitutions ? '"Yes"' : '"No"',
    sanitizeCsvCell(item.notes || ''),
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

// Trigger browser download for a text/JSON file safely
export function triggerFileDownload(content: string, filename: string, mimeType: string) {
  // Cap download payload to prevent browser memory exhaustion
  if (content.length > 2 * 1024 * 1024) return;
  const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = safeFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Generate Google Maps Directions URL for the route with strict whitelist
export function generateGoogleMapsRouteUrl(plan: RouteStrategyPlan): string {
  if (!plan?.stops || plan.stops.length === 0) return 'https://www.google.com/maps';

  // Strict whitelist for address query parameters
  const cleanParam = (str: string) => encodeURIComponent(str.replace(/[^a-zA-Z0-9\s,.-]/g, '').trim().slice(0, 80));

  const origin = cleanParam('Central Phoenix, AZ');
  const lastStop = plan.stops[plan.stops.length - 1];
  const destination = cleanParam(`${lastStop.store.address}, ${lastStop.store.city}, AZ`);

  if (plan.stops.length === 1) {
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
  }

  // Intermediate waypoints
  const waypoints = plan.stops
    .slice(0, plan.stops.length - 1)
    .map((s) => cleanParam(`${s.store.address}, ${s.store.city}, AZ`))
    .join('|');

  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}&travelmode=driving`;
}

// Parse free-form pasted text into shopping list items with strict bounds
export function parsePastedShoppingText(rawText: string): UserShoppingItem[] {
  // Enforce max text input length to prevent ReDoS / CPU lock
  const boundedText = (rawText || '').slice(0, SECURITY_LIMITS.MAX_TEXT_INPUT_CHARS);

  const lines = boundedText
    .split(/[\n,;]+/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('#') && !l.startsWith('//'))
    .slice(0, SECURITY_LIMITS.MAX_LIST_ITEMS);

  const parsedItems: UserShoppingItem[] = [];

  for (const line of lines) {
    // Remove bullet points like "[ ]", "-", "*", numbers like "1."
    const cleanLine = line.replace(/^(\[.*?\]|[-*•]|\d+\.)\s*/, '').trim().slice(0, 100);
    if (!cleanLine) continue;

    // Try to match quantity + unit + item name, e.g. "2 gal milk", "3 lbs chicken breast", "1 dozen eggs"
    const regex = /^(\d+(?:\.\d+)?|\d+\/\d+)?\s*(gallons?|gal|lbs?|pounds?|doz(?:en)?|ct|packs?|boxes?|jars?|bottles?|tubs?|bags?|cans?|loaf|loaves|each)?\s*(.+)$/i;
    const match = cleanLine.match(regex);

    let qty = 1;
    let unit = 'unit';
    let itemName = cleanLine;

    if (match) {
      if (match[1]) {
        if (match[1].includes('/')) {
          const [n, d] = match[1].split('/');
          const parsedD = parseFloat(d);
          qty = parsedD !== 0 ? parseFloat(n) / parsedD : 1;
        } else {
          qty = parseFloat(match[1]) || 1;
        }
      }
      if (match[2]) {
        unit = match[2].toLowerCase();
      }
      if (match[3]) {
        itemName = match[3].trim();
      }
    }

    const safeItemName = sanitizeText(itemName, SECURITY_LIMITS.MAX_ITEM_NAME_LENGTH);
    if (!safeItemName) continue;

    const safeQty = sanitizeQuantity(qty);

    // Try to fuzzy match with catalog
    const lowerName = safeItemName.toLowerCase();
    const matchedCatalog = CATALOG_ITEMS.find((c) => {
      const cLower = c.name.toLowerCase();
      return (
        cLower.includes(lowerName) ||
        lowerName.includes(c.id.replace(/_/g, ' ')) ||
        (lowerName.includes('milk') && c.id === 'whole_milk') ||
        (lowerName.includes('egg') && c.id === 'large_eggs') ||
        (lowerName.includes('chicken') && c.id === 'chicken_breast') ||
        (lowerName.includes('beef') && c.id === 'ground_beef_85') ||
        (lowerName.includes('bread') && c.id.includes('bread')) ||
        (lowerName.includes('apple') && c.id === 'honeycrisp_apples') ||
        (lowerName.includes('banana') && c.id === 'bananas') ||
        (lowerName.includes('avocado') && c.id === 'hass_avocados') ||
        (lowerName.includes('coffee') && c.id === 'ground_coffee') ||
        (lowerName.includes('oat') && c.id === 'rolled_oats') ||
        (lowerName.includes('oil') && c.id === 'extra_virgin_olive_oil') ||
        (lowerName.includes('paper towel') && c.id === 'paper_towels') ||
        (lowerName.includes('toilet paper') && c.id === 'toilet_paper') ||
        (lowerName.includes('rice') && c.id === 'jasmine_rice') ||
        (lowerName.includes('pasta') && c.id === 'pasta_spaghetti') ||
        (lowerName.includes('butter') && c.id === 'unsalted_butter')
      );
    });

    if (matchedCatalog) {
      parsedItems.push({
        id: `imported_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        catalogItemId: matchedCatalog.id,
        name: matchedCatalog.name,
        quantity: safeQty || matchedCatalog.defaultQty,
        unit: unit !== 'unit' ? sanitizeText(unit, 15) : matchedCatalog.defaultUnit,
        category: matchedCatalog.category,
        allowSubstitutions: true,
      });
    } else {
      // Custom item with strict sanitization
      parsedItems.push({
        id: `imported_custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        catalogItemId: 'pasta_spaghetti', // fallback closest catalog ID for pricing calculation
        name: safeItemName,
        quantity: safeQty,
        unit: unit !== 'unit' ? sanitizeText(unit, 15) : 'each',
        category: 'Pantry & Bakery',
        allowSubstitutions: true,
      });
    }

    if (parsedItems.length >= SECURITY_LIMITS.MAX_LIST_ITEMS) break;
  }

  return parsedItems;
}
