export type UserRole = 'employee' | 'admin';

export type BranchName =
  | 'Solmar Alem'
  | 'Solmar Yerba Buena'
  | 'Solmar 24 de Septiembre'
  | 'Solmar Concepcion'
  | 'Solmar Aguilares'
  | 'Solmar Central'
  | 'Solmar BRS'
  | '9 de Julio'
  | 'Maipu'
  | 'Junin'
  | 'Lutz Ferrando';

export const ALL_BRANCHES: BranchName[] = [
  'Solmar Alem',
  'Solmar Yerba Buena',
  'Solmar 24 de Septiembre',
  'Solmar Concepcion',
  'Solmar Aguilares',
  'Solmar Central',
  'Solmar BRS',
  '9 de Julio',
  'Maipu',
  'Junin',
  'Lutz Ferrando',
];

export const BRANCH_SLUGS: Record<string, BranchName> = {
  'solmar-alem': 'Solmar Alem',
  'alem': 'Solmar Alem',
  'solmar-yerba-buena': 'Solmar Yerba Buena',
  'yerbabuena': 'Solmar Yerba Buena',
  'yerba-buena': 'Solmar Yerba Buena',
  'solmar-24-de-septiembre': 'Solmar 24 de Septiembre',
  '24deseptiembre': 'Solmar 24 de Septiembre',
  '24-de-septiembre': 'Solmar 24 de Septiembre',
  'solmar-concepcion': 'Solmar Concepcion',
  'concepcion': 'Solmar Concepcion',
  'solmar-aguilares': 'Solmar Aguilares',
  'aguilares': 'Solmar Aguilares',
  'solmar-central': 'Solmar Central',
  'central': 'Solmar Central',
  'solmar-brs': 'Solmar BRS',
  'brs': 'Solmar BRS',
  '9-de-julio': '9 de Julio',
  '9dejulio': '9 de Julio',
  'maipu': 'Maipu',
  'junin': 'Junin',
  'lutz-ferrando': 'Lutz Ferrando',
  'lutzferrando': 'Lutz Ferrando',
};

export const getBranchSlug = (branch: BranchName): string => {
  return branch
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const parseBranchFromQuery = (queryValue: string | null): BranchName | null => {
  if (!queryValue) return null;
  const clean = queryValue.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  // Exact name match
  const exact = ALL_BRANCHES.find(
    (b) => b.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') === clean
  );
  if (exact) return exact;

  // Slug map match
  const slugKey = clean.replace(/[^a-z0-9]/g, '');
  for (const [key, bName] of Object.entries(BRANCH_SLUGS)) {
    if (key.replace(/[^a-z0-9]/g, '') === slugKey) {
      return bName;
    }
  }

  // Substring match
  const partial = ALL_BRANCHES.find((b) =>
    b.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(clean) ||
    clean.includes(b.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
  );
  if (partial) return partial;

  return null;
};

export type OpticsArea =
  | 'RRHH'
  | 'Administración'
  | 'Sistemas'
  | 'Ventas'
  | 'Taller'
  | 'Calibrado'
  | 'Generado'
  | 'Armazones';

export interface AreaTokenInfo {
  id: string;
  areaName: OpticsArea;
  token: string;
  description: string;
  color: string;
  badgeClass: string;
  iconName: string;
}

export type CategoryType = 'General' | 'Eventos' | 'Políticas' | 'Urgente';

export interface AnnouncementComment {
  id: string;
  authorName: string;
  text: string;
  date: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  category: CategoryType;
  pinned: boolean;
  imageUrl?: string;
  likes: number;
  likedBySession?: boolean;
  comments: AnnouncementComment[];
  author: string;
  targetArea?: 'Todas' | OpticsArea;
  targetBranch?: 'Todas' | BranchName;
}

export type DocumentCategory = 'Reglamentos' | 'Políticas' | 'Formularios' | 'Guías' | 'General' | 'Beneficios' | 'Recibos';

export interface DocumentItem {
  id: string;
  title: string;
  category: DocumentCategory;
  description: string;
  fileType: 'PDF' | 'DOCX' | 'XLSX';
  fileSize: string;
  updatedDate: string;
  contentSnippet?: string;
  downloadCount: number;
  fileUrl?: string;
  fileName?: string;
  fileData?: string; // Base64 data URL for uploaded files
  targetBranch?: 'Todas' | BranchName;
}

export interface CelebrationItem {
  id: string;
  employeeName: string;
  department: string;
  avatar?: string;
  date: string; // DD/MM or descriptive
  type: 'birthday' | 'anniversary';
  yearsAtCompany?: number;
  gender?: 'male' | 'female' | 'neutral';
  greetingsCount: number;
  createdAt?: number;
}

export interface AppNotification {
  id: string;
  itemId?: string;
  title: string;
  message: string;
  type: 'announcement' | 'document' | 'celebration' | 'system';
  date: string;
  read: boolean;
  linkTab?: 'feed' | 'documents' | 'celebrations';
  targetBranch?: 'Todas' | BranchName;
}

export interface CompanyInfo {
  name: string;
  logoUrl?: string;
  primaryColor: string;
  slogan: string;
  welcomeMessage: string;
  contactHrEmail: string;
  contactHrPhone: string;
  portalUrl: string;
}
