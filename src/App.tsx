import React, { useState, useEffect } from 'react';
import { useHRData } from './hooks/useHRData';

// Layout & Views
import { Navbar } from './components/Navbar';
import { Navigation } from './components/Navigation';
import { AnnouncementFeed } from './components/AnnouncementFeed';
import { DocumentsView } from './components/DocumentsView';
import { CelebrationsView } from './components/CelebrationsView';
import { AdminDashboard } from './components/AdminDashboard';

// Modals
import { AdminLoginModal } from './components/AdminLoginModal';
import { AnnouncementEditorModal } from './components/modals/AnnouncementEditorModal';
import { DocumentEditorModal } from './components/modals/DocumentEditorModal';
import { CelebrationEditorModal } from './components/modals/CelebrationEditorModal';

// Types
import { Announcement, DocumentItem, CelebrationItem } from './types';

export default function App() {
  const {
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
    setCompanyInfo,
    // Actions
    toggleLikeAnnouncement,
    addCommentToAnnouncement,
    saveAnnouncement,
    deleteAnnouncement,
    saveDocument,
    incrementDocumentDownload,
    deleteDocument,
    sendGreeting,
    saveCelebration,
    deleteCelebration,
    markNotificationAsRead,
    clearNotifications,
    deleteNotification,
    deleteAllNotifications,
  } = useHRData();

  const [activeTab, setActiveTab] = useState<string>('feed');
  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null);

  useEffect(() => {
    // Check URL parameters for deep linking
    const params = new URLSearchParams(window.location.search);
    const annId = params.get('announcement');
    const docId = params.get('document');

    if (annId) {
      setActiveTab('feed');
      setHighlightedItemId(annId);
    } else if (docId) {
      setActiveTab('documents');
      setHighlightedItemId(docId);
    } else if (window.location.hash) {
      const hash = window.location.hash;
      if (hash.startsWith('#announcement-')) {
        setActiveTab('feed');
        setHighlightedItemId(hash.replace('#announcement-', ''));
      } else if (hash.startsWith('#document-')) {
        setActiveTab('documents');
        setHighlightedItemId(hash.replace('#document-', ''));
      }
    }

    // Global drag-and-drop prevention
    const preventDrag = (e: DragEvent) => {
      e.preventDefault();
    };
    window.addEventListener('dragover', preventDrag, false);
    window.addEventListener('drop', preventDrag, false);

    return () => {
      window.removeEventListener('dragover', preventDrag, false);
      window.removeEventListener('drop', preventDrag, false);
    };
  }, []);

  // Modals state
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<DocumentItem | null>(null);

  const [isCelebrationModalOpen, setIsCelebrationModalOpen] = useState(false);
  const [editingCelebration, setEditingCelebration] = useState<CelebrationItem | null>(null);

  // Publish permissions
  const canPublish = role === 'admin' || isAdminLoggedIn;

  const handleOpenNewAnnouncement = () => {
    setEditingAnnouncement(null);
    setIsAnnouncementModalOpen(true);
  };

  const handleAddComment = (id: string, text: string) => {
    const authorName = isAdminLoggedIn || role === 'admin' ? 'RRHH SOLMAR' : 'Colaborador SOLMAR';
    addCommentToAnnouncement(id, text, authorName);
  };

  const handleEditAnnouncement = (ann: Announcement) => {
    setEditingAnnouncement(ann);
    setIsAnnouncementModalOpen(true);
  };

  const handleOpenNewDocument = () => {
    setEditingDocument(null);
    setIsDocumentModalOpen(true);
  };

  const handleEditDocument = (doc: DocumentItem) => {
    setEditingDocument(doc);
    setIsDocumentModalOpen(true);
  };

  const handleOpenNewCelebration = () => {
    setEditingCelebration(null);
    setIsCelebrationModalOpen(true);
  };

  const handleEditCelebration = (cel: CelebrationItem) => {
    setEditingCelebration(cel);
    setIsCelebrationModalOpen(true);
  };

  const handleLogin = (password: string) => {
    const res = loginAdmin(password);
    if (res.success) {
      setActiveTab('feed');
    }
    return res;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased pb-20 md:pb-8 w-full max-w-full overflow-x-hidden">
      
      {/* Top Main Bar */}
      <Navbar
        companyInfo={companyInfo}
        role={role}
        isAdminLoggedIn={isAdminLoggedIn}
        notifications={notifications}
        onMarkNotificationAsRead={markNotificationAsRead}
        onClearNotifications={clearNotifications}
        onDeleteNotification={deleteNotification}
        onDeleteAllNotifications={deleteAllNotifications}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={logoutAdmin}
        onRoleToggle={toggleRoleDirectly}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        globalSearch={globalSearch}
        setGlobalSearch={setGlobalSearch}
      />

      {/* Main Container Layout */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row min-w-0">
        
        {/* Navigation Sidebar */}
        <Navigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          role={role}
          isAdminLoggedIn={isAdminLoggedIn}
          upcomingCelebrationsCount={celebrations.length}
        />

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-hidden">
          
          {activeTab === 'feed' && (
            <AnnouncementFeed
              announcements={announcements}
              role={role}
              isAdminLoggedIn={isAdminLoggedIn}
              canPublish={canPublish}
              onLike={toggleLikeAnnouncement}
              onComment={handleAddComment}
              onEditAnnouncement={handleEditAnnouncement}
              onDeleteAnnouncement={deleteAnnouncement}
              onOpenNewModal={handleOpenNewAnnouncement}
              globalSearch={globalSearch}
              highlightedId={highlightedItemId}
            />
          )}

          {activeTab === 'documents' && (
            <DocumentsView
              documents={documents}
              role={role}
              canPublish={canPublish}
              onDownload={incrementDocumentDownload}
              onEditDocument={handleEditDocument}
              onDeleteDocument={deleteDocument}
              onOpenNewModal={handleOpenNewDocument}
              globalSearch={globalSearch}
              highlightedId={highlightedItemId}
            />
          )}

          {activeTab === 'celebrations' && (
            <CelebrationsView
              celebrations={celebrations}
              role={role}
              canPublish={canPublish}
              onSendGreeting={sendGreeting}
              onNewCelebration={handleOpenNewCelebration}
              onOpenNewModal={handleOpenNewCelebration}
              onEditCelebration={handleEditCelebration}
              onDeleteCelebration={deleteCelebration}
            />
          )}

          {activeTab === 'admin' && (
            <AdminDashboard
              companyInfo={companyInfo}
              announcements={announcements}
              documents={documents}
              celebrations={celebrations}
              canPublish={canPublish}
              onUpdateCompanyInfo={setCompanyInfo}
              onNavigateTab={setActiveTab}
              onNewAnnouncement={handleOpenNewAnnouncement}
              onEditAnnouncement={handleEditAnnouncement}
              onDeleteAnnouncement={deleteAnnouncement}
              onAddComment={handleAddComment}
              onNewDocument={handleOpenNewDocument}
              onNewCelebration={handleOpenNewCelebration}
            />
          )}

        </main>
      </div>

      {/* Auth Modal */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
      />

      {/* Editor Modals */}
      <AnnouncementEditorModal
        isOpen={isAnnouncementModalOpen}
        onClose={() => setIsAnnouncementModalOpen(false)}
        onSave={saveAnnouncement}
        editingAnnouncement={editingAnnouncement}
      />

      <DocumentEditorModal
        isOpen={isDocumentModalOpen}
        onClose={() => setIsDocumentModalOpen(false)}
        onSave={saveDocument}
        editingDocument={editingDocument}
      />

      <CelebrationEditorModal
        isOpen={isCelebrationModalOpen}
        onClose={() => setIsCelebrationModalOpen(false)}
        onSave={saveCelebration}
        editingCelebration={editingCelebration}
      />

    </div>
  );
}
