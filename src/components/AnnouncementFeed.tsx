import React, { useState, useEffect } from 'react';
import { Announcement, CategoryType, UserRole, BranchName, DocumentItem, ALL_BRANCHES } from '../types';
import {
  Pin,
  Heart,
  MessageSquare,
  Plus,
  Trash2,
  Edit3,
  Calendar,
  User,
  Share2,
  Send,
  Sparkles,
  Search,
  Filter,
  Check,
  Link as LinkIcon,
  Building2,
  MapPin,
  Lock,
  Globe
} from 'lucide-react';
import { ShareModal } from './modals/ShareModal';
import { BranchBanner } from './BranchBanner';

interface AnnouncementFeedProps {
  announcements: Announcement[];
  documents?: DocumentItem[];
  role: UserRole;
  canPublish?: boolean;
  activeArea?: string;
  activeEmployeeName?: string;
  userBranch?: BranchName;
  isDirectBranchLink?: boolean;
  onOpenBranchPicker?: () => void;
  onNavigateTab?: (tab: string) => void;
  searchFilter?: string;
  globalSearch?: string;
  highlightedId?: string | null;
  onLike: (id: string) => void;
  onAddComment?: (id: string, text: string) => void;
  onComment?: (id: string, text: string) => void;
  onNewAnnouncement?: () => void;
  onOpenNewModal?: () => void;
  onEditAnnouncement?: (announcement: Announcement) => void;
  onDeleteAnnouncement?: (id: string) => void;
  employees?: any[];
  isAdminLoggedIn?: boolean;
}

const CATEGORIES: { label: string; value: CategoryType | 'Todos' }[] = [
  { label: 'Todos', value: 'Todos' },
  { label: 'Políticas', value: 'Políticas' },
  { label: 'Eventos', value: 'Eventos' },
  { label: 'General', value: 'General' },
  { label: 'Urgente', value: 'Urgente' },
];

