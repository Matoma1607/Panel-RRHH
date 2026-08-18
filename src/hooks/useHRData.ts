import { useState, useEffect } from 'react';
import {
  Announcement,
  DocumentItem,
  CelebrationItem,
  CompanyInfo,
  UserRole,
  AppNotification
} from '../types';
import {
  INITIAL_ANNOUNCEMENTS,
  INITIAL_CELEBRATIONS,
  INITIAL_COMPANY_INFO,
  INITIAL_DOCUMENTS,
  INITIAL_NOTIFICATIONS
} from '../mockData';
import {
  subscribeCollection,
  subscribeDocument,
  saveDocToFirestore,
  deleteDocFromFirestore,
  saveSingleConfig,
  initializeFirestoreDefaults
} from '../services/firestoreService';
import { testFirestoreConnection } from '../firebase';

const STORAGE_KEYS = {
  ROLE: 'rrhh_user_role_v3',
  ADMIN_LOGGED_IN: 'rrhh_admin_auth_v3',
};

export function useHRData() {
  const [role, setRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ROLE);
    return saved === 'admin' ? 'admin' : 'employee';
  });

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.ADMIN_LOGGED_IN) === 'true';
  });

  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(INITIAL_COMPANY_INFO);
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [documents, setDocuments] = useState<DocumentItem[]>(INITIAL_DOCUMENTS);
  const [celebrations, setCelebrations] = useState<CelebrationItem[]>(INITIAL_CELEBRATIONS);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);

  // Real-time Firestore sync & Initial connection test
  useEffect(() => {
    testFirestoreConnection();
    initializeFirestoreDefaults();

    // Subscribe to Firestore collections
    const unsubAnnouncements = subscribeCollection<Announcement>(
      'announcements',
      (items) => setAnnouncements(items),
      INITIAL_ANNOUNCEMENTS
    );

    const unsubDocuments = subscribeCollection<DocumentItem>(
      'documents',
      (items) => setDocuments(items),
      INITIAL_DOCUMENTS
    );

    const unsubCelebrations = subscribeCollection<CelebrationItem>(
      'celebrations',
      (items) => setCelebrations(items),
      INITIAL_CELEBRATIONS
    );

    const unsubNotifications = subscribeCollection<AppNotification>(
      'notifications',
      (items) => {
        // Filter and auto-clean old obsolete mock notifications from Firestore
        const legacyKeywords = [
          'esquema de trabajo',
          '40% off',
          'gimnasio',
          'beneficio',
          'gabriel morales',
          'código de conducta 2026',
          'manual del empleado'
        ];

        const validItems: AppNotification[] = [];
        items.forEach((item) => {
          const content = (item.title + ' ' + item.message).toLowerCase();
          const isLegacy = legacyKeywords.some((kw) => content.includes(kw));
          if (isLegacy) {
            // Delete from Firestore directly
            deleteDocFromFirestore('notifications', item.id);
          } else {
            validItems.push(item);
          }
        });

        setNotifications(validItems);
      },
      INITIAL_NOTIFICATIONS
    );

    const unsubCompany = subscribeDocument<CompanyInfo>(
      'company',
      'main',
      (data) => setCompanyInfo(data),
      INITIAL_COMPANY_INFO
    );

    return () => {
      unsubAnnouncements();
      unsubDocuments();
      unsubCelebrations();
      unsubNotifications();
      unsubCompany();
    };
  }, []);

  // Auto-prune orphan notifications (e.g. notifications for deleted test items)
  useEffect(() => {
    if (notifications.length === 0) return;

    const orphanIdsToDelete: string[] = [];

    notifications.forEach((notif) => {
      if (notif.type === 'announcement') {
        const hasMatchingAnn = announcements.some(
          (a) =>
            (notif.itemId && a.id === notif.itemId) ||
            (a.title && notif.title.toLowerCase().includes(a.title.toLowerCase()))
        );
        if (!hasMatchingAnn) {
          orphanIdsToDelete.push(notif.id);
        }
      } else if (notif.type === 'document') {
        const hasMatchingDoc = documents.some(
          (d) =>
            (notif.itemId && d.id === notif.itemId) ||
            (d.title && notif.title.toLowerCase().includes(d.title.toLowerCase()))
        );
        if (!hasMatchingDoc) {
          orphanIdsToDelete.push(notif.id);
        }
      } else if (notif.type === 'celebration') {
        const hasMatchingCel = celebrations.some(
          (c) =>
            (notif.itemId && c.id === notif.itemId) ||
            (c.employeeName && notif.title.toLowerCase().includes(c.employeeName.toLowerCase()))
        );
        if (!hasMatchingCel) {
          orphanIdsToDelete.push(notif.id);
        }
      }
    });

    if (orphanIdsToDelete.length > 0) {
      orphanIdsToDelete.forEach((id) => deleteDocFromFirestore('notifications', id));
      setNotifications((prev) => prev.filter((n) => !orphanIdsToDelete.includes(n.id)));
    }
  }, [announcements, documents, celebrations, notifications.length]);

  // Save lightweight auth state
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROLE, role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ADMIN_LOGGED_IN, String(isAdminLoggedIn));
  }, [isAdminLoggedIn]);

  // Auth actions
  const loginAdmin = (inputPassword: string) => {
    const cleanPass = inputPassword.trim();
    if (!cleanPass) {
      return { success: false, error: 'Por favor ingresá la contraseña de administración.' };
    }

    if (cleanPass === '$rrhhsolmar' || cleanPass.toLowerCase() === '$rrhhsolmar') {
      setIsAdminLoggedIn(true);
      setRole('admin');
      return { success: true };
    }

    return {
      success: false,
      error: 'Contraseña incorrecta. Verificá los datos ingresados.'
    };
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
    setRole('employee');
  };

  const toggleRoleDirectly = (newRole: UserRole) => {
    if (newRole === 'admin') {
      setIsAdminLoggedIn(true);
      setRole('admin');
    } else {
      setIsAdminLoggedIn(false);
      setRole('employee');
    }
  };

  // Actions: Announcements
  const toggleLikeAnnouncement = (id: string) => {
    setAnnouncements((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const alreadyLiked = item.likedBySession;
          const updated = {
            ...item,
            likedBySession: !alreadyLiked,
            likes: alreadyLiked ? Math.max(0, item.likes - 1) : item.likes + 1,
          };
          saveDocToFirestore('announcements', id, updated);
          return updated;
        }
        return item;
      })
    );
  };

  const addCommentToAnnouncement = (id: string, text: string, authorName = 'Empleado SOLMAR') => {
    if (!text.trim()) return;
    const newComment = {
      id: 'c-' + Date.now(),
      authorName,
      text: text.trim(),
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    setAnnouncements((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = {
            ...item,
            comments: [...(item.comments || []), newComment],
          };
          saveDocToFirestore('announcements', id, updated);
          return updated;
        }
        return item;
      })
    );
  };

  const saveAnnouncement = (announcementData: Partial<Announcement> & { id?: string }) => {
    if (announcementData.id) {
      setAnnouncements((prev) =>
        prev.map((item) => {
          if (item.id === announcementData.id) {
            const updated = { ...item, ...announcementData } as Announcement;
            saveDocToFirestore('announcements', item.id, updated);
            return updated;
          }
          return item;
        })
      );
    } else {
      const newAnn: Announcement = {
        id: 'ann-' + Date.now(),
        title: announcementData.title || 'Nuevo Comunicado',
        content: announcementData.content || '',
        date: new Date().toISOString().split('T')[0],
        category: announcementData.category || 'General',
        pinned: announcementData.pinned || false,
        imageUrl: announcementData.imageUrl,
        likes: 0,
        likedBySession: false,
        comments: [],
        author: announcementData.author || 'Gabinete de RRHH',
        targetArea: announcementData.targetArea || 'Todas'
      };
      setAnnouncements((prev) => [newAnn, ...prev]);
      saveDocToFirestore('announcements', newAnn.id, newAnn);

      const notif: AppNotification = {
        id: `not-${Date.now()}`,
        itemId: newAnn.id,
        title: `📢 ${newAnn.title}`,
        message: newAnn.content ? (newAnn.content.length > 90 ? newAnn.content.substring(0, 90) + '...' : newAnn.content) : 'Nuevo comunicado publicado en la cartelera.',
        type: 'announcement',
        date: 'Recién',
        read: false,
        linkTab: 'feed'
      };
      setNotifications((prev) => [notif, ...prev]);
      saveDocToFirestore('notifications', notif.id, notif);
    }
  };

  const deleteAnnouncement = (id: string) => {
    const targetAnn = announcements.find((a) => a.id === id);
    const targetTitle = targetAnn?.title?.toLowerCase();

    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    deleteDocFromFirestore('announcements', id);

    // Cascading delete related notifications
    setNotifications((prev) => {
      const remaining: AppNotification[] = [];
      prev.forEach((n) => {
        const isRelated =
          n.itemId === id ||
          (targetTitle && n.type === 'announcement' && n.title.toLowerCase().includes(targetTitle));

        if (isRelated) {
          deleteDocFromFirestore('notifications', n.id);
        } else {
          remaining.push(n);
        }
      });
      return remaining;
    });
  };

  // Actions: Documents
  const saveDocument = (docData: Partial<DocumentItem> & { id?: string }) => {
    if (docData.id) {
      setDocuments((prev) =>
        prev.map((d) => {
          if (d.id === docData.id) {
            const updated = { ...d, ...docData } as DocumentItem;
            saveDocToFirestore('documents', d.id, updated);
            return updated;
          }
          return d;
        })
      );
    } else {
      const newDoc: DocumentItem = {
        id: 'doc-' + Date.now(),
        title: docData.title || 'Documento.pdf',
        category: docData.category || 'Políticas',
        description: docData.description || 'Documento informativo para el personal.',
        fileType: docData.fileType || 'PDF',
        fileSize: docData.fileSize || '1.5 MB',
        updatedDate: new Date().toISOString().split('T')[0],
        downloadCount: 0,
        contentSnippet: docData.contentSnippet || 'Contenido oficial del documento corporativo.',
        fileUrl: docData.fileUrl,
        fileName: docData.fileName,
        fileData: docData.fileData,
      };
      setDocuments((prev) => [newDoc, ...prev]);
      saveDocToFirestore('documents', newDoc.id, newDoc);

      const notif: AppNotification = {
        id: `not-${Date.now()}`,
        itemId: newDoc.id,
        title: `📄 Nuevo Documento: ${newDoc.title}`,
        message: `Se publicó "${newDoc.title}" en la sección de Documentos (${newDoc.category}).`,
        type: 'document',
        date: 'Recién',
        read: false,
        linkTab: 'documents'
      };
      setNotifications((prev) => [notif, ...prev]);
      saveDocToFirestore('notifications', notif.id, notif);
    }
  };

  const incrementDocumentDownload = (id: string) => {
    setDocuments((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          const updated = { ...d, downloadCount: d.downloadCount + 1 };
          saveDocToFirestore('documents', id, updated);
          return updated;
        }
        return d;
      })
    );
  };

  const deleteDocument = (id: string) => {
    const targetDoc = documents.find((d) => d.id === id);
    const targetTitle = targetDoc?.title?.toLowerCase();

    setDocuments((prev) => prev.filter((d) => d.id !== id));
    deleteDocFromFirestore('documents', id);

    // Cascading delete related notifications
    setNotifications((prev) => {
      const remaining: AppNotification[] = [];
      prev.forEach((n) => {
        const isRelated =
          n.itemId === id ||
          (targetTitle && n.type === 'document' && n.title.toLowerCase().includes(targetTitle));

        if (isRelated) {
          deleteDocFromFirestore('notifications', n.id);
        } else {
          remaining.push(n);
        }
      });
      return remaining;
    });
  };

  // Actions: Celebrations
  const saveCelebration = (celData: Partial<CelebrationItem> & { id?: string }) => {
    if (celData.id) {
      setCelebrations((prev) =>
        prev.map((c) => {
          if (c.id === celData.id) {
            const updated = { ...c, ...celData } as CelebrationItem;
            saveDocToFirestore('celebrations', c.id, updated);
            return updated;
          }
          return c;
        })
      );
    } else {
      const newCel: CelebrationItem = {
        id: 'cel-' + Date.now(),
        employeeName: celData.employeeName || 'Colaborador',
        department: celData.department || 'General',
        avatar: celData.avatar,
        date: celData.date || '15/08',
        type: celData.type || 'birthday',
        yearsAtCompany: celData.yearsAtCompany,
        greetingsCount: 0,
      };
      setCelebrations((prev) => [newCel, ...prev]);
      saveDocToFirestore('celebrations', newCel.id, newCel);

      const notif: AppNotification = {
        id: `not-${Date.now()}`,
        itemId: newCel.id,
        title: `🎉 Festejo: ${newCel.employeeName}`,
        message: `Se añadió el festejo (${newCel.type === 'birthday' ? 'Cumpleaños' : 'Aniversario'}) de ${newCel.employeeName}.`,
        type: 'celebration',
        date: 'Recién',
        read: false,
        linkTab: 'celebrations'
      };
      setNotifications((prev) => [notif, ...prev]);
      saveDocToFirestore('notifications', notif.id, notif);
    }
  };

  const deleteCelebration = (id: string) => {
    const targetCel = celebrations.find((c) => c.id === id);
    const targetName = targetCel?.employeeName?.toLowerCase();

    setCelebrations((prev) => prev.filter((c) => c.id !== id));
    deleteDocFromFirestore('celebrations', id);

    // Cascading delete related notifications
    setNotifications((prev) => {
      const remaining: AppNotification[] = [];
      prev.forEach((n) => {
        const isRelated =
          n.itemId === id ||
          (targetName && n.type === 'celebration' && n.title.toLowerCase().includes(targetName));

        if (isRelated) {
          deleteDocFromFirestore('notifications', n.id);
        } else {
          remaining.push(n);
        }
      });
      return remaining;
    });
  };

  const sendGreeting = (celebrationId: string) => {
    setCelebrations((prev) =>
      prev.map((c) => {
        if (c.id === celebrationId) {
          const updated = { ...c, greetingsCount: c.greetingsCount + 1 };
          saveDocToFirestore('celebrations', celebrationId, updated);
          return updated;
        }
        return c;
      })
    );
  };

  // Notification Handlers
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          const updated = { ...n, read: true };
          saveDocToFirestore('notifications', id, updated);
          return updated;
        }
        return n;
      })
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    deleteDocFromFirestore('notifications', id);
  };

  const clearNotifications = () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      for (const n of updated) {
        saveDocToFirestore('notifications', n.id, n);
      }
      return updated;
    });
  };

  const deleteAllNotifications = () => {
    notifications.forEach((n) => {
      deleteDocFromFirestore('notifications', n.id);
    });
    setNotifications([]);
  };

  const handleSetCompanyInfo = (newInfo: CompanyInfo | ((prev: CompanyInfo) => CompanyInfo)) => {
    setCompanyInfo((prev) => {
      const updated = typeof newInfo === 'function' ? newInfo(prev) : newInfo;
      saveSingleConfig('company', 'main', updated);
      return updated;
    });
  };

  return {
    role,
    isAdminLoggedIn,
    companyInfo,
    announcements,
    documents,
    celebrations,
    notifications,
    // Auth
    loginAdmin,
    logoutAdmin,
    toggleRoleDirectly,
    setCompanyInfo: handleSetCompanyInfo,
    // Announcements
    toggleLikeAnnouncement,
    addCommentToAnnouncement,
    saveAnnouncement,
    deleteAnnouncement,
    // Documents
    saveDocument,
    incrementDocumentDownload,
    deleteDocument,
    // Celebrations
    sendGreeting,
    saveCelebration,
    deleteCelebration,
    // Notifications
    markNotificationAsRead,
    clearNotifications,
    deleteNotification,
    deleteAllNotifications,
  };
}
