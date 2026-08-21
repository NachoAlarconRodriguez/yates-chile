/**
 * Formatting utilities for Yates Chile
 */

/**
 * Formats a Chilean RUT/Passport string into the standard format XX.XXX.XXX-X
 */
export const formatRut = (value: string): string => {
  const clean = value.replace(/[\s.-]/g, '');
  if (clean.length === 0) return '';
  
  if (/[^0-9kK]/.test(clean)) {
    return clean.toUpperCase();
  }
  
  const limited = clean.substring(0, 9);
  if (limited.length === 1) {
    return limited.toUpperCase();
  }
  
  const body = limited.slice(0, -1);
  const dv = limited.slice(-1).toUpperCase();
  
  let formattedBody = '';
  let count = 0;
  for (let i = body.length - 1; i >= 0; i--) {
    formattedBody = body.charAt(i) + formattedBody;
    count++;
    if (count === 3 && i > 0) {
      formattedBody = '.' + formattedBody;
      count = 0;
    }
  }
  
  return `${formattedBody}-${dv}`;
};

/**
 * Formats a phone number dynamically as the user types into:
 * +xx x xxxx xxxx (e.g. +56 9 5333 2492 or +56 9 1234 5678)
 */
export const formatPhone = (raw: string): string => {
  if (!raw) return '';
  const trimmed = raw.trim();
  if (trimmed === '+') return '+';

  let digits = raw.replace(/\D/g, '');
  if (!digits) return '';

  const hadPlus = trimmed.startsWith('+');
  // Auto prefix 56 for Chilean standard 9-digit direct input starting with 9
  if (!hadPlus && digits.startsWith('9') && digits.length <= 9) {
    digits = '56' + digits;
  }

  const limited = digits.substring(0, 12);

  if (limited.length <= 2) {
    return `+${limited}`;
  }
  if (limited.length <= 3) {
    return `+${limited.slice(0, 2)} ${limited.slice(2)}`;
  }
  if (limited.length <= 7) {
    return `+${limited.slice(0, 2)} ${limited.slice(2, 3)} ${limited.slice(3)}`;
  }
  return `+${limited.slice(0, 2)} ${limited.slice(2, 3)} ${limited.slice(3, 7)} ${limited.slice(7)}`;
};
