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

/**
 * Formats large amounts compactly with Chilean financial abbreviations:
 * >= 1.000.000.000: $XB (e.g. $1,2B)
 * >= 1.000.000: $XM (e.g. $51,05M, $15M)
 * >= 10.000: $Xk (e.g. $500k, $45k)
 * < 10.000: $X.XXX (e.g. $8.500)
 */
export const formatCompactClp = (amount: number | string | undefined | null): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : Number(amount || 0);
  if (!num || isNaN(num)) return '$0';
  const abs = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  if (abs >= 1_000_000_000) {
    const val = abs / 1_000_000_000;
    const formatted = val.toLocaleString('es-CL', {
      minimumFractionDigits: 0,
      maximumFractionDigits: val % 1 === 0 ? 0 : 2,
    });
    return `${sign}$${formatted}B`;
  }
  if (abs >= 1_000_000) {
    const val = abs / 1_000_000;
    const formatted = val.toLocaleString('es-CL', {
      minimumFractionDigits: 0,
      maximumFractionDigits: val % 1 === 0 ? 0 : (Math.round(val * 10) % 10 === 0 ? 1 : 2),
    });
    return `${sign}$${formatted}M`;
  }
  if (abs >= 10_000) {
    const val = abs / 1_000;
    const formatted = val.toLocaleString('es-CL', {
      minimumFractionDigits: 0,
      maximumFractionDigits: val % 1 === 0 ? 0 : 1,
    });
    return `${sign}$${formatted}k`;
  }
  return `${sign}$${abs.toLocaleString('es-CL')}`;
};
