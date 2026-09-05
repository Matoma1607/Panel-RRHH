import React, { useState, useEffect } from 'react';
import { X, User, Check, Sparkles, MapPin, MessageSquare, PartyPopper } from 'lucide-react';
import { BranchName } from '../../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  userBranch?: BranchName;
  onSaveName: (name: string) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentName,
  userBranch,
  onSaveName,
}) => {
  const [nameInput, setNameInput] = useState(currentName);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setNameInput(currentName);
  }, [currentName, isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nameInput.trim();
    onSaveName(trimmed);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const displayName = nameInput.trim() || 'Colaborador';
  const displayBranch = userBranch ? ` (${userBranch})` : '';

  // Get initials for avatar preview
  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return (parts[0] || 'C').substring(0, 2).toUpperCase();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-[#232f32] to-[#38484c] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/15">
              <User className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Mi Identificación</h3>
              <p className="text-xs text-slate-300">¿Cómo te llamas en el portal SOLMAR?</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="collaborator-name-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Tu Nombre y Apellido
            </label>
            <input
              id="collaborator-name-input"
              type="text"
              autoFocus
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Ej: Mariana Ruiz o Carlos Gómez"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#38484c]/20 focus:border-[#38484c] text-sm font-medium transition-all"
            />
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Este nombre se guardará en tu navegador para que tus compañeros te identifiquen cuando comentes avisos o envíes saludos de cumpleaños.
            </p>
          </div>

          {/* Active Branch Indicator */}
          {userBranch && (
            <div className="flex items-center gap-2 px-3 py-2 bg-teal-50 border border-teal-200/70 rounded-xl text-xs text-teal-950 font-medium">
              <MapPin className="w-3.5 h-3.5 text-teal-700 shrink-0" />
              <span>Sucursal vinculada: <strong>{userBranch}</strong></span>
            </div>
          )}

          {/* Live Preview Card */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <span>Vista previa en el portal</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
              {/* Comment preview */}
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#38484c] text-white flex items-center justify-center text-[10px] font-bold shrink-0 shadow-2xs">
                  {getInitials(displayName)}
                </div>
                <div className="space-y-0.5 min-w-0 flex-1 text-xs">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-slate-900">{displayName}</span>
                    <span className="text-[10px] text-teal-700 font-semibold bg-teal-100/60 px-1.5 py-0.2 rounded">
                      {userBranch || 'SOLMAR'}
                    </span>
                    <span className="text-[10px] text-slate-400">Recién</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    "¡Excelente iniciativa! Muchas gracias por el aviso."
                  </p>
                </div>
              </div>

              {/* Greeting preview */}
              <div className="pt-2 border-t border-slate-200/60 flex items-center gap-2 text-[11px] text-pink-900 bg-pink-50/80 p-2 rounded-xl">
                <PartyPopper className="w-3.5 h-3.5 text-pink-600 shrink-0" />
                <span className="truncate">
                  <strong>{displayName}</strong> envió un saludo de cumpleaños 🎂
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs text-white shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                savedSuccess
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-[#232f32] hover:bg-[#38484c]'
              }`}
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>¡Nombre Guardado!</span>
                </>
              ) : (
                <span>Guardar Nombre</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
