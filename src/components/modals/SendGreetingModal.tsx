import React, { useState, useEffect } from 'react';
import {
  X,
  Cake,
  Award,
  Send,
  Sparkles,
  PartyPopper,
  User,
  Heart,
  MessageSquare,
  Check
} from 'lucide-react';
import { CelebrationItem, BranchName } from '../../types';
import { resolveCelebrationAvatar } from '../../utils/avatarUtils';

interface SendGreetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  celebration: CelebrationItem | null;
  currentUserName: string;
  userBranch?: BranchName;
  onSendGreeting: (
    celebrationId: string,
    greetingData: { authorName: string; branch?: string; message?: string }
  ) => void;
  onSaveUserName?: (name: string) => void;
}

const BIRTHDAY_CHIPS = [
  '¡Muy feliz cumpleaños! 🎂',
  '¡Que pases un hermoso día con tus seres queridos! 🎉',
  '¡Muchas felicidades y los mejores deseos! ✨',
  '¡Un gran abrazo en tu día compañero/a! 🥳'
];

const ANNIVERSARY_CHIPS = [
  '¡Feliz aniversario en SOLMAR! 👏',
  '¡Felicitaciones por este nuevo año en la empresa! 🌟',
  '¡Gracias por tu compromiso y dedicación de siempre! 💼',
  '¡Que sigan muchos años más de éxitos juntos! 🚀'
];

export const SendGreetingModal: React.FC<SendGreetingModalProps> = ({
  isOpen,
  onClose,
  celebration,
  currentUserName,
  userBranch,
  onSendGreeting,
  onSaveUserName,
}) => {
  const [authorName, setAuthorName] = useState(currentUserName);
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen && celebration) {
      setAuthorName(currentUserName);
      const defaultMsg =
        celebration.type === 'birthday'
          ? '¡Muy feliz cumpleaños! Que disfrutes mucho tu día 🎉'
          : '¡Muchas felicidades por tu aniversario en la empresa! 👏';
      setMessage(defaultMsg);
      setIsSent(false);
      setErrorMessage('');
    }
  }, [isOpen, celebration, currentUserName]);

  if (!isOpen || !celebration) return null;

  const isBirthday = celebration.type === 'birthday';
  const chips = isBirthday ? BIRTHDAY_CHIPS : ANNIVERSARY_CHIPS;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = authorName.trim();
    if (!cleanName) {
      setErrorMessage('Por favor escribe tu nombre y apellido para que sepan quién saluda.');
      return;
    }

    // Save name for future use
    if (onSaveUserName && cleanName !== currentUserName) {
      onSaveUserName(cleanName);
    }

    onSendGreeting(celebration.id, {
      authorName: cleanName,
      branch: userBranch,
      message: message.trim() || (isBirthday ? '¡Muy feliz cumpleaños! 🎉' : '¡Feliz aniversario! 👏'),
    });

    setIsSent(true);
    setTimeout(() => {
      setIsSent(false);
      onClose();
    }, 1200);
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
        {/* Decorative Top Accent Banner */}
        <div
          className={`h-2 w-full ${
            isBirthday
              ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400'
              : 'bg-gradient-to-r from-amber-500 via-yellow-500 to-teal-500'
          }`}
        />

        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={resolveCelebrationAvatar(celebration.employeeName, celebration.avatar, celebration.gender)}
              alt={celebration.employeeName}
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-sm ring-1 ring-slate-200 shrink-0 bg-white"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    isBirthday
                      ? 'bg-pink-50 text-pink-700 border border-pink-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {isBirthday ? <Cake className="w-3 h-3 text-pink-500" /> : <Award className="w-3 h-3 text-amber-500" />}
                  <span>{isBirthday ? 'Cumpleaños' : 'Aniversario'}</span>
                </span>
                <span className="text-xs text-slate-400 font-semibold">• {celebration.date}</span>
              </div>
              <h3 className="font-bold text-base text-slate-900 leading-snug">
                Felicitar a {celebration.employeeName}
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

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Author Name */}
          <div className="space-y-1.5">
            <label htmlFor="greeting-author-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Tu Nombre y Apellido
            </label>
            <div className="relative">
              <input
                id="greeting-author-input"
                type="text"
                value={authorName}
                onChange={(e) => {
                  setAuthorName(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="Ej: Mariana Ruiz o Carlos López"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 text-sm font-medium"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
            {errorMessage ? (
              <p className="text-xs text-rose-600 font-semibold">{errorMessage}</p>
            ) : (
              <p className="text-[11px] text-slate-500">
                Se recordará en tu dispositivo para futuros comentarios y festejos.
                {userBranch && (
                  <span className="font-semibold text-teal-800 ml-1">
                    (Sucursal: {userBranch})
                  </span>
                )}
              </p>
            )}
          </div>

          {/* Preset Chips */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-600">
              Ideas de dedicatoria rápida:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {chips.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setMessage(chip)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-all text-left cursor-pointer ${
                    message === chip
                      ? 'bg-pink-100 text-pink-900 border-pink-300 font-semibold shadow-2xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Message Area */}
          <div className="space-y-1.5">
            <label htmlFor="greeting-message-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Mensaje o dedicatoria
            </label>
            <textarea
              id="greeting-message-input"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribe unas palabras de felicitación..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 text-xs sm:text-sm font-medium resize-none"
            />
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
              disabled={isSent}
              className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs text-white shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                isSent
                  ? 'bg-emerald-600'
                  : isBirthday
                  ? 'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700'
                  : 'bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700'
              }`}
            >
              {isSent ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>¡Saludo Enviado!</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Enviar Saludo</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
