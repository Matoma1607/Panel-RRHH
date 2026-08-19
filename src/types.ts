export type UserRole = 'employee' | 'admin';

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
}

export interface CelebrationItem {
  id: string;
  employeeName: string;
  department: string;
  avatar?: string;
  date: string; // DD/MM or descriptive
  type: 'birthday' | 'anniversary';
  yearsAtCompany?: number;
  greetingsCount: number;
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
