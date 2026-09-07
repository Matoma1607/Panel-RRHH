import React from 'react';
import { BranchName, DocumentItem, Announcement } from '../types';
import { Building2, Lock, MapPin, CheckCircle2, ChevronRight } from 'lucide-react';

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
  return (
    <div className="bg-white rounded-lg border border-[#dbe2dc] px-3.5 py-2.5 flex items-center justify-between gap-3 shadow-2xs">
      {/* Left items in a single compact line */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className="w-8 h-8 rounded-md bg-[#1c3d34]/10 text-[#1c3d34] flex items-center justify-center shrink-0">
          <Building2 className="w-4 h-4" />
        </div>
        
        <div className="flex items-center gap-2.5 min-w-0 flex-wrap">
          <span className="text-xs font-bold text-[#0f2620] flex items-center gap-1 shrink-0">
            <span>📍</span>
            <span>{userBranch}</span>
          </span>

          <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-slate-300" />

          <p className="text-[11px] text-slate-500 truncate max-w-md hidden md:inline-block">
            Mostrando comunicados institucionales y reglamentos oficiales de la sede.
          </p>

          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-[#eef1ee] text-[#1c3d34] border border-[#dbe2dc] shrink-0">
            <Lock className="w-2.5 h-2.5" />
            <span>Dispositivo vinculado</span>
          </span>

          {isDirectLink && (
            <span className="hidden lg:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
              <CheckCircle2 className="w-2.5 h-2.5" />
              <span>Acceso directo</span>
            </span>
          )}
        </div>
      </div>

      {/* Right button for Admin */}
      {isAdminLoggedIn && onOpenBranchPicker && (
        <button
          type="button"
          onClick={onOpenBranchPicker}
          className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#eef1ee] hover:bg-[#dbe2dc] text-[#0f2620] border border-[#dbe2dc] transition-colors shrink-0 cursor-pointer"
        >
          Cambiar sede
        </button>
      )}
    </div>
  );
};
