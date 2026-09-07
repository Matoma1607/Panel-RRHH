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
  Globe,
  X,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Megaphone,
  FileText,
  Cake,
  Radio,
  ExternalLink
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
  setGlobalSearch?: (s: string) => void;
  highlightedId?: string | null;
  userName?: string;
  onSaveUserName?: (name: string) => void;
  onOpenProfileModal?: () => void;
  onLike: (id: string) => void;
  onAddComment?: (id: string, text: string, authorName?: string) => void;
  onComment?: (id: string, text: string, authorName?: string) => void;
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
  setGlobalSearch,
  highlightedId,
  userName,
  onSaveUserName,
  onOpenProfileModal,
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
  const [expandedCompactId, setExpandedCompactId] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [inlineCommentNames, setInlineCommentNames] = useState<Record<string, string>>({});
  const [nameErrorFor, setNameErrorFor] = useState<string | null>(null);
  const [sharingAnnouncement, setSharingAnnouncement] = useState<Announcement | null>(null);

  // Admin branch audit filter
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

  const effectiveFilter = (searchFilter || globalSearch || '').toLowerCase();

  // Effective branch for filtering
  const effectiveAuditedBranch = isAdminLoggedIn
    ? (adminBranchFilter === 'Todas' ? 'Todas' : (adminBranchFilter === 'Auditar' ? (userBranch || 'Todas') : adminBranchFilter))
    : userBranch;

  const filtered = announcements.filter((item) => {
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

  // Separate: First pinned (or first item) as primary card, and the rest as compact cards
  const pinnedAnnouncements = filtered.filter((item) => item.pinned);
  const unpinnedAnnouncements = filtered.filter((item) => !item.pinned);

  // The primary card will be the first pinned announcement, or the first unpinned if none are pinned
  const primaryAnnouncement = pinnedAnnouncements.length > 0
    ? pinnedAnnouncements[0]
    : (unpinnedAnnouncements.length > 0 ? unpinnedAnnouncements[0] : null);

  // The rest will be rendered as compact cards
  const compactAnnouncements = primaryAnnouncement
    ? [...pinnedAnnouncements.slice(1), ...unpinnedAnnouncements].filter((item) => item.id !== primaryAnnouncement.id)
    : [];

  const handleCommentSubmit = (id: string) => {
    const text = (commentInputs[id] || '').trim();
    if (!text) return;

    let authorName: string;
    if (isAdminLoggedIn || role === 'admin') {
      authorName = 'RRHH SOLMAR';
    } else {
      const explicitName = (inlineCommentNames[id] !== undefined ? inlineCommentNames[id] : (userName || '')).trim();
      if (!explicitName && !userName) {
        setNameErrorFor(id);
        return;
      }
      const effectiveName = explicitName || userName || 'Colaborador';
      if (onSaveUserName && explicitName && explicitName !== userName) {
        onSaveUserName(effectiveName);
      }
      authorName = userBranch ? `${effectiveName} (${userBranch})` : effectiveName;
    }

    if (handleCommentFn) {
      handleCommentFn(id, text, authorName);
      setCommentInputs((prev) => ({ ...prev, [id]: '' }));
      setNameErrorFor(null);
    }
  };

  // Helper for Category Tag Styles
  const getCategoryTheme = (cat: CategoryType) => {
    switch (cat) {
      case 'Urgente':
        return {
          badge: 'bg-[#c5622f]/10 text-[#c5622f] border-[#c5622f]/30',
          chipActive: 'bg-[#c5622f] text-white border-[#c5622f]',
          icon: AlertCircle,
          iconColor: 'text-[#c5622f]',
          bgIcon: 'bg-[#c5622f]/10',
        };
      case 'Eventos':
        return {
          badge: 'bg-[#a98a3f]/10 text-[#a98a3f] border-[#a98a3f]/30',
          chipActive: 'bg-[#a98a3f] text-white border-[#a98a3f]',
          icon: Cake,
          iconColor: 'text-[#a98a3f]',
          bgIcon: 'bg-[#a98a3f]/10',
        };
      case 'Políticas':
        return {
          badge: 'bg-blue-50 text-blue-700 border-blue-200',
          chipActive: 'bg-blue-800 text-white border-blue-800',
          icon: FileText,
          iconColor: 'text-blue-700',
          bgIcon: 'bg-blue-50',
        };
      case 'General':
      default:
        return {
          badge: 'bg-[#1c3d34]/10 text-[#1c3d34] border-[#1c3d34]/30',
          chipActive: 'bg-[#0f2620] text-white border-[#0f2620]',
          icon: Radio,
          iconColor: 'text-[#1c3d34]',
          bgIcon: 'bg-[#1c3d34]/10',
        };
    }
  };

  // Helper to extract bullet points from text
  const extractBulletPoints = (text: string) => {
    const lines = text.split('\n');
    const bullets: string[] = [];
    const regularLines: string[] = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*') || /^\d+\./.test(trimmed)) {
        bullets.push(trimmed.replace(/^[•\-*]\s*|^\d+\.\s*/, ''));
      } else if (trimmed) {
        regularLines.push(trimmed);
      }
    });

    return {
      bullets,
      mainText: regularLines.join('\n\n')
    };
  };

  // Spanish formatted date
  const todayFormatted = new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <div className="space-y-3.5">
      
      {/* 1. Banner Compacto de Sucursal Asignada (En una sola línea horizontal) */}
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

      {/* Admin Audit Selector (Si es admin) */}
      {isAdminLoggedIn && (
        <div className="bg-white px-3.5 py-2 rounded-lg border border-[#dbe2dc] flex items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2 min-w-0">
            <Building2 className="w-3.5 h-3.5 text-[#1c3d34] shrink-0" />
            <span className="text-xs font-bold text-[#0f2620] truncate">
              Auditoría RRHH:
            </span>
            <span className="text-[11px] text-slate-500 truncate hidden sm:inline">
              {effectiveAuditedBranch === 'Todas'
                ? 'Viendo todas las sedes'
                : `Simulando vista de ${effectiveAuditedBranch}`}
            </span>
          </div>
          <select
            value={adminBranchFilter === 'Auditar' ? (userBranch || 'Todas') : adminBranchFilter}
            onChange={(e) => setAdminBranchFilter(e.target.value as any)}
            className="px-2.5 py-1 bg-[#eef1ee] border border-[#dbe2dc] rounded-md text-xs font-bold text-[#0f2620] focus:outline-none cursor-pointer"
          >
            <option value="Todas">🌐 Todas las Sucursales</option>
            {ALL_BRANCHES.map((b) => (
              <option key={b} value={b}>
                📍 {b} {userBranch === b ? '(Asignada)' : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 2. Saludo "¡Hola de nuevo!" + Fecha del día y Contador de novedades */}
      <div className="bg-white rounded-lg border border-[#dbe2dc] p-3.5 sm:p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-[#0f2620] tracking-tight">
              ¡Hola de nuevo{userName ? `, ${userName}` : ''}!
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1c3d34]/10 text-[#1c3d34] border border-[#1c3d34]/20">
              {filtered.length} {filtered.length === 1 ? 'comunicado' : 'comunicados'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {capitalize(todayFormatted)} • Tienes novedades oficiales de la empresa para hoy.
          </p>
        </div>

        {canPublish && (
          <button
            type="button"
            onClick={handleNewAnnouncementFn}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#0f2620] hover:bg-[#1c3d34] text-white font-bold text-xs rounded-md shadow-2xs transition-colors shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nuevo Comunicado</span>
          </button>
        )}
      </div>

      {/* 3. Fila de Filtros Tipo Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.value;
          const theme = cat.value !== 'Todos' ? getCategoryTheme(cat.value) : null;

          let activeClass = 'bg-[#0f2620] text-white border-[#0f2620]';
          if (isSelected && theme) {
            activeClass = theme.chipActive;
          }

          return (
            <button
              key={cat.value}
              type="button"
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                isSelected
                  ? `${activeClass} shadow-2xs`
                  : 'bg-white text-slate-700 border-[#dbe2dc] hover:bg-[#eef1ee]'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Banner de Búsqueda activa (si existe término) */}
      {effectiveFilter && (
        <div className="flex items-center justify-between px-3 py-2 bg-[#1c3d34]/10 border border-[#1c3d34]/20 rounded-md text-xs text-[#0f2620]">
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-[#1c3d34]" />
            <span>
              Filtrando por: <strong>"{globalSearch || searchFilter}"</strong> ({filtered.length} resultados)
            </span>
          </div>
          {setGlobalSearch && (
            <button
              type="button"
              onClick={() => setGlobalSearch('')}
              className="text-[11px] font-bold text-[#1c3d34] hover:underline cursor-pointer"
            >
              Quitar filtro
            </button>
          )}
        </div>
      )}

      {/* Estado Vacío */}
      {filtered.length === 0 && (
        <div className="p-8 text-center bg-white rounded-lg border border-[#dbe2dc] shadow-2xs">
          <p className="text-sm font-bold text-[#0f2620]">No hay comunicados para mostrar</p>
          <p className="text-xs text-slate-500 mt-1">
            {effectiveFilter ? 'Prueba borrando la búsqueda.' : 'No hay publicaciones en esta categoría.'}
          </p>
        </div>
      )}

      {/* 4. FEED DE NOVEDADES: 
          - Tarjeta Principal Completa (Fijada)
          - Seguido de 2-3 Tarjetas Compactas en una sola línea
      */}
      {primaryAnnouncement && (
        <div className="space-y-3">
          
          {/* ======================================================== */}
          {/* TARJETA PRINCIPAL COMPLETA (Fijada / Destacada)          */}
          {/* ======================================================== */}
          {(() => {
            const item = primaryAnnouncement;
            const theme = getCategoryTheme(item.category);
            const { bullets, mainText } = extractBulletPoints(item.content);
            const isHighlighted = highlightedId === item.id;

            return (
              <article
                id={`announcement-${item.id}`}
                className={`bg-white rounded-lg border transition-all shadow-2xs overflow-hidden ${
                  isHighlighted
                    ? 'border-[#1c3d34] ring-2 ring-[#1c3d34]/20'
                    : 'border-[#dbe2dc]'
                }`}
              >
                {/* Accent top line */}
                <div className={`w-full h-1 ${item.category === 'Urgente' ? 'bg-[#c5622f]' : (item.category === 'Eventos' ? 'bg-[#a98a3f]' : 'bg-[#0f2620]')}`} />

                <div className="p-4 sm:p-5 space-y-3">
                  
                  {/* Top Header: Tag de categoría + Fijado + Metadatos */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold border uppercase ${theme.badge}`}>
                        {item.category}
                      </span>

                      {item.pinned && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#eef1ee] text-[#0f2620] border border-[#dbe2dc] flex items-center gap-1">
                          <Pin className="w-2.5 h-2.5 fill-[#0f2620]" />
                          <span>Fijado</span>
                        </span>
                      )}

                      {item.targetBranch && item.targetBranch !== 'Todas' && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#eef1ee] text-[#1c3d34] border border-[#dbe2dc] flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5" />
                          <span>{item.targetBranch.replace('Solmar ', '')}</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                      <span>{item.date}</span>
                      {canPublish && (
                        <div className="flex items-center gap-1 pl-2 border-l border-slate-200">
                          <button
                            type="button"
                            onClick={() => onEditAnnouncement?.(item)}
                            className="p-1 text-slate-400 hover:text-[#0f2620] transition-colors cursor-pointer"
                            title="Editar comunicado"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteAnnouncement?.(item.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Eliminar comunicado"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Título Principal */}
                  <h3 className="text-lg sm:text-xl font-bold text-[#0f2620] leading-snug">
                    {item.title}
                  </h3>

                  {/* Texto principal */}
                  <div className="text-slate-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                    {mainText}
                  </div>

                  {/* Lista de Puntos Importantes (Viñetas Limpias) */}
                  {bullets.length > 0 && (
                    <div className="p-3 bg-[#eef1ee] rounded-md border border-[#dbe2dc] space-y-1.5 my-2">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#0f2620]">
                        Puntos importantes:
                      </p>
                      <ul className="space-y-1">
                        {bullets.map((point, idx) => (
                          <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                            <span className="text-[#1c3d34] font-bold text-sm leading-none">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Imagen opcional si existe */}
                  {item.imageUrl && (
                    <div className="rounded-md overflow-hidden border border-[#dbe2dc] max-h-72 bg-slate-100 mt-2">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover max-h-72"
                        loading="lazy"
                      />
                    </div>
                  )}

                  {/* Barra de Reacciones, Comentarios y Compartir */}
                  <div className="pt-3 border-t border-[#dbe2dc] flex items-center justify-between gap-2 flex-wrap text-xs">
                    <span className="text-slate-500 text-[11px]">
                      Por: <strong className="text-[#0f2620]">{item.author}</strong>
                    </span>

                    <div className="flex items-center gap-1.5">
                      {/* Like */}
                      <button
                        type="button"
                        onClick={() => onLike(item.id)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer border ${
                          item.likedBySession
                            ? 'bg-rose-50 text-rose-600 border-rose-200'
                            : 'bg-white hover:bg-[#eef1ee] text-slate-600 border-[#dbe2dc]'
                        }`}
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${
                            item.likedBySession ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
                          }`}
                        />
                        <span>{item.likes}</span>
                      </button>

                      {/* Comentarios */}
                      <button
                        type="button"
                        onClick={() =>
                          setOpenCommentFor(openCommentFor === item.id ? null : item.id)
                        }
                        className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-slate-600 hover:bg-[#eef1ee] bg-white border border-[#dbe2dc] transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.comments.length}</span>
                        <span className="hidden sm:inline">comentarios</span>
                      </button>

                      {/* Compartir */}
                      <button
                        type="button"
                        onClick={() => setSharingAnnouncement(item)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold text-[#1c3d34] bg-[#1c3d34]/10 hover:bg-[#1c3d34]/20 border border-[#1c3d34]/30 transition-colors cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Compartir</span>
                      </button>
                    </div>
                  </div>

                  {/* Sección Expandida de Comentarios */}
                  {openCommentFor === item.id && (
                    <div className="pt-3 border-t border-[#dbe2dc] space-y-2.5 bg-[#eef1ee]/60 p-3 rounded-md">
                      <h4 className="text-[11px] font-bold text-[#0f2620] uppercase tracking-wider">
                        Comentarios ({item.comments.length})
                      </h4>

                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {item.comments.length === 0 ? (
                          <p className="text-xs text-slate-400 italic py-1">
                            Sé el primero en comentar este comunicado.
                          </p>
                        ) : (
                          item.comments.map((c) => (
                            <div key={c.id} className="p-2 bg-white rounded border border-[#dbe2dc] text-xs">
                              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                                <strong className="text-[#0f2620] font-semibold">{c.authorName}</strong>
                                <span>{c.date}</span>
                              </div>
                              <p className="text-slate-700">{c.text}</p>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Input de Comentario */}
                      <div className="flex gap-2 pt-1">
                        <input
                          type="text"
                          value={commentInputs[item.id] || ''}
                          onChange={(e) =>
                            setCommentInputs((prev) => ({ ...prev, [item.id]: e.target.value }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCommentSubmit(item.id);
                          }}
                          placeholder={
                            userName
                              ? `Comentar como ${userName}...`
                              : 'Escribe tu comentario...'
                          }
                          className="flex-1 px-3 py-1.5 bg-white text-xs rounded border border-[#dbe2dc] focus:border-[#1c3d34] focus:outline-none text-slate-800"
                        />
                        <button
                          type="button"
                          onClick={() => handleCommentSubmit(item.id)}
                          className="px-3 py-1.5 bg-[#0f2620] hover:bg-[#1c3d34] text-white text-xs font-bold rounded cursor-pointer transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {nameErrorFor === item.id && (
                        <p className="text-[10px] text-rose-600">
                          Por favor configura tu nombre antes de comentar.
                        </p>
                      )}
                    </div>
                  )}

                </div>
              </article>
            );
          })()}

          {/* ======================================================== */}
          {/* 2-3 TARJETAS COMPACTAS EN UNA SOLA LÍNEA HORIZONTAL       */}
          {/* ======================================================== */}
          {compactAnnouncements.length > 0 && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-bold text-[#0f2620]/70 uppercase tracking-wider">
                  Otros Comunicados
                </span>
                <span className="text-[10px] text-slate-500">
                  {compactAnnouncements.length} {compactAnnouncements.length === 1 ? 'publicación compacta' : 'publicaciones compactas'}
                </span>
              </div>

              {compactAnnouncements.map((item) => {
                const theme = getCategoryTheme(item.category);
                const IconComponent = theme.icon;
                const isExpanded = expandedCompactId === item.id;

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg border border-[#dbe2dc] overflow-hidden shadow-2xs transition-colors"
                  >
                    {/* Fila en una sola línea horizontal */}
                    <div className="px-3.5 py-2.5 flex items-center justify-between gap-3 hover:bg-[#eef1ee]/40 transition-colors">
                      
                      {/* Left: Ícono + Título + Metadatos */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={`w-7 h-7 rounded-md ${theme.bgIcon} ${theme.iconColor} flex items-center justify-center shrink-0`}>
                          <IconComponent className="w-3.5 h-3.5" />
                        </div>

                        <div className="min-w-0 flex-1 flex items-center gap-2 flex-wrap sm:flex-nowrap">
                          <p
                            onClick={() => setExpandedCompactId(isExpanded ? null : item.id)}
                            className="text-xs sm:text-sm font-bold text-[#0f2620] truncate cursor-pointer hover:underline"
                            title={item.title}
                          >
                            {item.title}
                          </p>

                          <div className="flex items-center gap-1.5 shrink-0 text-[10px]">
                            <span className={`px-1.5 py-0.2 rounded font-bold uppercase border ${theme.badge}`}>
                              {item.category}
                            </span>
                            <span className="text-slate-400">• {item.date}</span>
                            {item.targetBranch && item.targetBranch !== 'Todas' && (
                              <span className="text-slate-500 hidden md:inline">
                                • {item.targetBranch.replace('Solmar ', '')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Acción / Expandir */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {canPublish && (
                          <div className="flex items-center gap-1 pr-1.5 border-r border-[#dbe2dc]">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditAnnouncement?.(item);
                              }}
                              className="p-1 text-slate-400 hover:text-[#0f2620] transition-colors cursor-pointer"
                              title="Editar comunicado"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteAnnouncement?.(item.id);
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Eliminar comunicado"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => setExpandedCompactId(isExpanded ? null : item.id)}
                          className="px-2.5 py-1 rounded text-[11px] font-bold text-[#1c3d34] hover:bg-[#eef1ee] border border-transparent hover:border-[#dbe2dc] transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <span>{isExpanded ? 'Ocultar' : 'Leer'}</span>
                          {isExpanded ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </button>
                      </div>

                    </div>

                    {/* Vista Expandida Inline al presionar "Leer" */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-2 border-t border-[#dbe2dc]/70 bg-[#eef1ee]/30 space-y-3 text-xs animate-in fade-in">
                        <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                          {item.content}
                        </p>

                        <div className="flex items-center justify-between pt-2 border-t border-[#dbe2dc] text-[11px]">
                          <span className="text-slate-500">
                            Por: <strong className="text-[#0f2620]">{item.author}</strong>
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => onLike(item.id)}
                              className="flex items-center gap-1 text-slate-600 hover:text-rose-600 cursor-pointer"
                            >
                              <Heart className="w-3 h-3" />
                              <span>{item.likes}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setSharingAnnouncement(item)}
                              className="flex items-center gap-1 text-[#1c3d34] font-bold hover:underline cursor-pointer"
                            >
                              <Share2 className="w-3 h-3" />
                              <span>Compartir</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* Modal de Compartir */}
      {sharingAnnouncement && (
        <ShareModal
          isOpen={true}
          onClose={() => setSharingAnnouncement(null)}
          item={sharingAnnouncement}
          type="announcement"
        />
      )}

    </div>
  );
};
