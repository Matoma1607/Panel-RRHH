import React, { useState } from 'react';
import {
  Bell,
  CheckCheck,
  FileText,
  Megaphone,
  X,
  ChevronRight,
  Sparkles,
  Cake,
  UserPlus,
  Gift,
  Coins,
  Inbox,
  Trash2,
  MapPin
} from 'lucide-react';
import { AppNotification, BranchName } from '../types';

interface NotificationsPopoverProps {
  notifications: AppNotification[];
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
  onDeleteNotification?: (id: string) => void;
  onDeleteAll?: () => void;
  onNavigateTab: (tab: string) => void;
  userBranch?: BranchName;
  isAdminLoggedIn?: boolean;
}

export const NotificationsPopover: React.FC<NotificationsPopoverProps> = ({
  notifications,
  isOpen,
  onClose,
  onMarkAsRead,
  onClearAll,
  onDeleteNotification,
  onDeleteAll,
  onNavigateTab,
  userBranch,
  isAdminLoggedIn = false,
}) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter notifications by branch for employees
  const branchScopedNotifications = notifications.filter((notif) => {
    if (!isAdminLoggedIn && userBranch) {
      if (notif.targetBranch && notif.targetBranch !== 'Todas' && notif.targetBranch !== userBranch) {
        return false;
      }
    }
    return true;
  });

  const unreadCount = branchScopedNotifications.filter((n) => !n.read).length;
  const filteredNotifications = filter === 'unread' ? branchScopedNotifications.filter((n) => !n.read) : branchScopedNotifications;

  const getNotificationIcon = (notif: AppNotification) => {
    const text = (notif.title + ' ' + notif.message).toLowerCase();
    if (text.includes('documento') || text.includes('.pdf') || text.includes('manual') || text.includes('política')) {
      return (
        <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100">
          <FileText className="w-4 h-4" />
        </div>
      );
    }
    if (text.includes('festejo') || text.includes('cumpleaños') || text.includes('aniversario') || text.includes('🎉')) {
      return (
        <div className="w-8 h-8 rounded-xl bg-pink-50 text-pink-700 flex items-center justify-center shrink-0 border border-pink-100">
          <Cake className="w-4 h-4" />
        </div>
      );
    }
    if (text.includes('ingreso') || text.includes('bienvenido') || text.includes('compañero') || text.includes('👋')) {
      return (
        <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 border border-indigo-100">
          <UserPlus className="w-4 h-4" />
        </div>
      );
    }
    if (text.includes('recibo') || text.includes('sueldo') || text.includes('haberes') || text.includes('💰')) {
      return (
        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
          <Coins className="w-4 h-4" />
        </div>
      );
    }
    if (text.includes('beneficio') || text.includes('descuento') || text.includes('🎁')) {
      return (
        <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-100">
          <Gift className="w-4 h-4" />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
        <Megaphone className="w-4 h-4" />
      </div>
    );
  };

  const handleNotificationClick = (notif: AppNotification) => {
    onMarkAsRead(notif.id);

    // Map tab safely (redirect any legacy or unknown tab to feed)
    const validTabs: string[] = ['feed', 'documents', 'celebrations'];
    const targetTab = validTabs.includes(notif.linkTab || '') ? notif.linkTab! : 'feed';

    onNavigateTab(targetTab);

    // Show quick feedback banner before closing
    setToastMessage(`Abriendo: ${notif.title.replace(/^[^\w\s]+/, '').trim()}`);
    setTimeout(() => {
      setToastMessage(null);
      onClose();
    }, 450);
  };

  return (
    <>
      {/* Mobile Backdrop to prevent clipping and allow clean dismiss */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 sm:hidden animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Main Popover Card */}
      <div
        className="fixed inset-x-3 top-16 sm:absolute sm:inset-auto sm:right-0 sm:top-12 sm:w-[400px] max-h-[82vh] sm:max-h-[520px] bg-white rounded-3xl shadow-2xl border border-slate-200 z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="p-4 bg-[#232f32] text-white flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400">
              <Bell className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white tracking-tight">Notificaciones</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-black bg-emerald-500 text-white rounded-full">
                    {unreadCount} nuevas
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-300 truncate">Novedades y publicaciones del portal</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 shrink-0">
            {unreadCount > 0 && (
              <button
                onClick={onClearAll}
                className="text-[11px] font-semibold text-emerald-300 hover:text-white bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                title="Marcar todas como leídas"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Leídas</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-slate-300 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Cerrar notificaciones"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-200/80 text-xs shrink-0">
          <div className="flex gap-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full font-bold text-[11px] transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              Todas ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-full font-bold text-[11px] transition-all cursor-pointer ${
                filter === 'unread'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              No leídas ({unreadCount})
            </button>
          </div>
          <span className="text-[10px] text-slate-600 font-medium">Actualizado en tiempo real</span>
        </div>

        {/* Feedback Banner */}
        {toastMessage && (
          <div className="bg-emerald-600 text-white text-xs px-4 py-2 font-semibold flex items-center gap-2 shrink-0 animate-in fade-in">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{toastMessage}</span>
          </div>
        )}

        {/* Notifications List */}
        <div className="overflow-y-auto divide-y divide-slate-100 flex-1 overscroll-contain">
          {filteredNotifications.length === 0 ? (
            <div className="p-10 text-center text-slate-400 flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3 text-slate-300">
                <Inbox className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-700">
                {filter === 'unread' ? 'No tienes notificaciones sin leer' : 'No hay notificaciones'}
              </p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-xs leading-relaxed">
                Cada nuevo comunicado, documento, festejo o ingreso que se publique aparecerá aquí automáticamente.
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-3.5 sm:p-4 hover:bg-slate-50 cursor-pointer transition-all flex items-start gap-3 group relative ${
                  !notif.read ? 'bg-teal-50/40' : ''
                }`}
              >
                {/* Visual indicator bar on left for unread */}
                {!notif.read && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-600" />
                )}

                {/* Type Icon */}
                {getNotificationIcon(notif)}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1.5 mb-0.5">
                    <h4
                      className={`text-xs truncate ${
                        !notif.read ? 'font-black text-slate-900' : 'font-bold text-slate-700'
                      }`}
                    >
                      {notif.title}
                    </h4>
                    <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                      {notif.date}
                    </span>
                  </div>
                  {notif.targetBranch && notif.targetBranch !== 'Todas' && (
                    <div className="mb-1">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                        📍 Para: {notif.targetBranch}
                      </span>
                    </div>
                  )}
                  <p className="text-xs text-slate-600 leading-snug line-clamp-2">
                    {notif.message}
                  </p>
                </div>

                {/* Actions: Delete or Navigate */}
                <div className="flex items-center gap-1 self-center shrink-0 pl-1">
                  {onDeleteNotification && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteNotification(notif.id);
                      }}
                      className="p-1 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer opacity-80 hover:opacity-100"
                      title="Eliminar notificación"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <div className="text-slate-300 group-hover:text-teal-700 group-hover:translate-x-0.5 transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <span>Tocá para ir al contenido</span>
          <div className="flex items-center gap-2.5">
            {onDeleteAll && notifications.length > 0 && (
              <button
                onClick={onDeleteAll}
                className="text-rose-600 font-semibold hover:underline cursor-pointer"
              >
                Eliminar todas
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-teal-800 font-bold hover:underline cursor-pointer"
              >
                Marcar leídas
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};


