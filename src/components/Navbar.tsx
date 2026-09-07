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
  ChevronRight,
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
  onOpenBranchPicker,
  userName,
  onOpenProfileModal,
  notifications = [],
  onMarkNotificationAsRead = () => {},
  onClearNotifications = () => {},
  onOpenLogin,
  onLogout,
  onRoleToggle,
  activeTab,
  setActiveTab,
  globalSearch,
  setGlobalSearch,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  // Prevent background scroll when menu is open
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

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#dbe2dc] w-full shadow-2xs">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 relative">
            
            {/* 1. Left: Buscador */}
            <div className="flex items-center w-48 sm:w-64 md:w-72">
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  placeholder="Buscar en el portal..."
                  className="w-full pl-8 pr-7 py-1.5 bg-[#eef1ee]/70 hover:bg-[#eef1ee] focus:bg-white text-xs rounded-md border border-[#dbe2dc] focus:border-[#1c3d34] focus:outline-none transition-all placeholder:text-slate-400 text-[#0f2620]"
                />
                {globalSearch && (
                  <button
                    type="button"
                    onClick={() => setGlobalSearch('')}
                    className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                    title="Limpiar búsqueda"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* 2. Center: Logo "SOLMAR / PORTAL INTERNO" Centrado */}
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center cursor-pointer select-none"
              onClick={() => {
                setActiveTab('feed');
                if (role === 'admin' && !isAdminLoggedIn) {
                  onRoleToggle('employee');
                }
              }}
              title="Ir al inicio de SOLMAR"
            >
              <span className="font-black text-xl sm:text-2xl tracking-widest text-[#0f2620] uppercase leading-none">
                {companyInfo.name || 'SOLMAR'}
              </span>
              <span className="text-[9px] font-extrabold tracking-widest text-[#1c3d34] uppercase mt-0.5">
                PORTAL INTERNO
              </span>
            </div>

            {/* 3. Right: Botón de Menú con Badge de Notificación */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsMenuOpen(true)}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all border cursor-pointer ${
                  isMenuOpen
                    ? 'bg-[#0f2620] text-white border-[#0f2620]'
                    : 'bg-white hover:bg-[#eef1ee] text-[#0f2620] border-[#dbe2dc] shadow-2xs'
                }`}
                title="Abrir menú"
                aria-label="Menú de opciones"
              >
                {isAdminLoggedIn && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" title="Modo RRHH Activo" />
                )}
                <Menu className="w-4 h-4" />
                <span className="hidden sm:inline">Menú</span>

                {/* Badge de notificación en terracota cálido */}
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 bg-[#c5622f] text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-2xs ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Drawer Desplegable al presionar Menú */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity cursor-pointer"
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-sm bg-white shadow-2xl flex flex-col border-l border-[#dbe2dc] animate-in slide-in-from-right duration-250">
              
              {/* Header Drawer */}
              <div className="px-4 py-3.5 border-b border-[#dbe2dc] bg-[#0f2620] text-white flex items-center justify-between">
                <div>
                  <h2 className="font-black text-base tracking-wider uppercase leading-none">
                    SOLMAR
                  </h2>
                  <p className="text-[11px] text-[#a98a3f] font-semibold mt-0.5">
                    Menú y Notificaciones
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1.5 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Contenido Drawer */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-slate-800">
                
                {/* Perfil */}
                <div className="bg-[#eef1ee] rounded-md border border-[#dbe2dc] p-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-[#1c3d34] text-white flex items-center justify-center font-bold text-sm">
                      {userName ? userName.trim().charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-[#0f2620] truncate">
                        {userName || 'Colaborador'}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        Sede: {userBranch || 'Solmar Alem'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-[#dbe2dc] flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onOpenProfileModal?.();
                      }}
                      className="text-xs font-bold text-[#1c3d34] hover:underline cursor-pointer"
                    >
                      {userName ? 'Cambiar mi nombre' : '+ Configurar mi nombre'}
                    </button>
                  </div>
                </div>

                {/* Notificaciones */}
                <div className="bg-white rounded-md border border-[#dbe2dc] p-3 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between pb-1.5 border-b border-[#dbe2dc]">
                    <div className="flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-[#c5622f]" />
                      <span className="text-xs font-bold text-[#0f2620]">Notificaciones</span>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={onClearNotifications}
                        className="text-[10px] font-bold text-[#1c3d34] hover:underline cursor-pointer"
                      >
                        Marcar leídas
                      </button>
                    )}
                  </div>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {visibleNotifications.length === 0 ? (
                      <p className="text-xs text-slate-400 py-3 text-center">
                        Sin notificaciones pendientes
                      </p>
                    ) : (
                      visibleNotifications.slice(0, 5).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            if (!n.read) onMarkNotificationAsRead(n.id);
                            if (n.linkTab) setActiveTab(n.linkTab);
                            setIsMenuOpen(false);
                          }}
                          className={`p-2 rounded-md border text-xs cursor-pointer transition-colors ${
                            !n.read ? 'bg-[#c5622f]/5 border-[#c5622f]/30' : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <p className={`font-bold truncate ${!n.read ? 'text-[#c5622f]' : 'text-slate-700'}`}>
                            {n.title}
                          </p>
                          <p className="text-[10px] text-slate-500 line-clamp-1">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Acceso RRHH */}
                <div className="rounded-md border border-[#dbe2dc] p-3 bg-[#eef1ee]">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="w-4 h-4 text-[#1c3d34]" />
                    <span className="text-xs font-bold text-[#0f2620]">
                      {isAdminLoggedIn ? 'Modo Administrador Activo' : 'Acceso Recursos Humanos'}
                    </span>
                  </div>
                  {isAdminLoggedIn ? (
                    <div className="space-y-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('admin');
                          setIsMenuOpen(false);
                        }}
                        className="w-full py-1.5 rounded-md bg-[#1c3d34] text-white text-xs font-bold text-center hover:bg-[#0f2620] cursor-pointer"
                      >
                        Ir al Panel RRHH
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onLogout();
                          setIsMenuOpen(false);
                        }}
                        className="w-full py-1 rounded-md text-xs font-bold text-rose-700 hover:bg-rose-50 cursor-pointer text-center"
                      >
                        Cerrar sesión RRHH
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onOpenLogin();
                      }}
                      className="w-full py-2 rounded-md bg-[#0f2620] text-white text-xs font-bold text-center hover:bg-[#1c3d34] cursor-pointer"
                    >
                      Ingreso con clave RRHH
                    </button>
                  )}
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
