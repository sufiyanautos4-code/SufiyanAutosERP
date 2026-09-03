import { EveeBike } from '../types';

/**
 * Normalizes a string by converting to lowercase and stripping extra punctuation/spaces
 */
function normalizeText(text?: string | null): string {
  return (text || '').toLowerCase().trim();
}

/**
 * Extracts digits only from a string (e.g. "+92 308-8442179" -> "923088442179")
 */
function extractDigits(text?: string | null): string {
  return (text || '').replace(/\D/g, '');
}

/**
 * Breaks a string into individual word tokens
 */
function splitWords(text?: string | null): string[] {
  return normalizeText(text)
    .split(/[\s\-._,/]+/)
    .filter(Boolean);
}

/**
 * Checks if any word in the text starts with the token, or equals the token,
 * or if the full text starts with the token.
 * This ensures searching "Ali" matches "Ali", "Ali Khan", "Muhammad Ali", but NOT "Bilal Malik" (where "ali" is inside "malik").
 */
function matchNameToken(nameText: string | undefined | null, token: string): boolean {
  if (!nameText) return false;
  const normName = normalizeText(nameText);
  if (!normName) return false;

  // Exact or prefix match on full name
  if (normName.startsWith(token)) return true;

  const words = splitWords(nameText);
  // Check if any word starts with the search token
  return words.some(word => word.startsWith(token));
}

/**
 * Checks if a phone number matches the search token
 */
function matchPhoneToken(phone: string | undefined | null, token: string): boolean {
  if (!phone) return false;
  const rawPhone = normalizeText(phone);
  if (rawPhone.includes(token)) return true;

  const phoneDigits = extractDigits(phone);
  const tokenDigits = extractDigits(token);
  if (tokenDigits.length >= 2) {
    if (phoneDigits.includes(tokenDigits)) return true;
    if (phoneDigits.endsWith(tokenDigits)) return true;
    // Handle Pakistani numbers 0308... matching 92308...
    if (tokenDigits.startsWith('0') && phoneDigits.includes(tokenDigits.slice(1))) {
      return true;
    }
  }
  return false;
}

/**
 * High-precision multi-token search matcher for Evee vehicles & inventory records
 */
export function matchesBikeSearch(bike: EveeBike, query: string): boolean {
  if (!query || !query.trim()) return true;

  const cleanQuery = normalizeText(query);
  const tokens = cleanQuery.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return true;

  // Pre-extract bike attributes for matching
  const chassis = normalizeText(bike.chassisNumber);
  const chassisClean = chassis.replace(/[^a-z0-9]/g, '');
  
  const modelName = normalizeText(bike.modelName);
  const customBikeName = normalizeText(bike.customBikeName);
  const color = normalizeText(bike.color);
  
  const shopName = normalizeText(bike.shopName);
  const saleShopName = normalizeText(bike.saleShopName);
  const invoiceNumber = normalizeText(bike.saleInvoiceNumber);
  const engineDetails = normalizeText(bike.engineMotorDetails);
  const batteryCapacity = normalizeText(bike.batteryCapacity);
  const notes = normalizeText(bike.notes);

  // Status human-readable terms
  let statusTerms = '';
  if (bike.status === 'IN_STOCK') statusTerms = 'in stock available unsold';
  else if (bike.status === 'SOLD_FULL') statusTerms = 'sold cash full payment complete settled';
  else if (bike.status === 'SOLD_INSTALLMENT') statusTerms = 'sold installment active lease hire purchase';

  // Every token in the query must match at least one field on the bike record
  return tokens.every(token => {
    // 1. Customer Full Name (Word-boundary / Prefix match)
    if (matchNameToken(bike.customer?.fullName, token)) return true;
    if (matchNameToken(bike.customer?.fatherOrHusbandName, token)) return true;
    if (matchNameToken(bike.customer?.guarantor1Name, token)) return true;
    if (matchNameToken(bike.customer?.guarantor2Name, token)) return true;

    // 2. Phone Numbers (Normalized digits & raw format)
    if (matchPhoneToken(bike.customer?.phone, token)) return true;
    if (matchPhoneToken(bike.customer?.guarantor1Phone, token)) return true;
    if (matchPhoneToken(bike.customer?.guarantor2Phone, token)) return true;

    // 3. CNIC / ID Number
    if (bike.customer?.cnicOrId) {
      const cnicRaw = normalizeText(bike.customer.cnicOrId);
      const cnicDigits = extractDigits(bike.customer.cnicOrId);
      const tokenDigits = extractDigits(token);
      if (cnicRaw.includes(token)) return true;
      if (tokenDigits.length >= 3 && cnicDigits.includes(tokenDigits)) return true;
    }

    // 4. Chassis / VIN (Substring or alphanumeric match)
    const tokenAlnum = token.replace(/[^a-z0-9]/g, '');
    if (chassis.includes(token)) return true;
    if (tokenAlnum && chassisClean.includes(tokenAlnum)) return true;

    // 5. Model, Custom Name & Color
    if (modelName.includes(token) || customBikeName.includes(token)) return true;
    if (color.startsWith(token) || color.includes(token)) return true;

    // 6. Address & City
    if (matchNameToken(bike.customer?.city, token)) return true;
    if (normalizeText(bike.customer?.address).includes(token)) return true;

    // 7. Shop & Invoice Number
    if (shopName.includes(token) || saleShopName.includes(token)) return true;
    if (invoiceNumber.includes(token)) return true;

    // 8. Technical Specifications & Notes & Status
    if (engineDetails.includes(token) || batteryCapacity.includes(token)) return true;
    if (notes.includes(token)) return true;
    if (statusTerms.includes(token)) return true;

    return false;
  });
}
