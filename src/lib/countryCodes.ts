export interface CountryCodeItem {
  name: string;
  code: string;
  flag: string;
  region: string;
  iso: string;
  example: string;
}

export const COUNTRY_CODES: CountryCodeItem[] = [
  // Chile (Predeterminado)
  { name: 'Chile', code: '+56', flag: '🇨🇱', region: 'Sudamérica', iso: 'CL', example: '9 8765 4321' },
  
  // Sudamérica
  { name: 'Argentina', code: '+54', flag: '🇦🇷', region: 'Sudamérica', iso: 'AR', example: '9 11 1234 5678' },
  { name: 'Brasil', code: '+55', flag: '🇧🇷', region: 'Sudamérica', iso: 'BR', example: '11 91234 5678' },
  { name: 'Perú', code: '+51', flag: '🇵🇪', region: 'Sudamérica', iso: 'PE', example: '912 345 678' },
  { name: 'Colombia', code: '+57', flag: '🇨🇴', region: 'Sudamérica', iso: 'CO', example: '310 123 4567' },
  { name: 'Uruguay', code: '+598', flag: '🇺🇾', region: 'Sudamérica', iso: 'UY', example: '99 123 456' },
  { name: 'Paraguay', code: '+595', flag: '🇵🇾', region: 'Sudamérica', iso: 'PY', example: '981 123 456' },
  { name: 'Bolivia', code: '+591', flag: '🇧🇴', region: 'Sudamérica', iso: 'BO', example: '7123 4567' },
  { name: 'Ecuador', code: '+593', flag: '🇪🇨', region: 'Sudamérica', iso: 'EC', example: '99 123 4567' },
  { name: 'Venezuela', code: '+58', flag: '🇻🇪', region: 'Sudamérica', iso: 'VE', example: '412 123 4567' },

  // Norteamérica
  { name: 'Estados Unidos', code: '+1', flag: '🇺🇸', region: 'Norteamérica', iso: 'US', example: '202 555 0123' },
  { name: 'Canadá', code: '+1', flag: '🇨🇦', region: 'Norteamérica', iso: 'CA', example: '416 555 0123' },
  { name: 'México', code: '+52', flag: '🇲🇽', region: 'Norteamérica', iso: 'MX', example: '55 1234 5678' },

  // Centroamérica y Caribe
  { name: 'Panamá', code: '+507', flag: '🇵🇦', region: 'Centroamérica', iso: 'PA', example: '6123 4567' },
  { name: 'Costa Rica', code: '+506', flag: '🇨🇷', region: 'Centroamérica', iso: 'CR', example: '8123 4567' },
  { name: 'Guatemala', code: '+502', flag: '🇬🇹', region: 'Centroamérica', iso: 'GT', example: '5123 4567' },
  { name: 'República Dominicana', code: '+1809', flag: '🇩🇴', region: 'Centroamérica', iso: 'DO', example: '809 123 4567' },
  { name: 'Puerto Rico', code: '+1787', flag: '🇵🇷', region: 'Centroamérica', iso: 'PR', example: '787 123 4567' },
  { name: 'El Salvador', code: '+503', flag: '🇸🇻', region: 'Centroamérica', iso: 'SV', example: '7123 4567' },
  { name: 'Honduras', code: '+504', flag: '🇭🇳', region: 'Centroamérica', iso: 'HN', example: '9123 4567' },
  { name: 'Nicaragua', code: '+505', flag: '🇳🇮', region: 'Centroamérica', iso: 'NI', example: '8123 4567' },

  // Europa
  { name: 'España', code: '+34', flag: '🇪🇸', region: 'Europa', iso: 'ES', example: '612 345 678' },
  { name: 'Francia', code: '+33', flag: '🇫🇷', region: 'Europa', iso: 'FR', example: '6 12 34 56 78' },
  { name: 'Alemania', code: '+49', flag: '🇩🇪', region: 'Europa', iso: 'DE', example: '151 12345678' },
  { name: 'Reino Unido', code: '+44', flag: '🇬🇧', region: 'Europa', iso: 'GB', example: '7911 123456' },
  { name: 'Italia', code: '+39', flag: '🇮🇹', region: 'Europa', iso: 'IT', example: '312 345 6789' },
  { name: 'Portugal', code: '+351', flag: '🇵🇹', region: 'Europa', iso: 'PT', example: '912 345 678' },
  { name: 'Suiza', code: '+41', flag: '🇨🇭', region: 'Europa', iso: 'CH', example: '79 123 45 67' },
  { name: 'Países Bajos', code: '+31', flag: '🇳🇱', region: 'Europa', iso: 'NL', example: '6 12345678' },
  { name: 'Bélgica', code: '+32', flag: '🇧🇪', region: 'Europa', iso: 'BE', example: '470 12 34 56' },
  { name: 'Suecia', code: '+46', flag: '🇸🇪', region: 'Europa', iso: 'SE', example: '70 123 45 67' },
  { name: 'Noruega', code: '+47', flag: '🇳🇴', region: 'Europa', iso: 'NO', example: '912 34 567' },
  { name: 'Dinamarca', code: '+45', flag: '🇩🇰', region: 'Europa', iso: 'DK', example: '20 12 34 56' },
  { name: 'Austria', code: '+43', flag: '🇦🇹', region: 'Europa', iso: 'AT', example: '664 1234567' },
  { name: 'Irlanda', code: '+353', flag: '🇮🇪', region: 'Europa', iso: 'IE', example: '83 123 4567' },

  // Asia y Oceanía
  { name: 'Australia', code: '+61', flag: '🇦🇺', region: 'Asia y Oceanía', iso: 'AU', example: '412 345 678' },
  { name: 'Nueva Zelanda', code: '+64', flag: '🇳🇿', region: 'Asia y Oceanía', iso: 'NZ', example: '21 123 4567' },
  { name: 'Japón', code: '+81', flag: '🇯🇵', region: 'Asia y Oceanía', iso: 'JP', example: '90 1234 5678' },
  { name: 'China', code: '+86', flag: '🇨🇳', region: 'Asia y Oceanía', iso: 'CN', example: '138 1234 5678' },
  { name: 'Singapur', code: '+65', flag: '🇸🇬', region: 'Asia y Oceanía', iso: 'SG', example: '8123 4567' },
  { name: 'Corea del Sur', code: '+82', flag: '🇰🇷', region: 'Asia y Oceanía', iso: 'KR', example: '10 1234 5678' },
  { name: 'Emiratos Árabes Unidos', code: '+971', flag: '🇦🇪', region: 'Asia y Oceanía', iso: 'AE', example: '50 123 4567' },
  { name: 'Israel', code: '+972', flag: '🇮🇱', region: 'Asia y Oceanía', iso: 'IL', example: '50 123 4567' },
  { name: 'India', code: '+91', flag: '🇮🇳', region: 'Asia y Oceanía', iso: 'IN', example: '98123 45678' },

  // África
  { name: 'Sudáfrica', code: '+27', flag: '🇿🇦', region: 'África', iso: 'ZA', example: '71 123 4567' },
  { name: 'Egipto', code: '+20', flag: '🇪🇬', region: 'África', iso: 'EG', example: '10 1234 5678' },
  { name: 'Marruecos', code: '+212', flag: '🇲🇦', region: 'África', iso: 'MA', example: '612 345678' },
  { name: 'Kenia', code: '+254', flag: '🇰🇪', region: 'África', iso: 'KE', example: '712 345678' },
  { name: 'Nigeria', code: '+234', flag: '🇳🇬', region: 'África', iso: 'NG', example: '802 123 4567' },
];
