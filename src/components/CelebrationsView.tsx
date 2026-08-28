import React, { useState } from 'react';
import { CelebrationItem, UserRole } from '../types';
import {
  Cake,
  Award,
  Sparkles,
  Heart,
  Send,
  PartyPopper,
  CheckCircle2,
  Calendar,
  Plus,
  Trash2,
  Edit2,
  Share2,
  Clock,
  MessageCircle,
  Flame
} from 'lucide-react';
import { ShareModal } from './modals/ShareModal';
import {
  getCelebrationCountdown,
  getSortedUpcomingBirthdays,
} from '../utils/celebrationUtils';
import { resolveCelebrationAvatar } from '../utils/avatarUtils';

interface CelebrationsViewProps {
  celebrations: CelebrationItem[];
  role: UserRole;
  canPublish?: boolean;
  onSendGreeting: (id: string) => void;
  onNewCelebration?: () => void;
  onOpenNewModal?: () => void;
  onEditCelebration?: (celebration: CelebrationItem) => void;
  onDeleteCelebration?: (id: string) => void;
}

export const CelebrationsView: React.FC<CelebrationsViewProps> = ({
  celebrations,
  role,
  canPublish = role === 'admin',
  onSendGreeting,
  onNewCelebration,
  onOpenNewModal,
  onEditCelebration,
  onDeleteCelebration,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'birthdays' | 'anniversaries'>('all');
  const [greetingSuccessId, setGreetingSuccessId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [sharingCelebration, setSharingCelebration] = useState<CelebrationItem | null>(null);

  const handleNewCelebrationFn = onNewCelebration || onOpenNewModal;

  const birthdays = celebrations.filter((c) => c.type === 'birthday');
  const anniversaries = celebrations.filter((c) => c.type === 'anniversary');

  const { closestBirthday, upcomingList } = getSortedUpcomingBirthdays(celebrations);

  const filtered =
    activeTab === 'birthdays'
      ? birthdays
      : activeTab === 'anniversaries'
      ? anniversaries
      : celebrations;

  const handleGreet = (id: string) => {
    onSendGreeting(id);
    setGreetingSuccessId(id);
    setTimeout(() => setGreetingSuccessId(null), 3000);
  };

  const handleDelete = (id: string) => {
    if (onDeleteCelebration) {
      onDeleteCelebration(id);
      setConfirmDeleteId(null);
    }
  };

  const openWhatsAppGreeting = (item: CelebrationItem) => {
    const text = encodeURIComponent(
      `¡Hola ${item.employeeName}! 🎂🎉 Desde todo el equipo de SOLMAR te deseamos un muy feliz cumpleaños. ¡Que disfrutes mucho de tu día!`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <span>🎂 Cumpleaños y Aniversarios Laborales</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Festejemos juntos los momentos especiales, cumpleaños y reconocimientos del equipo SOLMAR en todas las sucursales.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Filter Switcher */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-medium">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'all' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              Todos ({celebrations.length})
            </button>
            <button
              onClick={() => setActiveTab('birthdays')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                activeTab === 'birthdays' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              <Cake className="w-3.5 h-3.5 text-pink-500" />
              <span>Cumpleaños ({birthdays.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('anniversaries')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                activeTab === 'anniversaries' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>Aniversarios ({anniversaries.length})</span>
            </button>
          </div>

          {/* Add Celebration Button (if admin/publisher) */}
          {canPublish && handleNewCelebrationFn && (
            <button
              onClick={handleNewCelebrationFn}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#38484c] hover:bg-[#2c393c] text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-all shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar Festejo</span>
            </button>
          )}
        </div>
      </div>

      {/* HIGHLIGHTED NEXT BIRTHDAY HERO BANNER */}
      {closestBirthday && closestBirthday.countdown && (
        <div className="relative overflow-hidden bg-gradient-to-br from-[#2a373b] via-[#202b2e] to-[#161d1f] text-white rounded-3xl p-5 sm:p-7 shadow-lg border border-slate-700/50">
          {/* Subtle glow circle */}
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-60 h-60 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-8 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            {/* Left Col: Info & Countdown */}
            <div className="flex items-start sm:items-center gap-4">
              <div className="relative shrink-0">
                <img
                  src={resolveCelebrationAvatar(
                    closestBirthday.item.employeeName,
                    closestBirthday.item.avatar,
                    closestBirthday.item.gender
                  )}
                  alt={closestBirthday.item.employeeName}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-pink-400/40 shadow-md bg-white p-0.5"
                />
                <div className="absolute -bottom-1 -right-1 bg-pink-600 text-white p-1 rounded-lg shadow-xs">
                  <Cake className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-pink-500/20 text-pink-300 border border-pink-500/30 inline-flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-pink-400" />
                    <span>Próximo Cumpleaños</span>
                  </span>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${closestBirthday.countdown.badgeColor}`}
                  >
                    {closestBirthday.countdown.relativeLabel}
                  </span>
                </div>

                <h3 className="text-lg sm:text-2xl font-black tracking-tight text-white leading-tight">
                  {closestBirthday.item.employeeName}
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-2 flex-wrap">
                  <span className="font-medium">{closestBirthday.item.department}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-pink-300 font-semibold flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{closestBirthday.item.date}</span>
                  </span>
                </p>
              </div>
            </div>

            {/* Right Col: Actions & Other Near Birthdays */}
            <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end gap-3 shrink-0">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => openWhatsAppGreeting(closestBirthday.item)}
                  title="Felicitar por WhatsApp"
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>

                <button
                  onClick={() => handleGreet(closestBirthday.item.id)}
                  disabled={greetingSuccessId === closestBirthday.item.id}
                  className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer ${
                    greetingSuccessId === closestBirthday.item.id
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white'
                  }`}
                >
                  {greetingSuccessId === closestBirthday.item.id ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>¡Saludo enviado!</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Enviar Saludo ({closestBirthday.item.greetingsCount})</span>
                    </>
                  )}
                </button>
              </div>

              {/* Other upcoming birthdays chips */}
              {upcomingList.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px] text-slate-400">
                  <span className="text-[10px] text-slate-400 font-medium">Otros cercanos:</span>
                  {upcomingList.map((u) => (
                    <span
                      key={u.item.id}
                      className="px-2 py-0.5 rounded-lg bg-white/10 text-slate-200 border border-white/10 text-[10px] font-medium"
                    >
                      {u.item.employeeName.split(' ')[0]} ({u.item.date})
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200 space-y-3">
          <div className="w-14 h-14 bg-pink-50 text-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-2">
            <Cake className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">No hay personas registradas en esta sección</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            El administrador puede registrar las fechas de cumpleaños y aniversarios para que todo el equipo de SOLMAR pueda verlas y enviar felicitaciones.
          </p>
          {canPublish && handleNewCelebrationFn && (
            <button
              onClick={handleNewCelebrationFn}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-[#38484c] text-white font-semibold text-xs rounded-xl hover:bg-[#2c393c]"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar primer festejo</span>
            </button>
          )}
        </div>
      ) : (
        /* Grid List */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => {
            const isBirthday = item.type === 'birthday';
            const isSent = greetingSuccessId === item.id;
            const isConfirmingDelete = confirmDeleteId === item.id;
            const countdown = getCelebrationCountdown(item.date);

            return (
              <div
                key={item.id}
                className={`bg-white rounded-3xl border p-6 shadow-xs hover:shadow-md transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${
                  isBirthday ? 'border-pink-200' : 'border-amber-200'
                }`}
              >
                {/* Decorative Top Accent Banner */}
                <div
                  className={`h-1.5 absolute top-0 left-0 right-0 ${
                    isBirthday
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500'
                      : 'bg-gradient-to-r from-amber-500 to-yellow-500'
                  }`}
                />

                <div>
                  {/* Header Badge & Action Controls */}
                  <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          isBirthday
                            ? 'bg-pink-50 text-pink-700 border border-pink-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {isBirthday ? (
                          <>
                            <Cake className="w-3.5 h-3.5 text-pink-500" />
                            <span>Cumpleaños</span>
                          </>
                        ) : (
                          <>
                            <Award className="w-3.5 h-3.5 text-amber-500" />
                            <span>{item.yearsAtCompany || 1} años</span>
                          </>
                        )}
                      </span>

                      {/* Countdown tag */}
                      {countdown && (
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            countdown.isToday
                              ? 'bg-rose-500 text-white animate-pulse'
                              : countdown.isTomorrow
                              ? 'bg-amber-500 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {countdown.relativeLabel}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{item.date}</span>
                      </span>

                      {canPublish && (
                        <div className="flex items-center gap-1 ml-1 pl-1 border-l border-slate-200">
                          {onEditCelebration && (
                            <button
                              onClick={() => onEditCelebration(item)}
                              title="Editar festejo"
                              className="p-1 text-slate-400 hover:text-[#38484c] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {onDeleteCelebration && (
                            <button
                              onClick={() => setConfirmDeleteId(isConfirmingDelete ? null : item.id)}
                              title="Eliminar festejo"
                              className={`p-1 rounded-lg transition-colors cursor-pointer ${
                                isConfirmingDelete
                                  ? 'bg-red-50 text-red-600'
                                  : 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                              }`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Confirm Delete Warning */}
                  {isConfirmingDelete && (
                    <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between text-xs animate-in fade-in">
                      <span className="text-red-700 font-semibold text-[11px]">
                        ¿Eliminar este festejo de la lista?
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2 py-1 bg-white text-slate-600 rounded-lg font-medium text-[10px] hover:bg-slate-100"
                        >
                          No
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="px-2 py-1 bg-red-600 text-white rounded-lg font-bold text-[10px] hover:bg-red-700 shadow-xs"
                        >
                          Sí, eliminar
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Profile Card Info */}
                  <div className="flex items-center gap-3.5 mb-4">
                    <img
                      src={resolveCelebrationAvatar(item.employeeName, item.avatar, item.gender)}
                      alt={item.employeeName}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-sm ring-1 ring-slate-200 shrink-0 bg-white p-0.5"
                    />
                    <div>
                      <h3 className="font-bold text-slate-900 text-base leading-tight">
                        {item.employeeName}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {item.department}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Button & Greetings Counter */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                    <PartyPopper className="w-3.5 h-3.5 text-amber-500" />
                    <span>{item.greetingsCount} saludos</span>
                  </span>

                  <div className="flex items-center gap-1.5">
                    {isBirthday && (
                      <button
                        onClick={() => openWhatsAppGreeting(item)}
                        title="Felicitar por WhatsApp"
                        className="p-1.5 rounded-xl border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-all cursor-pointer shadow-2xs"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => setSharingCelebration(item)}
                      title="Compartir festejo"
                      className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer shadow-2xs"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleGreet(item.id)}
                      disabled={isSent}
                      className={`px-3 py-1.5 rounded-xl font-semibold text-xs transition-all flex items-center gap-1.5 shadow-xs cursor-pointer ${
                        isSent
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : isBirthday
                          ? 'bg-pink-600 hover:bg-pink-700 text-white'
                          : 'bg-amber-600 hover:bg-amber-700 text-white'
                      }`}
                    >
                      {isSent ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>¡Enviado!</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Saludar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Professional Share Modal */}
      <ShareModal
        isOpen={!!sharingCelebration}
        onClose={() => setSharingCelebration(null)}
        item={sharingCelebration}
        type="celebration"
      />
    </div>
  );
};

