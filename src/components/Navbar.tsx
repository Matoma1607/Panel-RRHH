import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Menu,
  Radio,
  FileText,
  Cake,
  User,
  CheckCheck,
  Trash2,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Info
} from 'lucide-react';

interface NavbarProps {
  companyInfo: CompanyInfo;
  role: UserRole;
  isAdminLoggedIn: boolean;
  userBranch?: BranchName;
  isDirectBranchLink?: boolean;
  onOpenBranchPicker?: () => void;
  activeArea?: string;
  activeEmployeeName?: string;
  userName?: string;
  onOpenProfileModal?: () => void;
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
  userName,
  onOpenProfileModal,
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [notifFilter, setNotifFilter] = useState<'all' | 'unread'>('all');
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  // Notifications scoped to active branch
  const visibleNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (!isAdminLoggedIn && userBranch) {
        if (n.targetBranch && n.targetBranch !== 'Todas' && n.targetBranch !== userBranch) {
          return false;
        }
      }
      return true;
    });
  }, [notifications, isAdminLoggedIn, userBranch]);

  const unreadCount = visibleNotifications.filter((n) => !n.read).length;

  const filteredNotifications = useMemo(() => {
    return notifFilter === 'unread'
      ? visibleNotifications.filter((n) => !n.read)
      : visibleNotifications;
  }, [notifFilter, visibleNotifications]);

  // Focus search input when toggled open
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isSearchOpen]);

  // Prevent background scroll when hamburger menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNotificationClick = (notif: AppNotification) => {
    if (!notif.read) {
      onMarkNotificationAsRead(notif.id);
    }
    const targetTab =
      notif.linkTab ||
      (notif.type === 'document'
        ? 'documents'
        : notif.type === 'celebration'
        ? 'celebrations'
        : 'feed');
    setActiveTab(targetTab);
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#38484c]/12 w-full shadow-2xs transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 relative">
            
            {/* Left: Quick Search Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsSearchOpen((prev) => !prev)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                  isSearchOpen || globalSearch
                    ? 'bg-teal-800 text-white border-teal-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 border-slate-200/80'
                }`}
                title="Buscar comunicados, personas o documentos"
                aria-label="Abrir buscador"
              >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {globalSearch ? 'Búsqueda activa' : 'Buscar'}
                </span>
                {globalSearch && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                )}
              </button>
            </div>

            {/* Center: "SOLMAR" Logo (Alone in the middle, mathematically centered) */}
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center cursor-pointer select-none group"
              onClick={() => {
                setActiveTab('feed');
                if (role === 'admin' && !isAdminLoggedIn) {
                  onRoleToggle('employee');
                }
              }}
              title="Ir al inicio de SOLMAR"
            >
              <span className="font-black text-2xl sm:text-3xl tracking-widest text-[#232f32] uppercase group-hover:text-teal-800 transition-colors leading-none">
                {companyInfo.name || 'SOLMAR'}
              </span>
              <span className="text-[9px] sm:text-[10px] font-extrabold tracking-widest text-teal-700/90 uppercase mt-0.5">
                PORTAL INTERNO
              </span>
            </div>

            {/* Right: Hamburger Menu Button with Badges */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsMenuOpen(true)}
                className={`relative flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  isMenuOpen
                    ? 'bg-[#232f32] text-white border-[#232f32] shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200/90 text-slate-800 border-slate-200/90 shadow-2xs'
                }`}
                title="Abrir menú de usuario, sucursal y opciones"
                aria-label="Menú principal"
              >
                {/* Visual indicator for Admin status */}
                {isAdminLoggedIn && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white hidden xs:inline-block" title="Modo RRHH Activo" />
                )}
                
                <Menu className="w-4 h-4 text-slate-800" />
                <span className="hidden sm:inline">Menú</span>

                {/* Unread Notifications Badge */}
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-xs animate-pulse ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

          </div>

          {/* Quick Expandable Search Dropdown */}
          {isSearchOpen && (
            <div className="py-3 border-t border-slate-200/80 animate-in slide-in-from-top-2 duration-150">
              <div className="relative w-full max-w-xl mx-auto">
                <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  placeholder="Buscar avisos, compañeros o documentos..."
                  className="w-full pl-9 pr-8 py-2.5 bg-slate-100 focus:bg-white text-xs sm:text-sm rounded-xl border border-transparent focus:border-teal-700 focus:outline-none transition-all placeholder:text-slate-400 text-slate-800 shadow-inner"
                />
                {globalSearch && (
                  <button
                    type="button"
                    onClick={() => setGlobalSearch('')}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200 transition-colors cursor-pointer"
                    title="Limpiar búsqueda"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {query.length > 0 && (
                <div className="max-w-xl mx-auto mt-2 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('feed');
                      setIsSearchOpen(false);
                    }}
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                      activeTab === 'feed'
                        ? 'bg-teal-900 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <Radio className="w-3.5 h-3.5 text-teal-400" />
                    <span>Avisos ({searchCounts.feed})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('documents');
                      setIsSearchOpen(false);
                    }}
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                      activeTab === 'documents'
                        ? 'bg-teal-900 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-400" />
                    <span>Docs ({searchCounts.docs})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('celebrations');
                      setIsSearchOpen(false);
                    }}
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                      activeTab === 'celebrations'
                        ? 'bg-teal-900 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <Cake className="w-3.5 h-3.5 text-pink-400" />
                    <span>Festejos ({searchCounts.cels})</span>
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </header>

      {/* Slide-over Hamburger Drawer & Backdrop */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
          
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity cursor-pointer"
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Container */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-sm sm:max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-250">
              
              {/* Drawer Header */}
              <div className="px-5 py-4 border-b border-slate-100 bg-[#232f32] text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-teal-600/30 border border-teal-500/40 flex items-center justify-center font-black text-teal-300 text-sm">
                    S
                  </div>
                  <div>
                    <h2 className="font-black text-lg tracking-wider text-white uppercase leading-none">
                      {companyInfo.name || 'SOLMAR'}
                    </h2>
                    <p className="text-[11px] text-teal-300 font-semibold mt-0.5">
                      Menú del Colaborador
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Cerrar menú"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-slate-800">
                
                {/* 1. SECCIÓN: MI NOMBRE (Identificación de Colaborador) */}
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 relative overflow-hidden">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-teal-700 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-xs">
                      {userName ? userName.trim().charAt(0).toUpperCase() : <User className="w-6 h-6 text-teal-200" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-100/80 px-2 py-0.5 rounded-md">
                          Mi Identidad
                        </span>
                      </div>
                      <h3 className="font-black text-slate-900 text-base truncate mt-1">
                        {userName || 'Sin identificar'}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed mt-0.5">
                        {userName
                          ? 'Tu nombre aparecerá al enviar felicitaciones y comentar notas.'
                          : 'Agrega tu nombre para identificarte en comentarios y saludos de cumpleaños.'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-200/80 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onOpenProfileModal?.();
                      }}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#38484c] hover:bg-[#2c393c] text-white shadow-xs transition-all cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-teal-300" />
                      <span>{userName ? 'Modificar mi nombre' : '+ Agregar mi nombre'}</span>
                    </button>
                  </div>
                </div>

                {/* 2. SECCIÓN: SUCURSAL INGRESADA */}
                <div className="bg-white rounded-2xl border border-teal-200 p-4 shadow-2xs">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center shrink-0 border border-teal-100">
                      <MapPin className="w-5 h-5 text-teal-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">
                        Sucursal Activa
                      </span>
                      <h4 className="font-extrabold text-slate-900 text-sm truncate mt-0.5">
                        {userBranch || 'Solmar Casa Central'}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {isAdminLoggedIn
                          ? 'Como administrador puedes cambiar de sucursal para auditar publicaciones.'
                          : 'Asignada automáticamente a este equipo de trabajo.'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                    {isAdminLoggedIn ? (
                      <button
                        type="button"
                        onClick={() => {
                          setIsMenuOpen(false);
                          onOpenBranchPicker?.();
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors cursor-pointer w-full justify-center"
                      >
                        <MapPin className="w-3.5 h-3.5 text-teal-700" />
                        <span>Cambiar Sucursal (Auditoría)</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium">
                        <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Bloqueada para este puesto de trabajo</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. SECCIÓN: NOTIFICACIONES */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">Notificaciones</h4>
                        <span className="text-[11px] text-slate-500">
                          {unreadCount > 0 ? `${unreadCount} pendientes de lectura` : 'Al día, sin pendientes'}
                        </span>
                      </div>
                    </div>

                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={onClearNotifications}
                        className="text-[11px] font-bold text-teal-700 hover:text-teal-900 hover:underline cursor-pointer"
                        title="Marcar todas como leídas"
                      >
                        Marcar leídas
                      </button>
                    )}
                  </div>

                  {/* Notifications list preview */}
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {visibleNotifications.length === 0 ? (
                      <div className="py-6 text-center text-slate-400 text-xs">
                        <CheckCheck className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                        <span>No hay notificaciones registradas</span>
                      </div>
                    ) : (
                      visibleNotifications.slice(0, 5).map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif)}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                            !notif.read
                              ? 'bg-rose-50/40 border-rose-200/80 hover:bg-rose-50'
                              : 'bg-slate-50 border-slate-100 hover:bg-slate-100/80'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1.5">
                            <div className="flex-1 min-w-0">
                              <p className={`font-semibold truncate ${!notif.read ? 'text-slate-900' : 'text-slate-700'}`}>
                                {notif.title}
                              </p>
                              <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                {notif.message}
                              </p>
                            </div>
                            {!notif.read && (
                              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-1" />
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {visibleNotifications.length > 5 && (
                    <p className="text-center text-[10px] text-slate-400 font-medium">
                      Mostrando las 5 alertas más recientes
                    </p>
                  )}
                </div>

                {/* 4. SECCIÓN: MODO ADMIN (RRHH) */}
                <div className={`rounded-2xl border p-4 shadow-2xs ${
                  isAdminLoggedIn
                    ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                    : 'bg-white border-slate-200'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isAdminLoggedIn
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#232f32] text-emerald-400'
                    }`}>
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Acceso Administrativo
                      </span>
                      <h4 className="font-black text-sm truncate mt-0.5">
                        {isAdminLoggedIn ? 'Modo RRHH Activo' : 'Gestión de RRHH'}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                        {isAdminLoggedIn
                          ? 'Tienes permisos para publicar comunicados, subir documentos y gestionar festejos.'
                          : 'Acceso exclusivo con contraseña para administradores de Recursos Humanos.'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-200/70 space-y-2">
                    {isAdminLoggedIn ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('admin');
                            setIsMenuOpen(false);
                          }}
                          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-800 hover:bg-emerald-900 text-white shadow-xs transition-colors cursor-pointer"
                        >
                          <span>Ir al Panel de Administración</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onLogout();
                            setIsMenuOpen(false);
                          }}
                          className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Cerrar sesión de Administrador</span>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setIsMenuOpen(false);
                          onOpenLogin();
                        }}
                        className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#232f32] hover:bg-slate-800 text-white shadow-xs transition-all cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>Iniciar Sesión de RRHH</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* 5. SECCIÓN: ACCESOS DIRECTOS */}
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-3 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">
                    Navegación Rápida
                  </span>
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('feed');
                        setIsMenuOpen(false);
                      }}
                      className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeTab === 'feed'
                          ? 'bg-white text-teal-900 shadow-2xs border border-teal-200'
                          : 'text-slate-600 hover:bg-white/80'
                      }`}
                    >
                      <Radio className="w-4 h-4 mb-1 text-teal-600" />
                      <span>Novedades</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('documents');
                        setIsMenuOpen(false);
                      }}
                      className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeTab === 'documents'
                          ? 'bg-white text-teal-900 shadow-2xs border border-teal-200'
                          : 'text-slate-600 hover:bg-white/80'
                      }`}
                    >
                      <FileText className="w-4 h-4 mb-1 text-blue-600" />
                      <span>Documentos</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('celebrations');
                        setIsMenuOpen(false);
                      }}
                      className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeTab === 'celebrations'
                          ? 'bg-white text-teal-900 shadow-2xs border border-teal-200'
                          : 'text-slate-600 hover:bg-white/80'
                      }`}
                    >
                      <Cake className="w-4 h-4 mb-1 text-pink-600" />
                      <span>Festejos</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-slate-500">
                  {companyInfo.name || 'SOLMAR'} Portal Interno
                </span>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(false)}
                  className="font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cerrar
                </button>
              </div>

            </div>
          </div>

        </div>
      )}
    </>
  );
};
