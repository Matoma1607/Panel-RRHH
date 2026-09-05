import React from 'react';
import { UserRole } from '../types';
import {
  Newspaper,
  FileText,
  Cake,
  Settings,
  ShieldCheck
} from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  role: UserRole;
  isAdminLoggedIn?: boolean;
  activeArea?: string;
  unreadCount?: number;
  upcomingCelebrationsCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  role,
  isAdminLoggedIn,
  activeArea,
  upcomingCelebrationsCount = 0,
}) => {
  const navItems = [
    {
      id: 'feed',
      label: 'Novedades',
      icon: Newspaper,
      badge: null
    },
    {
      id: 'documents',
      label: 'Documentos',
      icon: FileText,
      badge: null
    },
    {
      id: 'celebrations',
      label: 'Festejos',
      icon: Cake,
      badge: upcomingCelebrationsCount > 0 ? upcomingCelebrationsCount : null
    }
  ];

  if (role === 'admin' || isAdminLoggedIn) {
    navItems.push({
      id: 'admin',
      label: 'Panel RRHH',
      icon: Settings,
      badge: null
    });
  }

  return (
    <>
      {/* Desktop Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 p-4 gap-4 border-r border-[#38484c]/10 bg-white/70 backdrop-blur-md min-h-[calc(100vh-4rem)]">
        <div>
          <div className="px-3 py-1.5 text-[10px] font-bold text-[#38484c]/60 uppercase tracking-wider">
            Secciones
          </div>

          <nav className="flex flex-col gap-1 mt-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#38484c] text-white shadow-sm'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-white/70'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`px-1.5 py-0.5 text-[10px] rounded-full font-bold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-teal-50 text-teal-800 border border-teal-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Status Box in Sidebar */}
        <div className="mt-auto p-3.5 bg-white/80 rounded-2xl border border-[#38484c]/10 text-slate-700 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Modo Activo
            </span>
            <span className={`px-2 py-0.5 text-[10px] font-black rounded-full ${
              isAdminLoggedIn 
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                : 'bg-slate-200/80 text-slate-700'
            }`}>
              {isAdminLoggedIn ? 'Administrador' : 'Colaborador'}
            </span>
          </div>

          {isAdminLoggedIn && (
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold pt-1 border-t border-slate-200">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>Gestión habilitada</span>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/85 backdrop-blur-md border-t border-[#38484c]/12 px-2 py-1 shadow-lg">
        <nav className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-[10px] font-semibold transition-colors ${
                  isActive ? 'text-teal-800 font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-teal-800' : 'text-slate-400'}`} />
                <span className="truncate max-w-[70px]">{item.label}</span>
                {item.badge && (
                  <span className="absolute top-0 right-2 w-2 h-2 rounded-full bg-rose-500" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
};
