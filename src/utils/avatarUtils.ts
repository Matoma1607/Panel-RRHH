/**
 * Gender detection and clean modern avatar system for SOLMAR RRHH.
 * Provides curated avatars for women, men, and neutral, with automatic name-based detection.
 */

export type DetectedGender = 'male' | 'female' | 'neutral';

// Extensive database of common Argentine / Spanish first names
const FEMALE_NAMES = new Set([
  'maria', 'maría', 'ana', 'laura', 'sofia', 'sofía', 'lucia', 'lucía', 'camila', 'valentina',
  'isabella', 'martina', 'florencia', 'luciana', 'mariana', 'daniela', 'paula', 'carolina',
  'gabriela', 'andrea', 'victoria', 'agustina', 'micaela', 'belen', 'belén', 'rocio', 'rocío',
  'julieta', 'antonella', 'valeria', 'natalia', 'romina', 'patricia', 'claudia', 'silvia',
  'monica', 'mónica', 'alicia', 'susana', 'marina', 'lorena', 'elena', 'veronica', 'verónica',
  'cecilia', 'jimena', 'ximena', 'guadalupe', 'fatima', 'fátima', 'sabrina', 'carla', 'melisa',
  'constanza', 'candelaria', 'eugenia', 'noelia', 'estefania', 'estefanía', 'mora', 'sol',
  'lujan', 'luján', 'milagros', 'pilar', 'juana', 'mercedes', 'teresa', 'rosa', 'beatriz',
  'ines', 'inés', 'marta', 'raquel', 'catalina', 'paloma', 'candela', 'abril', 'jazmin', 'jazmín',
  'clara', 'barbara', 'bárbara', 'brenda', 'daiana', 'dayana', 'gisela', 'gisele', 'yamila',
  'guillermina', 'malena', 'magali', 'magalí', 'tamara', 'evelyn', 'mica', 'flor', 'sofi',
  'solange', 'bianca', 'lourdes', 'danisa', 'aldana', 'gimena', 'lucrecia', 'alina', 'lore'
]);

const MALE_NAMES = new Set([
  'juan', 'carlos', 'matias', 'matías', 'lucas', 'diego', 'nicolas', 'nicolás', 'martin', 'martín',
  'joaquin', 'joaquín', 'mateo', 'santiago', 'franco', 'francisco', 'ignacio', 'agustin', 'agustín',
  'facundo', 'gonzalo', 'federico', 'alejandro', 'manuel', 'javier', 'rodrigo', 'sebastian', 'sebastián',
  'pablo', 'fernando', 'gabriel', 'luciano', 'emiliano', 'leandro', 'esteban', 'marcos', 'maximiliano',
  'cristian', 'christian', 'ezequiel', 'ramiro', 'bautista', 'tomas', 'tomás', 'nahuel', 'ivan', 'iván',
  'julian', 'julián', 'damian', 'damián', 'bruno', 'hugo', 'eduardo', 'jorge', 'ricardo', 'alberto',
  'gustavo', 'mario', 'roberto', 'sergio', 'claudio', 'raul', 'raúl', 'hector', 'héctor', 'oscar',
  'adrian', 'adrián', 'ariel', 'guillermo', 'felipe', 'valentin', 'valentín', 'simon', 'simón',
  'santino', 'benjamin', 'benjamín', 'thiago', 'tiago', 'camilo', 'lisandro', 'alan', 'axel',
  'marcelo', 'horacio', 'dario', 'darío', 'gerardo', 'german', 'germán', 'mati', 'nico', 'nacho'
]);

/**
 * Detects gender from a full name or single first name
 */
export function detectGenderFromName(fullName: string): DetectedGender {
  if (!fullName) return 'neutral';
  
  // Clean titles like "Lic.", "Dr.", "Ing.", "Sr.", "Sra.", "Cdor."
  const clean = fullName
    .toLowerCase()
    .replace(/^(lic\.|dr\.|dra\.|ing\.|sr\.|sra\.|cdor\.|cdora\.|prof\.)\s+/i, '')
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const parts = clean.split(/\s+/);
  const firstName = parts[0];

  if (FEMALE_NAMES.has(firstName)) return 'female';
  if (MALE_NAMES.has(firstName)) return 'male';

  // Suffix heuristic in Spanish:
  // Names ending in 'a' (except 'luca', 'elias', 'josue', 'borja', 'bautista') -> female
  if (firstName.endsWith('a') && !['luca', 'elias', 'josue', 'borja', 'bautista', 'marinao', 'cheba'].includes(firstName)) {
    return 'female';
  }
  // Names ending in 'o', 'or', 'an', 'el', 'on', 'in', 'us' -> male
  if (
    firstName.endsWith('o') ||
    firstName.endsWith('or') ||
    firstName.endsWith('an') ||
    firstName.endsWith('el') ||
    firstName.endsWith('on') ||
    firstName.endsWith('in')
  ) {
    return 'male';
  }

  return 'neutral';
}

