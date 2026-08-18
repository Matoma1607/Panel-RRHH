import React, { useState, useRef, useEffect } from 'react';
import { CompanyInfo, UserRole, AppNotification } from '../types';
import {
  LogOut,
  ShieldCheck,
  Search,
  Bell,
  Users
} from 'lucide-react';
import { NotificationsPopover } from './NotificationsPopover';

interface NavbarProps {
  companyInfo: CompanyInfo;
  role: UserRole;
  isAdminLoggedIn: boolean;
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
}

export const Navbar: React.FC<NavbarProps> = ({
  companyInfo,
  role,
  isAdminLoggedIn,
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
  setGlobalSearch
}) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifContainerRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

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

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-2">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Buscar comunicado, compañero o documento..."
                className="w-full pl-9 pr-4 py-2 bg-slate-100/90 hover:bg-slate-100 focus:bg-white text-xs rounded-xl border border-transparent focus:border-teal-700 focus:outline-none transition-all placeholder:text-slate-400 text-slate-800"
              />
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
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
                <span>Ingreso RRHH</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