export const AnnouncementFeed: React.FC<AnnouncementFeedProps> = ({
  announcements,
  documents = [],
  role,
  canPublish = role === 'admin',
  activeArea,
  userBranch,
  isDirectBranchLink = false,
  onOpenBranchPicker,
  onNavigateTab,
  searchFilter,
  globalSearch,
  highlightedId,
  onLike,
  onAddComment,
  onComment,
  onNewAnnouncement,
  onOpenNewModal,
  onEditAnnouncement,
  onDeleteAnnouncement,
  isAdminLoggedIn = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'Todos'>('Todos');
  const [openCommentFor, setOpenCommentFor] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [sharingAnnouncement, setSharingAnnouncement] = useState<Announcement | null>(null);

  // Admin filter allows switching between auditing the active branch or viewing all
  const [adminBranchFilter, setAdminBranchFilter] = useState<'Todas' | 'Auditar' | BranchName>('Auditar');

  const handleCommentFn = onAddComment || onComment;
  const handleNewAnnouncementFn = onNewAnnouncement || onOpenNewModal;

  useEffect(() => {
    if (highlightedId) {
      const element = document.getElementById(`announcement-${highlightedId}`);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 200);
      }
    }
  }, [highlightedId]);

  const handleTriggerShare = (item: Announcement) => {
    setSharingAnnouncement(item);
  };

  const effectiveFilter = (searchFilter || globalSearch || '').toLowerCase();

  // Effective branch for filtering
  const effectiveAuditedBranch = isAdminLoggedIn
    ? (adminBranchFilter === 'Todas' ? 'Todas' : (adminBranchFilter === 'Auditar' ? (userBranch || 'Todas') : adminBranchFilter))
    : userBranch;

  const filtered = announcements.filter((item) => {
    // Strict Branch Filter: If a specific branch is active, only show if target is 'Todas' or matches the active branch
    if (effectiveAuditedBranch && effectiveAuditedBranch !== 'Todas') {
      if (item.targetBranch && item.targetBranch !== 'Todas' && item.targetBranch !== effectiveAuditedBranch) {
        return false;
      }
    }

    const matchesCategory = selectedCategory === 'Todos' || item.category === selectedCategory;
    const matchesSearch =
      !effectiveFilter ||
      (item.title || '').toLowerCase().includes(effectiveFilter) ||
      (item.content || '').toLowerCase().includes(effectiveFilter) ||
      (item.category || '').toLowerCase().includes(effectiveFilter) ||
      (item.targetBranch || '').toLowerCase().includes(effectiveFilter);
    return matchesCategory && matchesSearch;
  });

  const pinnedAnnouncements = filtered.filter((item) => item.pinned);
  const regularAnnouncements = filtered.filter((item) => !item.pinned);

  const handleCommentSubmit = (id: string) => {
    const text = commentInputs[id] || '';
    if (text.trim() && handleCommentFn) {
      handleCommentFn(id, text.trim());
      setCommentInputs((prev) => ({ ...prev, [id]: '' }));
    }
  };

  const getCategoryBadgeStyle = (cat: CategoryType) => {
    switch (cat) {
      case 'Urgente':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Políticas':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Eventos':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'General':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-[#a6b2b1]/20 text-[#38484c] border-[#a6b2b1]/50';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Branch Alert & News Banner */}
      {userBranch && (
        <BranchBanner
          userBranch={userBranch}
          documents={documents}
          announcements={announcements}
          isDirectLink={isDirectBranchLink}
          isAdminLoggedIn={isAdminLoggedIn}
          onNavigateTab={onNavigateTab || (() => {})}
          onOpenBranchPicker={onOpenBranchPicker}
        />
      )}

      {/* Admin Audit & Branch Filter Control */}
      {isAdminLoggedIn && (
        <div className="bg-white p-3.5 sm:p-4 rounded-3xl border border-teal-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">
                  Filtro de Sucursal (Vista Administrador)
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-900 border border-teal-300">
                  Auditoría RRHH
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                {effectiveAuditedBranch === 'Todas'
                  ? 'Mostrando todos los comunicados de todas las sucursales.'
                  : `Visualizando la cartelera exactamente como la ven los colaboradores de ${effectiveAuditedBranch}.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <label className="text-xs font-bold text-slate-600 hidden sm:block whitespace-nowrap">
              Filtrar por:
            </label>
            <select
              value={adminBranchFilter === 'Auditar' ? (userBranch || 'Todas') : adminBranchFilter}
              onChange={(e) => setAdminBranchFilter(e.target.value as any)}
              className="px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-teal-700 cursor-pointer shadow-2xs"
            >
              <option value="Todas">🌐 Todas las Sucursales (Ver Todo)</option>
              {ALL_BRANCHES.map((branch) => (
                <option key={branch} value={branch}>
                  📍 Solo {branch} {userBranch === branch ? '(Sucursal Activa)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Top Welcome / Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#38484c] tracking-tight">
            ¡Hola de nuevo!
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Aquí tienes las novedades, comunicados e información oficial de la empresa para hoy.
          </p>
        </div>

        {canPublish ? (
          <button
            onClick={handleNewAnnouncementFn}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#38484c] hover:bg-[#2c393c] text-white font-semibold text-xs sm:text-sm rounded-2xl shadow-md shadow-[#38484c]/20 transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Comunicado</span>
          </button>
        ) : activeArea ? (
          <div className="px-3.5 py-1.5 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-bold flex items-center gap-2 shrink-0">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Área {activeArea} (Modo Lectura & Interacción)</span>
          </div>
        ) : null}
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <Filter className="w-4 h-4 text-slate-400 shrink-0 ml-1 hidden sm:block" />
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
              selectedCategory === cat.value
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xs">
          <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-base">No hay comunicados en esta categoría</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Prueba ajustando los filtros de búsqueda o categoría.
          </p>
        </div>
      )}

      {/* Announcements Bento Cards List */}
      <div className="space-y-6">
        {[...pinnedAnnouncements, ...regularAnnouncements].map((item) => {
          const isHighlighted = highlightedId === item.id;
          return (
            <article
              id={`announcement-${item.id}`}
              key={item.id}
              className={`bg-white rounded-3xl border transition-all duration-300 shadow-xs hover:shadow-md overflow-hidden relative ${
                isHighlighted
                  ? 'border-emerald-500 ring-4 ring-emerald-500/20 shadow-xl bg-emerald-50/10'
                  : item.pinned
                  ? 'border-slate-200 ring-2 ring-[#38484c]/20'
                  : 'border-slate-200'
              }`}
            >
              {/* Highlight Badge if opened from link */}
              {isHighlighted && (
                <div className="bg-emerald-600 text-white text-xs px-4 py-1.5 font-bold flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>Comunicado abierto mediante vínculo compartido</span>
                  </div>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded">Nota destacada</span>
                </div>
              )}

              {/* Top Accent Line for Pinned Cards */}
              {item.pinned && !isHighlighted && (
                <div className="w-full h-1 bg-[#38484c]" />
              )}

              <div className="p-6 space-y-4">
                
                {/* Header: Category Badge & Date / Pinned Label */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${getCategoryBadgeStyle(
                        item.category
                      )}`}
                    >
                      {item.category.toUpperCase()}
                    </span>

                    {item.targetBranch && item.targetBranch !== 'Todas' && (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-100 text-teal-900 border border-teal-300 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-teal-700" />
                        <span>Sucursal {item.targetBranch.replace('Solmar ', '')}</span>
                      </span>
                    )}

                    {item.pinned && (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#a6b2b1]/20 text-[#38484c] flex items-center gap-1 border border-[#a6b2b1]/50">
                        <Pin className="w-3 h-3 fill-[#38484c]" />
                        <span>FIJADO</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 font-medium">{item.date}</span>

                    {canPublish && (
                      <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
                        <button
                          onClick={() => onEditAnnouncement(item)}
                          title="Editar comunicado"
                          className="p-1.5 text-slate-400 hover:text-[#38484c] hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteAnnouncement(item.id)}
                          title="Eliminar comunicado"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Title & Body */}
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug mb-3">
                    {item.title}
                  </h3>
                  <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-line font-normal">
                    {item.content}
                  </div>
                </div>

                {/* Optional Image */}
                {item.imageUrl && (
                  <div className="rounded-2xl overflow-hidden border border-slate-100 max-h-96 bg-slate-100">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover max-h-96 hover:scale-101 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                )}

                {/* Author Footer & Interaction Bar */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#a6b2b1]/30 text-[#38484c] flex items-center justify-center font-bold text-xs">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="text-xs text-slate-500 font-medium">
                      Por: <strong className="text-slate-700 font-semibold">{item.author}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Like Button */}
                    <button
                      onClick={() => onLike(item.id)}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        item.likedBySession
                          ? 'bg-rose-50 text-rose-600 font-bold border border-rose-200'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 transition-transform ${
                          item.likedBySession ? 'fill-rose-500 text-rose-500 scale-110' : 'text-slate-400'
                        }`}
                      />
                      <span>{item.likes}</span>
                      <span className="hidden sm:inline">Me gusta</span>
                    </button>

                    {/* Comment Toggle */}
                    <button
                      onClick={() =>
                        setOpenCommentFor(openCommentFor === item.id ? null : item.id)
                      }
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 transition-all"
                    >
                      <MessageSquare className="w-4 h-4 text-slate-400" />
                      <span>{item.comments.length}</span>
                      <span className="hidden sm:inline">Comentarios</span>
                    </button>

                    {/* Universal Professional Share Button */}
                    <button
                      onClick={() => handleTriggerShare(item)}
                      title="Compartir nota completa"
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border border-teal-200 text-teal-800 bg-teal-50 hover:bg-teal-100 hover:border-teal-300 transition-all cursor-pointer shadow-2xs"
                    >
                      <Share2 className="w-4 h-4 text-teal-700" />
                      <span>Compartir Nota</span>
                    </button>
                  </div>

                </div>


              {/* Expanded Comments Box */}
              {openCommentFor === item.id && (
                <div className="pt-3 border-t border-slate-100 space-y-3 bg-slate-50/80 p-4 rounded-2xl">
                  <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Comentarios ({item.comments.length})
                  </h5>

                  {item.comments.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">
                      Sé el primero en dejar un comentario o pregunta.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {item.comments.map((c) => (
                        <div
                          key={c.id}
                          className="p-3 bg-white rounded-xl border border-slate-200 text-xs shadow-2xs"
                        >
                          <div className="flex items-center justify-between font-semibold text-slate-800 mb-1">
                            <span>{c.authorName}</span>
                            <span className="text-[10px] text-slate-400 font-normal">{c.date}</span>
                          </div>
                          <p className="text-slate-600 leading-normal">{c.text}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Comment Input */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Escribe un comentario o pregunta..."
                      value={commentInputs[item.id] || ''}
                      onChange={(e) =>
                        setCommentInputs({ ...commentInputs, [item.id]: e.target.value })
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCommentSubmit(item.id);
                      }}
                      className="flex-1 px-3.5 py-2.5 sm:py-2 bg-white text-sm sm:text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#38484c] text-slate-800"
                    />
                    <button
                      onClick={() => handleCommentSubmit(item.id)}
                      className="p-2.5 sm:p-2 bg-[#38484c] hover:bg-[#2c393c] active:bg-[#20292c] text-white rounded-xl text-xs font-semibold transition-colors shrink-0 cursor-pointer"
                      title="Publicar comentario"
                      aria-label="Publicar comentario"
                    >
                      <Send className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                    </button>
                  </div>
                </div>
              )}

            </div>
          </article>
        );
      })}
      </div>

      {/* Professional Share Modal */}
      <ShareModal
        isOpen={!!sharingAnnouncement}
        onClose={() => setSharingAnnouncement(null)}
        item={sharingAnnouncement}
        type="announcement"
      />

    </div>
  );
};
