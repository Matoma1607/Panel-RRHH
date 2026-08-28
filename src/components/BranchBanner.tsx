import React from 'react';
import { BranchName, DocumentItem, Announcement } from '../types';
import { Building2, FileText, CheckCircle2, Lock } from 'lucide-react';

interface BranchBannerProps {
  userBranch: BranchName;
  documents: DocumentItem[];
  announcements: Announcement[];
  isDirectLink?: boolean;
  isAdminLoggedIn?: boolean;
  onNavigateTab: (tab: string) => void;
  onOpenBranchPicker?: () => void;
}

export const BranchBanner: React.FC<BranchBannerProps> = ({
  userBranch,
  documents,
  announcements,
  isDirectLink = false,
  isAdminLoggedIn = false,
  onNavigateTab,
  onOpenBranchPicker,
}) => {
  // Calculate exclusive items for this branch
  const branchDocs = documents.filter((d) => d.targetBranch === userBranch);
  const branchAnnouncements = announcements.filter((a) => a.targetBranch === userBranch);
  const totalExclusive = branchDocs.length + branchAnnouncements.length;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-[#232f32] via-[#2c393c] to-[#38484c] text-white p-5 sm:p-6 shadow-md border border-slate-700/50">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 rounded-full bg-teal-500/10 blur-2xl pointer-events-none" />
      
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left info */}
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 shrink-0 shadow-inner">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black uppercase tracking-wider text-teal-300">
                {isAdminLoggedIn ? 'Modo Auditoría de Sucursal' : 'Sucursal Asignada'}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-200 border border-teal-400/30 flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" />
                Dispositivo Vinculado
              </span>
              {isDirectLink && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  Acceso Directo Verificado
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2 mt-0.5">
              <span>📍 {userBranch}</span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
              {totalExclusive > 0
                ? `Tienes ${totalExclusive} ${totalExclusive === 1 ? 'publicación exclusiva' : 'publicaciones exclusivas'} (${branchDocs.length} ${branchDocs.length === 1 ? 'documento' : 'documentos'} y ${branchAnnouncements.length} ${branchAnnouncements.length === 1 ? 'comunicado' : 'comunicados'}) asignados a esta sede.`
                : 'Mostrando comunicados institucionales y reglamentos oficiales de la empresa.'}
            </p>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {branchDocs.length > 0 && (
            <button
              onClick={() => onNavigateTab('documents')}
              className="px-3.5 py-2 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 border border-teal-400/40 text-teal-200 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Ver {branchDocs.length} Doc. de {userBranch.replace('Solmar ', '')}</span>
            </button>
          )}

          {isAdminLoggedIn && onOpenBranchPicker && (
            <button
              onClick={onOpenBranchPicker}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer"
              title="Cambiar sucursal en modo administrador"
            >
              Auditar otra sucursal
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
