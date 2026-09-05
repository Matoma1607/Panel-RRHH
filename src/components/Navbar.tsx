import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  CompanyInfo,
  UserRole,
  AppNotification,
  BranchName,
  Announcement,
  DocumentItem,
  CelebrationItem
} from '../types';
import {
  LogOut,
  ShieldCheck,
  Search,
  Bell,
  MapPin,
  Lock,
  X,
  Radio,
  FileText,
  Cake
} from 'lucide-react';
import { NotificationsPopover } from './NotificationsPopover';

interface NavbarProps {
  companyInfo: CompanyInfo;
  role: UserRole;
  isAdminLoggedIn: boolean;
  userBranch?: BranchName;
  isDirectBranchLink?: boolean;
  onOpenBranchPicker?: () => void;
  activeArea?: string;
  activeEmployeeName?: string;
  notifications?: AppNotification[];
  onMarkNotificationAsRead?: (id: string) => void;
  onClearNotifications?: () => void;
  onDeleteNotification?: (id: string) => void;
  onDeleteAllNotifications?: () => void;
  onOpenLogin: () => void;
  onLogout: () => void;
  onRoleToggle: (role: UserRole) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  globalSearch: string;
  setGlobalSearch: (search: string) => void;
  sessionsCount?: number;
  onOpenSessionManager?: () => void;
  announcements?: Announcement[];
  documents?: DocumentItem[];
  celebrations?: CelebrationItem[];
}

