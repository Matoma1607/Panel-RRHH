import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { BranchName, PushSubscriptionRecord } from '../types';

const SUBSCRIBED_DEVICE_KEY = 'solmar_push_device_id_v1';
const PUSH_PROMPT_DISMISSED_KEY = 'solmar_push_prompt_dismissed_v1';

/**
 * Checks if Push Notifications and Service Workers are supported in the browser
 */
export function isPushNotificationSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'Notification' in window
  );
}

/**
 * Returns current browser permission status ('default', 'granted', 'denied')
 */
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isPushNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

/**
 * Register Service Worker file
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return null;

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });
    return registration;
  } catch (err) {
    console.warn('Service worker registration note:', err);
    return null;
  }
}

/**
 * Generates or retrieves unique device ID for this browser
 */
export function getOrCreateDeviceId(): string {
  let deviceId = localStorage.getItem(SUBSCRIBED_DEVICE_KEY);
  if (!deviceId) {
    deviceId = 'dev_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now();
    localStorage.setItem(SUBSCRIBED_DEVICE_KEY, deviceId);
  }
  return deviceId;
}

/**
 * Request notification permission from user and save device subscription to Firestore
 */
export async function subscribeToPushNotifications(
  userBranch: BranchName,
  userName?: string
): Promise<{ success: boolean; status: NotificationPermission | 'unsupported'; error?: string }> {
  if (!isPushNotificationSupported()) {
    return { success: false, status: 'unsupported', error: 'Tu navegador no soporta notificaciones push.' };
  }

  try {
    // 1. Ask user for permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { success: false, status: permission, error: 'Permiso denegado por el usuario.' };
    }

    // 2. Ensure Service Worker is active
    await registerServiceWorker();

    // 3. Register device in Firestore
    const deviceId = getOrCreateDeviceId();
    const record: PushSubscriptionRecord = {
      id: deviceId,
      branch: userBranch,
      userName: userName || 'Colaborador',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 150) : 'Web',
      subscribedAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      enabled: true
    };

    const docRef = doc(db, 'push_subscriptions', deviceId);
    await setDoc(docRef, record, { merge: true });

    // Show initial test welcome notification
    triggerLocalPushNotification({
      title: '✅ ¡Avisos activados en SOLMAR!',
      body: `Te avisaremos cuando haya novedades importantes para ${userBranch} y saludos de cumpleaños.`,
      tag: 'welcome-notification'
    });

    return { success: true, status: 'granted' };
  } catch (error: any) {
    handleFirestoreError(error, OperationType.WRITE, 'push_subscriptions');
    return { success: false, status: 'denied', error: error?.message || 'Error al suscribir notificaciones' };
  }
}

/**
 * Trigger an immediate notification locally via the Service Worker (or fallback Notification API)
 */
export async function triggerLocalPushNotification(options: {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}) {
  if (!isPushNotificationSupported()) return;
  if (Notification.permission !== 'granted') return;

  const title = options.title;
  const notificationOptions = {
    body: options.body,
    icon: 'https://i.postimg.cc/cCPc7DGG/IMG-3504-JPG.jpg',
    badge: 'https://i.postimg.cc/cCPc7DGG/IMG-3504-JPG.jpg',
    tag: options.tag || 'solmar-notice-' + Date.now(),
    data: {
      url: options.url || '/'
    }
  };

  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg && reg.showNotification) {
        await reg.showNotification(title, notificationOptions);
        return;
      }
    }
    // Fallback if SW not ready yet
    new Notification(title, notificationOptions);
  } catch (err) {
    console.warn('Local push notification error:', err);
  }
}

/**
 * Checks whether the prompt banner was dismissed by the user previously
 */
export function isPushPromptDismissed(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(PUSH_PROMPT_DISMISSED_KEY) === 'true';
}

export function dismissPushPrompt() {
  if (typeof window !== 'undefined') {
    localStorage.setItem(PUSH_PROMPT_DISMISSED_KEY, 'true');
  }
}
