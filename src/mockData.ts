import { Announcement, DocumentItem, CelebrationItem, CompanyInfo, AppNotification } from './types';

export const INITIAL_COMPANY_INFO: CompanyInfo = {
  name: 'SOLMAR',
  slogan: 'Portal de Recursos Humanos y Comunicación Interna',
  welcomeMessage: '¡Bienvenido al portal interno de SOLMAR! Consulta novedades, documentos oficiales y festejos del equipo.',
  primaryColor: '#2563eb',
  contactHrEmail: 'rrhh@solmar.com',
  contactHrPhone: '+54 11 4590-8800',
  portalUrl: 'https://rrhh.solmar.internal',
};

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [];
export const INITIAL_DOCUMENTS: DocumentItem[] = [];
export const INITIAL_CELEBRATIONS: CelebrationItem[] = [];
export const INITIAL_NOTIFICATIONS: AppNotification[] = [];