export const Navbar: React.FC<NavbarProps> = ({
  companyInfo,
  role,
  isAdminLoggedIn,
  userBranch,
  isDirectBranchLink = false,
  onOpenBranchPicker,
  activeArea,
  notifications = [],
  onMarkNotificationAsRead = () => {},
  onClearNotifications = () => {},
  onDeleteNotification,
  onDeleteAllNotifications,
  onOpenLogin,
  onLogout,
  onRoleToggle,
  activeTab,
  setActiveTab,
  globalSearch,
  setGlobalSearch,
  announcements = [],
  documents = [],
  celebrations = [],
}) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const notifContainerRef = useRef<HTMLDivElement>(null);

  const query = (globalSearch || '').trim().toLowerCase();

  // Calculate live matches across all sections of the site
  const searchCounts = useMemo(() => {
    if (!query) {
      return { feed: 0, docs: 0, cels: 0, total: 0 };
    }
    const feed = announcements.filter((item) => {
      return (
        (item.title || '').toLowerCase().includes(query) ||
        (item.content || '').toLowerCase().includes(query) ||
        (item.category || '').toLowerCase().includes(query) ||
        (item.targetBranch || '').toLowerCase().includes(query)
      );
    }).length;

    const docs = documents.filter((doc) => {
      return (
        (doc.title || '').toLowerCase().includes(query) ||
        (doc.description || '').toLowerCase().includes(query) ||
        (doc.category || '').toLowerCase().includes(query) ||
        (doc.targetBranch || '').toLowerCase().includes(query)
      );
    }).length;

    const cels = celebrations.filter((cel) => {
      return (
        (cel.employeeName || '').toLowerCase().includes(query) ||
        (cel.department || '').toLowerCase().includes(query) ||
        (cel.date || '').toLowerCase().includes(query) ||
        (cel.type === 'birthday' ? 'cumpleaños cumple' : 'aniversario').includes(query)
      );
    }).length;

    return { feed, docs, cels, total: feed + docs + cels };
  }, [query, announcements, documents, celebrations]);

  const visibleNotifications = notifications.filter((n) => {
    if (!isAdminLoggedIn && userBranch) {
      if (n.targetBranch && n.targetBranch !== 'Todas' && n.targetBranch !== userBranch) {
        return false;
      }
    }
    return true;
  });

  const unreadCount = visibleNotifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifContainerRef.current && !notifContainerRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };

    if (isNotifOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotifOpen]);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 w-full shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-4 min-w-0">
          
          {/* Brand Title */}
          <div
            className="flex items-center gap-2.5 cursor-pointer shrink min-w-0"
            onClick={() => {
              setActiveTab('feed');
              if (role === 'admin' && !isAdminLoggedIn) {
                onRoleToggle('employee');
              }
            }}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <h1 className="font-black text-slate-900 text-base sm:text-xl tracking-tight leading-none truncate">
                  {companyInfo.name}
                </h1>
                <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200 shrink-0">
                  Portal Interno
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block truncate mt-0.5">
                {companyInfo.slogan || 'Portal de Colaboradores'}
              </p>
            </div>
          </div>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-2 relative">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Buscar comunicado, compañero o documento..."
                className="w-full pl-9 pr-8 py-2 bg-slate-100/90 hover:bg-slate-100 focus:bg-white text-xs rounded-xl border border-transparent focus:border-teal-700 focus:outline-none transition-all placeholder:text-slate-400 text-slate-800"
              />
              {globalSearch && (
                <button
                  type="button"
                  onClick={() => setGlobalSearch('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200 transition-colors"
                  title="Limpiar búsqueda"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Cross-Section Results Pill Dropdown */}
            {query.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 p-2 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 animate-in fade-in slide-in-from-top-1 text-xs">
                <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100 px-1 text-[11px] text-slate-400 font-medium">
                  <span>Coincidencias en el portal:</span>
                  <span className="font-bold text-teal-800">{searchCounts.total} encontradas</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab('feed')}
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl font-bold transition-all text-center cursor-pointer ${
                      activeTab === 'feed'
                        ? 'bg-teal-900 text-white shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <Radio className="w-3 h-3 text-teal-400" />
                    <span>Avisos ({searchCounts.feed})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('documents')}
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl font-bold transition-all text-center cursor-pointer ${
                      activeTab === 'documents'
                        ? 'bg-teal-900 text-white shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <FileText className="w-3 h-3 text-blue-400" />
                    <span>Docs ({searchCounts.docs})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('celebrations')}
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl font-bold transition-all text-center cursor-pointer ${
                      activeTab === 'celebrations'
                        ? 'bg-teal-900 text-white shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <Cake className="w-3 h-3 text-pink-400" />
                    <span>Festejos ({searchCounts.cels})</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Mobile Search Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileSearchOpen((prev) => !prev)}
              className={`md:hidden p-2 rounded-xl transition-all border ${
                isMobileSearchOpen || globalSearch
                  ? 'bg-teal-800 text-white border-teal-800'
                  : 'text-slate-600 hover:text-slate-900 bg-slate-100 border-slate-200/80'
              }`}
              title="Buscar en el portal"
              aria-label="Abrir buscador"
            >
              <Search className="w-4 h-4" />
            </button>
            
            {/* Active Branch Pill */}
            {userBranch && (
              isAdminLoggedIn ? (
                <button
                  type="button"
                  onClick={onOpenBranchPicker}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold bg-teal-50 hover:bg-teal-100/80 text-teal-950 border border-teal-200 shadow-2xs transition-colors cursor-pointer"
                  title="Cambiar sucursal para auditar (Modo Administrador)"
                >
                  <MapPin className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                  <span className="truncate max-w-[110px] sm:max-w-[150px]">{userBranch}</span>
                  <span className="text-[10px] text-teal-600 font-mono">✎</span>
                </button>
              ) : (
                <div
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold bg-teal-50 text-teal-950 border border-teal-200 shadow-2xs select-none"
                  title={`Sucursal vinculada a este equipo: ${userBranch} (Bloqueada)`}
                >
                  <MapPin className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                  <span className="truncate max-w-[110px] sm:max-w-[150px]">{userBranch}</span>
                  <Lock className="w-3 h-3 text-teal-600 shrink-0" />
                </div>
              )
            )}

            {/* Notifications Bell */}
            <div ref={notifContainerRef} className="relative shrink-0">
              <button
                type="button"
                onClick={() => setIsNotifOpen((prev) => !prev)}
                className={`relative p-2 rounded-xl transition-all border ${
                  isNotifOpen
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 border-slate-200/80'
                }`}
                title="Notificaciones"
                aria-label="Ver notificaciones"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              <NotificationsPopover
                isOpen={isNotifOpen}
                onClose={() => setIsNotifOpen(false)}
                notifications={notifications}
                onMarkAsRead={onMarkNotificationAsRead}
                onClearAll={onClearNotifications}
                onDeleteNotification={onDeleteNotification}
                onDeleteAll={onDeleteAllNotifications}
                onNavigateTab={setActiveTab}
                userBranch={userBranch}
                isAdminLoggedIn={isAdminLoggedIn}
              />
            </div>

            {/* Direct Admin Status or Login Button */}
            {isAdminLoggedIn ? (
              <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 pl-3 pr-1 py-1 rounded-xl">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-black text-emerald-900">
                    Modo RRHH
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-1 px-2 py-1 text-xs font-bold text-rose-700 hover:bg-rose-100 rounded-lg transition-colors ml-1 cursor-pointer"
                  title="Cerrar sesión de Administrador"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Salir</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#232f32] hover:bg-slate-800 text-white shadow-xs transition-all cursor-pointer"
                title="Acceso exclusivo para administradores de RRHH"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="hidden xs:inline">Ingreso RRHH</span>
              </button>
            )}

          </div>

        </div>

        {/* Mobile Search Bar Dropdown */}
        {isMobileSearchOpen && (
          <div className="md:hidden py-3 border-t border-slate-200/80 animate-in slide-in-from-top-2 duration-150">
            <div className="relative w-full mb-2">
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Buscar avisos, personas o documentos..."
                autoFocus
                className="w-full pl-9 pr-8 py-2 bg-slate-100 focus:bg-white text-xs rounded-xl border border-transparent focus:border-teal-700 focus:outline-none transition-all placeholder:text-slate-400 text-slate-800 shadow-inner"
              />
              {globalSearch && (
                <button
                  type="button"
                  onClick={() => setGlobalSearch('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200 transition-colors"
                  title="Limpiar búsqueda"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {query.length > 0 && (
              <div className="flex items-center gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('feed');
                    setIsMobileSearchOpen(false);
                  }}
                  className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all text-center ${
                    activeTab === 'feed'
                      ? 'bg-teal-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  <Radio className="w-3 h-3 text-teal-400" />
                  <span>Avisos ({searchCounts.feed})</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('documents');
                    setIsMobileSearchOpen(false);
                  }}
                  className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all text-center ${
                    activeTab === 'documents'
                      ? 'bg-teal-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  <FileText className="w-3 h-3 text-blue-400" />
                  <span>Docs ({searchCounts.docs})</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('celebrations');
                    setIsMobileSearchOpen(false);
                  }}
                  className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all text-center ${
                    activeTab === 'celebrations'
                      ? 'bg-teal-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  <Cake className="w-3 h-3 text-pink-400" />
                  <span>Festejos ({searchCounts.cels})</span>
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </header>
  );
};
