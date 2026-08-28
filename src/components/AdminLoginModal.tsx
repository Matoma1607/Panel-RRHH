import React, { useState } from 'react';
import {
  Lock,
  ShieldCheck,
  AlertCircle,
  X,
  ArrowRight
} from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (password: string) => { success: boolean; error?: string };
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLogin,
}) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanPass = passwordInput.trim();
    if (!cleanPass) {
      setErrorMsg('Ingresá la contraseña de administración.');
      return;
    }

    const res = onLogin(cleanPass);
    if (res.success) {
      setPasswordInput('');
      setErrorMsg('');
      onClose();
    } else {
      setErrorMsg(res.error || 'Contraseña incorrecta.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative max-h-[92dvh] overflow-y-auto">
        
        {/* Header */}
        <div className="bg-[#232f32] text-white p-4 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 pr-8">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 shrink-0">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight leading-snug">Acceso Gestión RRHH</h3>
              <p className="text-[11px] sm:text-xs text-slate-300">Solo administradores y encargados</p>
            </div>
          </div>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Contraseña de Administración
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="Ingresá la contraseña..."
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-base sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all"
                autoFocus
              />
            </div>
            {errorMsg && (
              <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-rose-600">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 sm:py-3.5 px-4 bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white rounded-2xl font-bold text-sm shadow-md shadow-teal-700/20 transition-all cursor-pointer"
          >
            <span>Ingresar al Panel</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

