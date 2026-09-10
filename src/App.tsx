import React, { useState, useEffect } from 'react';
import { useHRData } from './hooks/useHRData';

// Layout & Views
import { Navbar } from './components/Navbar';
import { Navigation } from './components/Navigation';
import { RightRail } from './components/RightRail';
import { AnnouncementFeed } from './components/AnnouncementFeed';
import { DocumentsView } from './components/DocumentsView';
import { CelebrationsView } from './components/CelebrationsView';
import { AdminDashboard } from './components/AdminDashboard';

// Modals
import { AdminLoginModal } from './components/AdminLoginModal';
import { AnnouncementEditorModal } from './components/modals/AnnouncementEditorModal';
import { DocumentEditorModal } from './components/modals/DocumentEditorModal';
import { CelebrationEditorModal } from './components/modals/CelebrationEditorModal';
import { BranchSelectorModal } from './components/modals/BranchSelectorModal';
import { UserProfileModal } from './components/modals/UserProfileModal';
import { PushNotificationBanner } from './components/PushNotificationBanner';
import { registerServiceWorker } from './services/pushNotificationService';

// Types
import { Announcement, DocumentItem, CelebrationItem, BranchName, ALL_BRANCHES, parseBranchFromQuery } from './types';

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

  // Branch Selection & Permanent Lock States
  const [isDirectBranchLink, setIsDirectBranchLink] = useState<boolean>(false);
  const [hasConfiguredBranch, setHasConfiguredBranch] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const branchQuery = params.get('sucursal') || params.get('branch') || params.get('sede');
      if (parseBranchFromQuery(branchQuery)) return true;
      const saved = localStorage.getItem('solmar_user_branch');
      if (saved && ALL_BRANCHES.includes(saved as any)) return true;
    }
    return false;
  });

  const [userBranch, setUserBranch] = useState<BranchName>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const branchQuery = params.get('sucursal') || params.get('branch') || params.get('sede');
      const parsedFromQuery = parseBranchFromQuery(branchQuery);
      if (parsedFromQuery) {
        localStorage.setItem('solmar_user_branch', parsedFromQuery);
        return parsedFromQuery;
      }
      const saved = localStorage.getItem('solmar_user_branch') as BranchName;
      if (saved && ALL_BRANCHES.includes(saved)) {
        return saved;
      }
    }
    return 'Solmar Alem';
  });

  const [isBranchPickerOpen, setIsBranchPickerOpen] = useState<boolean>(() => {
    // If not configured and not admin, show initial picker
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const branchQuery = params.get('sucursal') || params.get('branch') || params.get('sede');
      if (parseBranchFromQuery(branchQuery)) return false;
      const saved = localStorage.getItem('solmar_user_branch');
      if (saved && ALL_BRANCHES.includes(saved as any)) return false;
    }
    return true; // Show initial selection if branch not chosen yet
  });

  const [userName, setUserName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('solmar_user_name') || '';
    }
    return '';
  });

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleSaveUserName = (name: string) => {
    const trimmed = name.trim();
    setUserName(trimmed);
    if (typeof window !== 'undefined') {
      if (trimmed) {
        localStorage.setItem('solmar_user_name', trimmed);
      } else {
        localStorage.removeItem('solmar_user_name');
      }
    }
  };

  useEffect(() => {
    // Check URL parameters for deep linking & branch context
    const params = new URLSearchParams(window.location.search);
    const annId = params.get('announcement');
    const docId = params.get('document');
    const branchQuery = params.get('sucursal') || params.get('branch') || params.get('sede');

    const parsedBranch = parseBranchFromQuery(branchQuery);
    if (parsedBranch) {
      setUserBranch(parsedBranch);
      setIsDirectBranchLink(true);
      setHasConfiguredBranch(true);
      setIsBranchPickerOpen(false);
      localStorage.setItem('solmar_user_branch', parsedBranch);
    }

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

    // Register Service Worker silently in background
    registerServiceWorker();

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

  const handleSelectBranch = (branch: BranchName) => {
    setUserBranch(branch);
    setHasConfiguredBranch(true);
    setIsBranchPickerOpen(false);
    localStorage.setItem('solmar_user_branch', branch);
  };

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

  const handleAddComment = (id: string, text: string, explicitAuthorName?: string) => {
    let author = explicitAuthorName;
    if (!author) {
      if (isAdminLoggedIn || role === 'admin') {
        author = 'RRHH SOLMAR';
      } else {
        const effectiveName = userName.trim() || 'Colaborador';
        author = userBranch ? `${effectiveName} (${userBranch})` : effectiveName;
      }
    }
    addCommentToAnnouncement(id, text, author);
  };

  const handleEditAnnouncement = (ann: Announcement) => {
    setEditingAnnouncement(ann);
    setIsAnnouncementModalOpen(true);
  };

  const handleOpenNewDocument = (targetBranchOverride?: BranchName) => {
    if (targetBranchOverride) {
      setEditingDocument({
        id: '',
        title: '',
        category: 'Reglamentos',
        targetBranch: targetBranchOverride,
        fileType: 'PDF',
        fileSize: '1.2 MB',
        updatedDate: new Date().toISOString().split('T')[0],
        downloadCount: 0,
        description: '',
      });
    } else {
      setEditingDocument(null);
    }
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
    <div className="min-h-screen relative text-slate-800 font-sans antialiased pb-[calc(4.75rem+env(safe-area-inset-bottom,0px))] md:pb-8 w-full max-w-full overflow-x-hidden bg-[#eef1ee]">
      
      <div className="relative z-10">
        {/* Top Main Bar */}
      <Navbar
        companyInfo={companyInfo}
        role={role}
        isAdminLoggedIn={isAdminLoggedIn}
        userBranch={userBranch}
        isDirectBranchLink={isDirectBranchLink}
        onOpenBranchPicker={isAdminLoggedIn ? () => setIsBranchPickerOpen(true) : undefined}
        userName={userName}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
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
        announcements={announcements}
        documents={documents}
        celebrations={celebrations}
      />

      {/* 3-Column Main Container Layout */}
      <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 py-4 flex gap-4 min-w-0">
        
        {/* 1. Sidebar Izquierdo (~220px) */}
        <Navigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          role={role}
          isAdminLoggedIn={isAdminLoggedIn}
          upcomingCelebrationsCount={celebrations.length}
          newAnnouncementsCount={announcements.length}
          updatedDocsCount={documents.length}
          userName={userName}
          userBranch={userBranch}
          onOpenProfileModal={() => setIsProfileModalOpen(true)}
        />

        {/* 2. Columna Central Principal */}
        <main className="flex-1 min-w-0">
          
          {activeTab === 'feed' && (
            <AnnouncementFeed
              announcements={announcements}
              documents={documents}
              role={role}
              isAdminLoggedIn={isAdminLoggedIn}
              canPublish={canPublish}
              userBranch={userBranch}
              isDirectBranchLink={isDirectBranchLink}
              onOpenBranchPicker={isAdminLoggedIn ? () => setIsBranchPickerOpen(true) : undefined}
              onNavigateTab={setActiveTab}
              onLike={toggleLikeAnnouncement}
              onComment={handleAddComment}
              onEditAnnouncement={handleEditAnnouncement}
              onDeleteAnnouncement={deleteAnnouncement}
              onOpenNewModal={handleOpenNewAnnouncement}
              globalSearch={globalSearch}
              setGlobalSearch={setGlobalSearch}
              highlightedId={highlightedItemId}
              userName={userName}
              onSaveUserName={handleSaveUserName}
              onOpenProfileModal={() => setIsProfileModalOpen(true)}
            />
          )}

          {activeTab === 'documents' && (
            <DocumentsView
              documents={documents}
              role={role}
              isAdminLoggedIn={isAdminLoggedIn}
              userBranch={userBranch}
              setUserBranch={handleSelectBranch}
              isDirectBranchLink={isDirectBranchLink}
              canPublish={canPublish}
              onDownload={incrementDocumentDownload}
              onEditDocument={handleEditDocument}
              onDeleteDocument={deleteDocument}
              onOpenNewModal={() => handleOpenNewDocument()}
              globalSearch={globalSearch}
              setGlobalSearch={setGlobalSearch}
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
              globalSearch={globalSearch}
              setGlobalSearch={setGlobalSearch}
              userName={userName}
              onSaveUserName={handleSaveUserName}
              userBranch={userBranch}
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
              onNewDocument={() => handleOpenNewDocument()}
              onNewCelebration={handleOpenNewCelebration}
              onNewDocumentForBranch={handleOpenNewDocument}
            />
          )}

        </main>

        {/* 3. Columna Derecha (Rail, ~280px) */}
        <RightRail
          celebrations={celebrations}
          documents={documents}
          announcements={announcements}
          userBranch={userBranch}
          onNavigateTab={setActiveTab}
          onDownloadDocument={incrementDocumentDownload}
          onSendGreeting={sendGreeting}
          userName={userName}
        />
      </div>

      {/* Auth Modal */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
      />

      {/* Branch Selector Modal (Initial Setup or Admin Audit) */}
      <BranchSelectorModal
        isOpen={isBranchPickerOpen}
        onClose={hasConfiguredBranch || isAdminLoggedIn ? () => setIsBranchPickerOpen(false) : undefined}
        currentBranch={userBranch}
        onSelectBranch={handleSelectBranch}
        isInitialSetup={!hasConfiguredBranch}
        documents={documents}
        announcements={announcements}
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

      {/* Collaborator Profile Identification Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentName={userName}
        userBranch={userBranch}
        onSaveName={handleSaveUserName}
      />

      {/* Floating Push Notification Banner for Mobile & Desktop */}
      <PushNotificationBanner
        userBranch={userBranch}
        userName={userName}
      />

      </div>
    </div>
  );
}
