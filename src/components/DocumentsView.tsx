import React, { useState, useEffect } from 'react';
import { DocumentItem, UserRole, BranchName, ALL_BRANCHES } from '../types';
import {
  FileText,
  Search,
  Download,
  Eye,
  Plus,
  Trash2,
  Edit3,
  FileSpreadsheet,
  FileCode,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  Filter,
  Check,
  Share2,
  ExternalLink,
  Paperclip,
  Building2,
  Globe,
  Lock,
  MapPin,
  Info
} from 'lucide-react';
import { ShareModal } from './modals/ShareModal';

interface DocumentsViewProps {
  documents: DocumentItem[];
  role: UserRole;
  canPublish?: boolean;
  isAdminLoggedIn?: boolean;
  userBranch?: BranchName;
  setUserBranch?: (branch: BranchName) => void;
  isDirectBranchLink?: boolean;
  searchFilter?: string;
  globalSearch?: string;
  highlightedId?: string | null;
  onNewDocument?: () => void;
  onOpenNewModal?: () => void;
  onEditDocument: (document: DocumentItem) => void;
  onDeleteDocument: (id: string) => void;
  onDownloadIncrement?: (id: string) => void;
  onDownload?: (id: string) => void;
}

const CATEGORIES = ['Todos', 'Reglamentos', 'Políticas', 'Formularios', 'Guías', 'Beneficios', 'Recibos'];

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  documents,
  role,
  canPublish = role === 'admin',
  isAdminLoggedIn = false,
  userBranch: externalUserBranch,
  setUserBranch: externalSetUserBranch,
  isDirectBranchLink = false,
  searchFilter,
  globalSearch,
  highlightedId,
  onNewDocument,
  onOpenNewModal,
  onEditDocument,
  onDeleteDocument,
  onDownloadIncrement,
  onDownload,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [downloadSuccessToast, setDownloadSuccessToast] = useState<string | null>(null);
  const [sharingDocument, setSharingDocument] = useState<DocumentItem | null>(null);

  // Branch filter state (persisted for employee)
  const [localUserBranch, setLocalUserBranch] = useState<BranchName>(() => {
    const saved = localStorage.getItem('solmar_user_branch') as BranchName;
    if (saved && ALL_BRANCHES.includes(saved)) {
      return saved;
    }
    return 'Solmar Alem';
  });

  const userBranch = externalUserBranch || localUserBranch;

  // Admin filter allows viewing "Todas" or specific branch
  const [adminBranchFilter, setAdminBranchFilter] = useState<'Todas' | BranchName>('Todas');

  const handleBranchChange = (branch: BranchName) => {
    if (externalSetUserBranch) {
      externalSetUserBranch(branch);
    } else {
      setLocalUserBranch(branch);
    }
    localStorage.setItem('solmar_user_branch', branch);
  };

  const handleNewDocumentFn = onNewDocument || onOpenNewModal || (() => {});
  const handleDownloadIncrementFn = onDownloadIncrement || onDownload || (() => {});

  useEffect(() => {
    if (highlightedId) {
      const match = documents.find((d) => d.id === highlightedId);
      if (match) {
        setPreviewDoc(match);
      }
    }
  }, [highlightedId, documents]);

  const handleTriggerShare = (doc: DocumentItem) => {
    setSharingDocument(doc);
  };

  const effectiveFilter = (searchFilter || globalSearch || '').toLowerCase();

  // Strict Branch Visibility Filtering
  const filtered = documents.filter((doc) => {
    // 1. Category check
    const matchesCat = selectedCategory === 'Todos' || doc.category === selectedCategory;

    // 2. Search check
    const matchesSearch =
      !effectiveFilter ||
      (doc.title || '').toLowerCase().includes(effectiveFilter) ||
      (doc.description || '').toLowerCase().includes(effectiveFilter) ||
      (doc.category || '').toLowerCase().includes(effectiveFilter) ||
      (doc.targetBranch || '').toLowerCase().includes(effectiveFilter);

    // 3. Branch Visibility Check:
    let matchesBranch = true;
    if (isAdminLoggedIn) {
      // If admin, check admin filter selection
      if (adminBranchFilter !== 'Todas') {
        matchesBranch = !doc.targetBranch || doc.targetBranch === 'Todas' || doc.targetBranch === adminBranchFilter;
      }
    } else {
      // Strict rule for employees:
      // Can ONLY see documents where targetBranch is 'Todas', undefined/empty, or matches their assigned branch!
      matchesBranch = !doc.targetBranch || doc.targetBranch === 'Todas' || doc.targetBranch === userBranch;
    }

    return matchesCat && matchesSearch && matchesBranch;
  });

  const handleDownloadFile = (doc: DocumentItem) => {
    handleDownloadIncrementFn(doc.id);

    // If there is an actual uploaded Data URL or URL, download it directly
    if (doc.fileData || doc.fileUrl) {
      const link = document.createElement('a');
      link.href = doc.fileData || doc.fileUrl!;
      link.download = doc.fileName || doc.title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Generate clean standard document fallback file
      let mimeType = 'text/plain;charset=utf-8';
      let extension = 'txt';
      if (doc.fileType === 'PDF') {
        mimeType = 'application/pdf';
        extension = 'pdf';
      } else if (doc.fileType === 'DOCX') {
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        extension = 'docx';
      } else if (doc.fileType === 'XLSX') {
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        extension = 'xlsx';
      }

      const blobContent = `DOCUMENTO OFICIAL DE RRHH - ${doc.title}
Empresa: SOLMAR
Sucursal de Destino: ${doc.targetBranch || 'Todas las sucursales'}
Categoría: ${doc.category}
Fecha de última actualización: ${doc.updatedDate}
Tipo de Formato: ${doc.fileType}

DESCRIPCIÓN:
${doc.description}

CONTENIDO DEL DOCUMENTO:
${doc.contentSnippet || 'Documento oficial verificado para consulta y descarga del personal.'}

----------------------------------------------------
Descargado desde el Portal de RRHH Interno de la Empresa SOLMAR.
`;

      const blob = new Blob([blobContent], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const cleanTitle = doc.title.toLowerCase().endsWith(`.${extension}`)
        ? doc.title
        : `${doc.title}.${extension}`;

      link.download = cleanTitle;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }

    setDownloadSuccessToast(`Descargando ${doc.title}...`);
    setTimeout(() => setDownloadSuccessToast(null), 3500);
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'XLSX':
        return <FileSpreadsheet className="w-6 h-6 text-emerald-600" />;
      case 'DOCX':
        return <FileCode className="w-6 h-6 text-blue-600" />;
      default:
        return <FileText className="w-6 h-6 text-red-600" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {downloadSuccessToast && (
        <div className="fixed bottom-20 md:bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-medium">{downloadSuccessToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <span>📄 Biblioteca de Documentos y Políticas</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Descargá y consultá reglamentos, formularios oficiales, políticas corporativas y guías en PDF o Word.
          </p>
        </div>

        {canPublish && (
          <button
            onClick={handleNewDocumentFn}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#38484c] hover:bg-[#2c393c] text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Subir Documento</span>
          </button>
        )}
      </div>

      {/* Branch Selector Banner / Tooling */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center shrink-0 border border-teal-200">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-900">
                {isAdminLoggedIn ? 'Filtro de Sucursal (Vista Administrador)' : 'Mi Sucursal de Trabajo'}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100/70 text-teal-900 border border-teal-300">
                Privacidad Activa
              </span>
              {isDirectBranchLink && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-700" />
                  Acceso Directo
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              {isAdminLoggedIn 
                ? 'Puedes filtrar la visualización para auditar qué ve cada sucursal o ver todo el repositorio.' 
                : `Solo se muestran documentos oficiales asignados a ${userBranch} o públicos para toda la empresa.`}
            </p>
          </div>
        </div>

        {/* Dropdown Selector / Lock indicator */}
        <div className="flex items-center gap-2 shrink-0">
          {isAdminLoggedIn ? (
            <>
              <label className="text-xs font-bold text-slate-600 hidden sm:block whitespace-nowrap">
                Filtrar vista por sucursal:
              </label>
              <select
                value={adminBranchFilter}
                onChange={(e) => setAdminBranchFilter(e.target.value as any)}
                className="px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-teal-700 cursor-pointer shadow-2xs"
              >
                <option value="Todas">🌐 Todas las Sucursales (Ver Repositorio Completo)</option>
                {ALL_BRANCHES.map((branch) => (
                  <option key={branch} value={branch}>
                    📍 {branch}
                  </option>
                ))}
              </select>
            </>
          ) : (
            <div className="flex items-center gap-2 px-3.5 py-2 bg-teal-50 border border-teal-200 rounded-xl text-xs font-bold text-teal-950 shadow-2xs select-none">
              <Lock className="w-3.5 h-3.5 text-teal-700 shrink-0" />
              <span>📍 {userBranch}</span>
            </div>
          )}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <Filter className="w-4 h-4 text-slate-400 shrink-0 ml-1 hidden sm:block" />
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[#38484c] text-white border-[#38484c] shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">
            No se encontraron documentos para {isAdminLoggedIn && adminBranchFilter !== 'Todas' ? adminBranchFilter : userBranch}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {canPublish 
              ? 'Puedes subir un nuevo archivo en PDF, Word o Excel y asignar la visibilidad para esta sucursal o para todas.' 
              : 'No hay documentos asignados a esta categoría o sucursal en este momento.'}
          </p>
          {canPublish && (
            <button
              onClick={handleNewDocumentFn}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#38484c] hover:bg-[#2c393c] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Subir documento ahora</span>
            </button>
          )}
        </div>
      )}

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((doc) => {
          const isTargeted = doc.targetBranch && doc.targetBranch !== 'Todas';

          return (
            <div
              key={doc.id}
              className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between relative"
            >
              <div>
                {/* Header: Icon, Category Badge, Branch Pill & Admin Controls */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                      {getFileIcon(doc.fileType)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#a6b2b1]/20 text-[#38484c] border border-[#a6b2b1]/50">
                          {doc.category}
                        </span>

                        {isTargeted ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            <Lock className="w-2.5 h-2.5 text-amber-700" />
                            <span>Solo {doc.targetBranch}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                            <Globe className="w-2.5 h-2.5 text-teal-700" />
                            <span>Todas las sucursales</span>
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-slate-900 text-sm leading-snug">
                        {doc.title}
                      </h3>
                    </div>
                  </div>

                  {canPublish && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => onEditDocument(doc)}
                        className="p-1.5 text-slate-400 hover:text-[#38484c] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Editar documento"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteDocument(doc.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Eliminar documento"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 mb-4">
                  {doc.description}
                </p>
              </div>

              {/* Footer Metadata & Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-3 font-medium">
                  <span className="font-semibold text-slate-600">{doc.fileType}</span>
                  <span>•</span>
                  <span>{doc.fileSize}</span>
                  <span>•</span>
                  <span>Act. {doc.updatedDate}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleTriggerShare(doc)}
                    title="Compartir ficha del documento"
                    className="p-1.5 rounded-xl transition-all cursor-pointer border border-teal-200 text-teal-800 bg-teal-50 hover:bg-teal-100 hover:border-teal-300 shadow-2xs"
                  >
                    <Share2 className="w-3.5 h-3.5 text-teal-700" />
                  </button>

                  <button
                    onClick={() => setPreviewDoc(doc)}
                    className="px-3 py-1.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>Ver</span>
                  </button>

                  <button
                    onClick={() => handleDownloadFile(doc)}
                    className="px-3.5 py-1.5 text-white bg-[#38484c] hover:bg-[#2c393c] rounded-xl font-semibold text-xs transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Document Preview / Reading Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-3xl rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 p-4 sm:p-6 relative max-h-[92dvh] sm:max-h-[90vh] flex flex-col justify-between overflow-y-auto">
            <button
              onClick={() => setPreviewDoc(null)}
              className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Cerrar modal"
            >
              ✕
            </button>

            <div>
              <div className="flex items-start sm:items-center gap-3 mb-3 sm:mb-4 pr-8">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
                  {getFileIcon(previewDoc.fileType)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <span className="text-[10px] font-bold bg-[#a6b2b1]/20 text-[#38484c] px-2.5 py-0.5 rounded-full border border-[#a6b2b1]/50">
                      {previewDoc.category}
                    </span>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full">
                      Formato {previewDoc.fileType} ({previewDoc.fileSize})
                    </span>
                    {previewDoc.targetBranch && previewDoc.targetBranch !== 'Todas' ? (
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5 text-amber-700" />
                        <span>Exclusivo: {previewDoc.targetBranch}</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold bg-teal-50 text-teal-800 px-2.5 py-0.5 rounded-full border border-teal-200 flex items-center gap-1">
                        <Globe className="w-2.5 h-2.5 text-teal-700" />
                        <span>Visible para todas las sucursales</span>
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-slate-900 text-base sm:text-lg leading-snug mt-1">
                    {previewDoc.title}
                  </h3>
                </div>
              </div>

              <p className="text-xs text-slate-600 mb-3 sm:mb-4 leading-relaxed">{previewDoc.description}</p>

              {/* Document Interactive Viewer or Content Box */}
              {previewDoc.fileData && previewDoc.fileType === 'PDF' ? (
                <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 h-64 sm:h-96">
                  <iframe
                    src={previewDoc.fileData}
                    title={previewDoc.title}
                    className="w-full h-full border-0"
                  />
                </div>
              ) : (
                <div className="p-3.5 sm:p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-800 space-y-2 max-h-56 sm:max-h-72 overflow-y-auto leading-relaxed">
                  <div className="text-slate-400 font-sans font-bold text-[10px] sm:text-[11px] border-b border-slate-200 pb-1 mb-2 flex items-center justify-between">
                    <span>VISTA PREVIA Y CONTENIDO DE LECTURA</span>
                    <span className="text-[10px] text-slate-400">Actualizado: {previewDoc.updatedDate}</span>
                  </div>
                  <p className="whitespace-pre-line font-sans text-slate-700">
                    {previewDoc.contentSnippet || previewDoc.description || 'Documento oficial verificado para consulta del personal.'}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-[11px] sm:text-xs text-slate-400 text-center sm:text-left">
                Descargado <strong className="text-slate-600">{previewDoc.downloadCount}</strong> veces por colaboradores
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-200 transition-colors cursor-pointer text-center"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    handleDownloadFile(previewDoc);
                    setPreviewDoc(null);
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-[#38484c] text-white font-semibold text-xs rounded-xl hover:bg-[#2c393c] flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar Archivo ({previewDoc.fileType})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Professional Share Modal */}
      <ShareModal
        isOpen={!!sharingDocument}
        onClose={() => setSharingDocument(null)}
        item={sharingDocument}
        type="document"
      />

    </div>
  );
};
