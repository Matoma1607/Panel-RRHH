import React, { useState } from 'react';
import { BranchName, ALL_BRANCHES, DocumentItem, Announcement } from '../../types';
import { Building2, Check, MapPin, Lock, ShieldCheck } from 'lucide-react';

interface BranchSelectorModalProps {
  isOpen: boolean;
  onClose?: () => void;
  currentBranch?: BranchName;
  onSelectBranch: (branch: BranchName) => void;
  isInitialSetup?: boolean;
  documents?: DocumentItem[];
  announcements?: Announcement[];
}

export const BranchSelectorModal: React.FC<BranchSelectorModalProps> = ({
  isOpen,
  onClose,
  currentBranch,
  onSelectBranch,
  isInitialSetup = false,
  documents = [],
  announcements = [],
}) => {
  const [selected, setSelected] = useState<BranchName>(currentBranch || 'Solmar Alem');

  if (!isOpen) return null;

  const handleConfirm = () => {
    onSelectBranch(selected);
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[92dvh] sm:max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#232f32] text-white p-4 sm:p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 sm:gap-3.5">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 shadow-inner shrink-0">
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-teal-300 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Configuración de Sucursal
                </span>
              </div>
              <h3 className="font-extrabold text-base sm:text-lg tracking-tight text-white mt-0.5 leading-snug">
                {isInitialSetup ? 'Selecciona tu Sucursal de Trabajo' : 'Asignar Sucursal a este Dispositivo'}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5">
                Óptica SOLMAR • Portal Interno de Recursos Humanos
              </p>
            </div>
          </div>
        </div>

        {/* Notice */}
        <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-2">
          <div className="p-3 sm:p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900">
            <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px] sm:text-xs">
              <strong>Importante:</strong> Esta computadora o dispositivo móvil quedará vinculada permanentemente a la sucursal que selecciones. Solo tendrás acceso a las novedades y documentos oficiales de tu sede asignada.
            </p>
          </div>
        </div>

        {/* Content list */}
        <div className="p-4 sm:p-6 pt-2 space-y-2 sm:space-y-2.5 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
            {ALL_BRANCHES.map((branch) => {
              const isSelected = selected === branch;
              const exclusiveDocs = documents.filter((d) => d.targetBranch === branch).length;
              const exclusiveAnns = announcements.filter((a) => a.targetBranch === branch).length;

              return (
                <button
                  key={branch}
                  type="button"
                  onClick={() => setSelected(branch)}
                  className={`p-3 sm:p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-teal-50 border-teal-700 ring-2 ring-teal-700/30 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200/80 active:bg-slate-100'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-teal-700 font-bold' : 'text-slate-400'}`} />
                      <span className={`text-xs font-bold ${isSelected ? 'text-teal-950' : 'text-slate-800'}`}>
                        {branch}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 pl-5">
                      {exclusiveDocs > 0 || exclusiveAnns > 0 ? (
                        <span className="font-semibold text-teal-800">
                          {exclusiveDocs} docs • {exclusiveAnns} avisos
                        </span>
                      ) : (
                        <span>Documentos generales</span>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-teal-800 text-white flex items-center justify-center shrink-0 shadow-xs ml-2">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-slate-500 text-center sm:text-left flex items-center gap-1 text-[11px] sm:text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            Acceso seguro y exclusivo por sucursal.
          </span>
          <button
            onClick={handleConfirm}
            className="w-full sm:w-auto px-6 py-3 sm:py-2.5 bg-teal-800 hover:bg-teal-900 active:bg-teal-950 text-white font-bold text-xs sm:text-xs rounded-xl transition-all shadow-md shadow-teal-900/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Confirmar y Vincular Sucursal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
