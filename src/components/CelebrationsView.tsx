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
  Share2
} from 'lucide-react';
import { ShareModal } from './modals/ShareModal';

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <span>🎂 Cumpleaños y Aniversarios Laborales</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Festejemos juntos los momentos especiales, cumpleaños y reconocimientos de nuestro equipo SOLMAR.
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

      {/* Empty State */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200 space-y-3">
          <div className="w-14 h-14 bg-pink-50 text-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-2">
            <Cake className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">No hay personas registradas en esta sección</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Puedes agregar a un colaborador para que todo el equipo pueda enviarle felicitaciones en su día especial.
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
                  <div className="flex items-center justify-between mb-4">
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
                          <span>{item.yearsAtCompany || 1} años en la empresa</span>
                        </>
                      )}
                    </span>

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
                      src={item.avatar}
                      alt={item.employeeName}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-sm ring-1 ring-slate-100 shrink-0"
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
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                    <PartyPopper className="w-3.5 h-3.5 text-amber-500" />
                    <span>{item.greetingsCount} saludos</span>
                  </span>

                  <div className="flex items-center gap-1.5">
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
                          <span>¡Saludo enviado!</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Enviar Saludo</span>
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