/**
 * Curated preset avatars so the user can easily select one
 */
export interface AvatarPreset {
  id: string;
  name: string;
  gender: DetectedGender;
  url: string;
}

export const AVATAR_PRESETS: AvatarPreset[] = [
  // Mujeres
  {
    id: 'f1',
    name: 'Sofía',
    gender: 'female',
    url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Sofia&backgroundColor=ffd5dc&hair=straight01',
  },
  {
    id: 'f2',
    name: 'Camila',
    gender: 'female',
    url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Camila&backgroundColor=ffdfbf&hair=wavy01',
  },
  {
    id: 'f3',
    name: 'Lucía',
    gender: 'female',
    url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Lucia&backgroundColor=c0aede&hair=bun01',
  },
  {
    id: 'f4',
    name: 'Valentina',
    gender: 'female',
    url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Valentina&backgroundColor=d1d4f9&hair=curly01',
  },
  {
    id: 'f5',
    name: 'Florencia',
    gender: 'female',
    url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Florencia&backgroundColor=ffd5dc&hair=straight02',
  },
  // Varones
  {
    id: 'm1',
    name: 'Matías',
    gender: 'male',
    url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Matias&backgroundColor=b6e3f4&hair=short01',
  },
  {
    id: 'm2',
    name: 'Lucas',
    gender: 'male',
    url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Lucas&backgroundColor=c0aede&hair=short02',
  },
  {
    id: 'm3',
    name: 'Martín',
    gender: 'male',
    url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Martin&backgroundColor=d1d4f9&hair=short03',
  },
  {
    id: 'm4',
    name: 'Franco',
    gender: 'male',
    url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Franco&backgroundColor=b6e3f4&hair=short04',
  },
  {
    id: 'm5',
    name: 'Joaquín',
    gender: 'male',
    url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Joaquin&backgroundColor=ffdfbf&hair=short05',
  },
];

/**
 * Returns a high-quality SVG vector avatar URL tailored for name and gender.
 * If the current avatar is an old stock photo (Unsplash), it gets replaced by the modern vector avatar.
 */
export function getSmartAvatarUrl(name: string, explicitGender?: DetectedGender): string {
  const gender = explicitGender || detectGenderFromName(name);
  const safeSeed = encodeURIComponent((name || 'colaborador').trim());

  if (gender === 'female') {
    return `https://api.dicebear.com/7.x/lorelei/svg?seed=${safeSeed}&backgroundColor=ffd5dc,ffdfbf,c0aede,d1d4f9&hair=straight01,straight02,wavy01,curly01,bun01&accessoriesProbability=20`;
  } else if (gender === 'male') {
    return `https://api.dicebear.com/7.x/lorelei/svg?seed=${safeSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf&hair=short01,short02,short03,short04,short05&accessoriesProbability=15`;
  } else {
    return `https://api.dicebear.com/7.x/lorelei/svg?seed=${safeSeed}&backgroundColor=b6e3f4,ffd5dc,d1d4f9,c0aede`;
  }
}

/**
 * Checks if a given avatar string is an outdated stock photo (e.g., Unsplash)
 */
export function isStockPhoto(url?: string): boolean {
  if (!url) return true;
  return url.includes('unsplash.com') || url.includes('images.pexels.com');
}

/**
 * Resolves the cleanest avatar to display:
 * If it's empty or a generic stock photo, uses the smart gender vector avatar.
 */
export function resolveCelebrationAvatar(name: string, currentAvatar?: string, gender?: DetectedGender): string {
  if (!currentAvatar || isStockPhoto(currentAvatar)) {
    return getSmartAvatarUrl(name, gender);
  }
  return currentAvatar;
}
