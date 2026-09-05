import React from 'react';
import {
  X,
  Cake,
  Award,
  PartyPopper,
  Heart,
  MessageCircle,
  MapPin,
  Calendar,
  Send,
  Sparkles
} from 'lucide-react';
import { CelebrationItem } from '../../types';
import { resolveCelebrationAvatar } from '../../utils/avatarUtils';

interface GreetingsListModalProps {
  isOpen: boolean;
  onClose: () => void;
  celebration: CelebrationItem | null;
  onOpenSendModal: (celebration: CelebrationItem) => void;
}

export const GreetingsListModal: React.FC<GreetingsListModalProps> = ({
  isOpen,
  onClose,
  celebration,
  onOpenSendModal,
}) => {
  if (!isOpen || !celebration) return null;

  const isBirthday = celebration.type === 'birthday';
  const greetings = celebration.greetings || [];

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return (parts[0] || 'C').substring(0, 2).toUpperCase();
  };

  const getAvatarBg = (name: string) => {
    const colors = [
      'bg-teal-600',
      'bg-blue-600',
      'bg-indigo-600',
      'bg-pink-600',
      'bg-amber-600',
      'bg-emerald-600',
      'bg-rose-600'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Top Bar */}
        <div
          className={`h-2 w-full shrink-0 ${
            isBirthday
              ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400'
              : 'bg-gradient-to-r from-amber-500 via-yellow-500 to-teal-500'
          }`}
        />

        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <img
              src={resolveCelebrationAvatar(celebration.employeeName, celebration.avatar, celebration.gender)}
              alt={celebration.employeeName}
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-sm ring-1 ring-slate-200 shrink-0 bg-white"
            />
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    isBirthday
                      ? 'bg-pink-100 text-pink-700 border border-pink-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}
                >
                  {isBirthday ? <Cake className="w-3 h-3 text-pink-500" /> : <Award className="w-3 h-3 text-amber-500" />}
                  <span>{isBirthday ? 'Cumpleaños' : 'Aniversario'}</span>
                </span>
                <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>{celebration.date}</span>
                </span>
              </div>
              <h3 className="font-bold text-base text-slate-900 leading-snug">
                Saludos para {celebration.employeeName}
              </h3>
              <p className="text-xs text-slate-500">{celebration.department}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Greetings Content List */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100 text-xs text-slate-500">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <PartyPopper className="w-4 h-4 text-pink-500" />
              <span>{greetings.length} felicitaciones registradas</span>
            </span>
            <span className="text-[11px] text-slate-400">Mensajes de compañeros</span>
          </div>

          {greetings.length === 0 ? (
            <div className="text-center py-10 px-4 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-500 flex items-center justify-center mx-auto">
                <PartyPopper className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">
                Todavía no hay saludos registrados con nombre
              </h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                ¡Sé el primero en felicitar a {celebration.employeeName} y dejarle un mensaje especial!
              </p>
              <button
                onClick={() => {
                  onClose();
                  onOpenSendModal(celebration);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar primer saludo</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {greetings.map((g) => (
                <div
                  key={g.id}
                  className="p-3.5 bg-slate-50/90 rounded-2xl border border-slate-200/90 hover:border-slate-300 transition-all text-xs space-y-1.5 shadow-2xs"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-xl text-white flex items-center justify-center font-black text-[10px] shadow-2xs ${getAvatarBg(
                          g.authorName
                        )}`}
                      >
                        {getInitials(g.authorName)}
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-slate-900 text-xs">{g.authorName}</span>
                        {g.branch && (
                          <span className="px-1.5 py-0.5 rounded-md bg-teal-100/70 text-teal-800 text-[10px] font-semibold flex items-center gap-0.5">
                            <MapPin className="w-2.5 h-2.5 text-teal-600" />
                            <span>{g.branch}</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-normal">{g.date}</span>
                  </div>

                  {g.message && (
                    <p className="text-slate-700 text-xs pl-9 leading-relaxed bg-white/70 p-2 rounded-xl border border-slate-200/60 font-medium">
                      "{g.message}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200/80 px-5 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="py-2 px-4 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            Cerrar
          </button>
          <button
            onClick={() => {
              onClose();
              onOpenSendModal(celebration);
            }}
            className="flex items-center gap-1.5 py-2 px-4 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Felicitar también</span>
          </button>
        </div>
      </div>
    </div>
  );
};
