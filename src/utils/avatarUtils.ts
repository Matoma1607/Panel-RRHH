/**
 * Gender detection and avatar system for SOLMAR RRHH.
 * Direct implementation of user-provided silhouette avatars for men and women.
 */

export type DetectedGender = 'male' | 'female' | 'neutral';

// User-provided avatar URLs:
export const AVATAR_MAN =
  'https://i.postimg.cc/sDzK8QGX/perfil-de-avatar-hombre-silueta-de-cara-masculina-o-icono-aislado-sobre-fondo-blanco.jpg';
export const AVATAR_WOMAN =
  'https://i.postimg.cc/vBWfLhz0/depositphotos-93633446-stock-photo-silhouette-of-a-womans-face.webp';

// Extensive database of common Argentine / Spanish female first names
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
  'solange', 'bianca', 'lourdes', 'danisa', 'aldana', 'gimena', 'lucrecia', 'alina', 'lore',
  'romi', 'nati', 'vane', 'vanesa', 'angeles', 'ángeles', 'caro', 'gabi', 'agus', 'valen', 'paola'
]);

// Extensive database of common Argentine / Spanish male first names
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
  'marcelo', 'horacio', 'dario', 'darío', 'gerardo', 'german', 'germán', 'mati', 'nico', 'nacho',
  'maxi', 'seba', 'ale', 'fede', 'facu', 'santi', 'joaco', 'manu', 'leo', 'leonardo', 'mauro'
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
  // Names ending in 'a' (except known exceptions) -> female
  if (firstName.endsWith('a') && !['luca', 'elias', 'josue', 'borja', 'bautista', 'marinao', 'cheba', 'sasha'].includes(firstName)) {
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
 * Returns the exact direct avatar URL:
 * Female -> AVATAR_WOMAN
 * Male / Neutral -> AVATAR_MAN
 */
export function getSmartAvatarUrl(name: string, explicitGender?: DetectedGender): string {
  const gender = explicitGender || detectGenderFromName(name);
  if (gender === 'female') {
    return AVATAR_WOMAN;
  }
  return AVATAR_MAN;
}

/**
 * Checks if a given avatar string is an outdated placeholder or stock photo
 */
export function isOldStockOrPlaceholder(url?: string): boolean {
  if (!url) return true;
  return (
    url.includes('unsplash.com') ||
    url.includes('images.pexels.com') ||
    url.includes('dicebear.com')
  );
}

/**
 * Resolves the appropriate avatar:
 * If no avatar or if it's an old stock photo / generic placeholder, returns the corresponding gender silhouette.
 */
export function resolveCelebrationAvatar(name: string, currentAvatar?: string, gender?: DetectedGender): string {
  if (!currentAvatar || isOldStockOrPlaceholder(currentAvatar)) {
    return getSmartAvatarUrl(name, gender);
  }
  return currentAvatar;
}
