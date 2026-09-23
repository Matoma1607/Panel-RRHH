import React from 'react';
import { UserRole, BranchName } from '../types';
import {
  Newspaper,
  FileText,
  Cake,
  Settings,
  ShieldCheck,
  User,
  MapPin,
  Edit2,
  Calendar,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  role: UserRole;
  isAdminLoggedIn?: boolean;
  upcomingCelebrationsCount?: number;
  newAnnouncementsCount?: number;
  updatedDocsCount?: number;
  userName?: string;
  userBranch?: BranchName;
  onOpenProfileModal?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  role,
  isAdminLoggedIn,
  upcomingCelebrationsCount = 0,
  newAnnouncementsCount = 0,
  updatedDocsCount = 0,
  userName,
  userBranch = 'Solmar Alem',
  onOpenProfileModal,
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

  const initial = userName?.trim().charAt(0).toUpperCase() || 'C';

  return (
    <>
      {/* Desktop Narrow Sidebar (~220px) */}
      <aside className="hidden md:flex flex-col w-[220px] shrink-0 gap-3">
        
        {/* Navigation Section */}
        <div className="bg-white rounded-lg border border-[#dbe2dc] p-2.5 shadow-2xs">
          <div className="px-2.5 py-1 text-[10px] font-bold text-[#0f2620]/60 uppercase tracking-wider">
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
                  className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#0f2620] text-white shadow-2xs'
                      : 'text-slate-700 hover:text-[#0f2620] hover:bg-[#eef1ee]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#a98a3f]' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-black ${
                        isActive
                          ? 'bg-[#a98a3f] text-white'
                          : 'bg-[#a98a3f]/15 text-[#a98a3f] border border-[#a98a3f]/30'
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

        {/* Resumen del mes (Compacto e Interactivo) */}
        <div className="bg-white rounded-lg border border-[#dbe2dc] p-2.5 shadow-2xs">
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-[#dbe2dc]/70">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0f2620]/70">
              Resumen del mes
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#1c3d34]" />
          </div>

          <div className="space-y-1 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('feed')}
              className={`w-full group flex items-center justify-between px-2 py-1.5 rounded-md text-left transition-all cursor-pointer ${
                activeTab === 'feed'
                  ? 'bg-[#eef1ee] text-[#0f2620] font-semibold'
                  : 'text-slate-600 hover:bg-[#f7f9f7] hover:text-[#0f2620]'
              }`}
              title="Ver Novedades y Comunicados"
            >
              <div className="flex items-center gap-1 min-w-0">
                <span className="text-[11px] truncate group-hover:underline decoration-[#0f2620]/40 underline-offset-2">
                  Comunicados nuevos
                </span>
                <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-[#0f2620] transition-all opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 shrink-0" />
              </div>
              <span
                className={`font-bold px-1.5 py-0.5 rounded text-[11px] shrink-0 transition-colors ${
                  activeTab === 'feed'
                    ? 'bg-[#0f2620] text-white'
                    : 'text-[#0f2620] bg-[#eef1ee] group-hover:bg-[#0f2620] group-hover:text-white'
                }`}
              >
                {newAnnouncementsCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('documents')}
              className={`w-full group flex items-center justify-between px-2 py-1.5 rounded-md text-left transition-all cursor-pointer ${
                activeTab === 'documents'
                  ? 'bg-[#eef1ee] text-[#0f2620] font-semibold'
                  : 'text-slate-600 hover:bg-[#f7f9f7] hover:text-[#0f2620]'
              }`}
              title="Ver Documentos de RRHH"
            >
              <div className="flex items-center gap-1 min-w-0">
                <span className="text-[11px] truncate group-hover:underline decoration-[#0f2620]/40 underline-offset-2">
                  Docs actualizados
                </span>
                <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-[#0f2620] transition-all opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 shrink-0" />
              </div>
              <span
                className={`font-bold px-1.5 py-0.5 rounded text-[11px] shrink-0 transition-colors ${
                  activeTab === 'documents'
                    ? 'bg-[#0f2620] text-white'
                    : 'text-[#0f2620] bg-[#eef1ee] group-hover:bg-[#0f2620] group-hover:text-white'
                }`}
              >
                {updatedDocsCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('celebrations')}
              className={`w-full group flex items-center justify-between px-2 py-1.5 rounded-md text-left transition-all cursor-pointer ${
                activeTab === 'celebrations'
                  ? 'bg-[#a98a3f]/15 text-[#a98a3f] font-semibold'
                  : 'text-slate-600 hover:bg-[#a98a3f]/10 hover:text-[#0f2620]'
              }`}
              title="Ver Festejos y Cumpleaños"
            >
              <div className="flex items-center gap-1 min-w-0">
                <span className="text-[11px] truncate group-hover:underline decoration-[#a98a3f]/40 underline-offset-2">
                  Festejos del mes
                </span>
                <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-[#a98a3f] transition-all opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 shrink-0" />
              </div>
              <span
                className={`font-bold px-1.5 py-0.5 rounded text-[11px] shrink-0 transition-colors ${
                  activeTab === 'celebrations'
                    ? 'bg-[#a98a3f] text-white'
                    : 'text-[#a98a3f] bg-[#a98a3f]/10 group-hover:bg-[#a98a3f] group-hover:text-white'
                }`}
              >
                {upcomingCelebrationsCount}
              </span>
            </button>
          </div>
        </div>

        {/* Mini Tarjeta de Perfil del Usuario al Final */}
        <div className="mt-auto bg-white rounded-lg border border-[#dbe2dc] p-3 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#1c3d34] text-white flex items-center justify-center font-bold text-xs shrink-0">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#0f2620] truncate">
                {userName || 'Colaborador'}
              </p>
              <div className="flex items-center gap-1 text-[10px] text-slate-500 truncate">
                <MapPin className="w-2.5 h-2.5 text-[#1c3d34] shrink-0" />
                <span className="truncate">{userBranch}</span>
              </div>
            </div>
            {onOpenProfileModal && (
              <button
                type="button"
                onClick={onOpenProfileModal}
                className="p-1 rounded hover:bg-[#eef1ee] text-slate-400 hover:text-[#0f2620] transition-colors cursor-pointer"
                title="Editar mi nombre"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

      </aside>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#dbe2dc] px-1 pt-1 pb-[max(0.35rem,env(safe-area-inset-bottom))] shadow-lg">
        <nav className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex-1 flex flex-col items-center justify-center gap-0.5 px-2 py-1 min-h-[44px] rounded-md text-[10px] font-semibold transition-colors ${
                  isActive ? 'text-[#0f2620] font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#0f2620]' : 'text-slate-400'}`} />
                <span className="truncate max-w-[72px] leading-tight">{item.label}</span>
                {item.badge && (
                  <span className="absolute top-1 right-1/4 w-2 h-2 rounded-full bg-[#c5622f] ring-2 ring-white" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
};
