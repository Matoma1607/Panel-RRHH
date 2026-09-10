import React, { useState, useEffect } from 'react';
import { Bell, BellRing, X, CheckCircle, Smartphone } from 'lucide-react';
import { BranchName } from '../types';
import {
  isPushNotificationSupported,
  getNotificationPermission,
  subscribeToPushNotifications,
  isPushPromptDismissed,
  dismissPushPrompt
} from '../services/pushNotificationService';

interface PushNotificationBannerProps {
  userBranch: BranchName;
  userName?: string;
}

export const PushNotificationBanner: React.FC<PushNotificationBannerProps> = ({
  userBranch,
  userName
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscriptionSuccess, setSubscriptionSuccess] = useState(false);

  useEffect(() => {
    // Only show if browser supports it, user hasn't granted yet, and haven't dismissed
    if (!isPushNotificationSupported()) return;
    const permission = getNotificationPermission();
    if (permission === 'granted' || permission === 'denied') return;
    if (isPushPromptDismissed()) return;

    // Small delay so it doesn't pop aggressively on immediate load
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const handleActivate = async () => {
    setIsSubscribing(true);
    try {
      const result = await subscribeToPushNotifications(userBranch, userName);
      if (result.success) {
        setSubscriptionSuccess(true);
        setTimeout(() => {
          setIsVisible(false);
        }, 3500);
      } else {
        setIsVisible(false);
      }
    } catch {
      setIsVisible(false);
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleDismiss = () => {
    dismissPushPrompt();
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-[#0f2620] text-white rounded-xl p-4 shadow-xl border border-white/10 relative overflow-hidden backdrop-blur-md">
        {/* Subtle accent light */}
        <div className="absolute -right-8 -top-8 w-24 h-24 bg-[#c5622f]/20 rounded-full blur-xl pointer-events-none" />

        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-2.5 right-2.5 text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          title="Cerrar aviso"
          aria-label="Cerrar aviso"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#c5622f] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
            {subscriptionSuccess ? (
              <CheckCircle className="w-5 h-5 text-white animate-bounce" />
            ) : (
              <BellRing className="w-5 h-5 text-white animate-pulse" />
            )}
          </div>

          <div className="flex-1 min-w-0 pr-4">
            <h4 className="text-sm font-bold text-white leading-tight">
              {subscriptionSuccess ? '¡Avisos activados con éxito!' : '¿Recibir avisos en tu celular?'}
            </h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {subscriptionSuccess
                ? `Te notificaremos al instante cuando haya comunicados en ${userBranch} o cumpleaños del equipo.`
                : `Enterate al instante cuando RRHH publique novedades o quién cumple años sin tener que entrar a cada rato.`}
            </p>

            {!subscriptionSuccess && (
              <div className="flex items-center gap-2 mt-3">
                <button
                  type="button"
                  onClick={handleActivate}
                  disabled={isSubscribing}
                  className="px-3.5 py-1.5 bg-[#c5622f] hover:bg-[#d86f38] text-white text-xs font-bold rounded-lg transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>{isSubscribing ? 'Activando...' : '🔔 Sí, activar avisos'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="px-2.5 py-1.5 text-slate-400 hover:text-slate-200 text-xs font-medium cursor-pointer"
                >
                  Ahora no
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
