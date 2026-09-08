const clean = (text) => text.replace(/\s+/g, ' ').trim();
const first = (text, patterns) => { for (const pattern of patterns) { const match = text.match(pattern); if (match?.[1]) return clean(match[1]); } return ''; };
export function extractMRP(text) { return first(text, [/(?:M\.?R\.?P\.?|maximum retail price)\s*[:\-]?\s*(?:₹|rs\.?|inr)?\s*([\d,.]+)/i]); }
export function extractNetQuantity(text) { return first(text, [/(?:net\s*(?:quantity|qty)|quantity|qty)\s*[:\-]?\s*([\d.]+\s*(?:kg|g|mg|l|ml|lb|oz|pcs?))/i]); }
export function extractDate(text) { return first(text, [/(?:mfg|manufactur(?:ed|ing)|packed|packing|imported|import)\s*(?:date)?\s*[:\-]?\s*(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}|\w+\s+\d{4})/i]); }
export function extractPhone(text) { return first(text, [/(?:consumer\s*care|helpline|contact)[^\d]{0,20}(\+?\d[\d\s-]{8,14}\d)/i, /(\+?\d[\d\s-]{8,14}\d)/]); }
export function extractEmail(text) { return first(text, [/([\w.+-]+@[\w.-]+\.[A-Za-z]{2,})/]); }
export function extractManufacturer(text) { return first(text, [/(?:manufactured by|manufacturer|mfd\.? by)\s*[:\-]?\s*([^.;\n]+)/i]); }
export function extractDeclarations(text) {
  const normalized = clean(text);
  const values = { mrp: extractMRP(normalized), netQuantity: extractNetQuantity(normalized), date: extractDate(normalized), phone: extractPhone(normalized), email: extractEmail(normalized), manufacturer: extractManufacturer(normalized) };
  return Object.entries(values).map(([key, value]) => ({ key, label: key === 'netQuantity' ? 'Net Quantity' : key === 'mrp' ? 'MRP' : key.charAt(0).toUpperCase() + key.slice(1), value, status: value ? 'Found' : 'Not Found', confidence: value ? 0.91 : 0.88 }));
}
