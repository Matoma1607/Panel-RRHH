import React, { useState } from 'react';
import { CompanyInfo, Announcement, DocumentItem, CelebrationItem } from '../types';
import {
  Newspaper,
  FileText,
  Cake,
  Plus,
  ShieldCheck,
  Check,
  Edit2,
  Edit3,
  Trash2,
  MessageSquare,
  Send,
  Pin
} from 'lucide-react';

interface AdminDashboardProps {
  companyInfo: CompanyInfo;
  announcements: Announcement[];
  documents: DocumentItem[];
  celebrations?: CelebrationItem[];
  canPublish?: boolean;
  onUpdateCompanyInfo: (info: CompanyInfo) => void;
  onNavigateTab: (tab: string) => void;
  onNewAnnouncement: () => void;
  onEditAnnouncement?: (announcement: Announcement) => void;
  onDeleteAnnouncement?: (id: string) => void;
  onAddComment?: (id: string, text: string) => void;
  onNewDocument: () => void;
  onNewCelebration?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  companyInfo,
  announcements,
  documents,
  celebrations = [],
  canPublish = true,
  onUpdateCompanyInfo,
  onNavigateTab,
  onNewAnnouncement,
  onEditAnnouncement,
  onDeleteAnnouncement,
  onAddComment,
  onNewDocument,
  onNewCelebration,
}) => {
  const [editingCompany, setEditingCompany] = useState(false);
  const [formCompany, setFormCompany] = useState<CompanyInfo>(companyInfo);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Admin comments state inside dashboard
  const [openCommentsAnnId, setOpenCommentsAnnId] = useState<string | null>(null);
  const [adminCommentInputs, setAdminCommentInputs] = useState<Record<string, string>>({});

  const handleAdminCommentSubmit = (annId: string) => {
    const text = adminCommentInputs[annId] || '';
    if (text.trim() && onAddComment) {
      onAddComment(annId, text.trim());
      setAdminCommentInputs((prev) => ({ ...prev, [annId]: '' }));
    }
  };

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCompanyInfo(formCompany);
    setEditingCompany(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-[#232f32] text-white rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md border border-white/20 text-emerald-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Panel de Control RRHH</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Gestión Interna de {companyInfo.name}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Administra comunicados y novedades, bibliotecas de documentos corporativos en PDF y festejos del equipo.
          </p>
        </div>
      </div>

      {/* High Level Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => onNavigateTab('feed')}
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:border-teal-700/40 cursor-pointer transition-all"
        >
          <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center mb-3">
            <Newspaper className="w-5 h-5" />
          </div>
          <span className="text-2xl font-black text-slate-900">{announcements.length}</span>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">Comunicados Publicados</p>
        </div>

        <div
          onClick={() => onNavigateTab('documents')}
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:border-teal-700/40 cursor-pointer transition-all"
        >
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
            <FileText className="w-5 h-5" />
          </div>
          <span className="text-2xl font-black text-slate-900">{documents.length}</span>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">Documentos Disponibles</p>
        </div>

        <div
          onClick={() => onNavigateTab('celebrations')}
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:border-teal-700/40 cursor-pointer transition-all"
        >
          <div className="w-10 h-10 rounded-2xl bg-pink-50 text-pink-700 flex items-center justify-center mb-3">
            <Cake className="w-5 h-5" />
          </div>
          <span className="text-2xl font-black text-slate-900">{celebrations.length}</span>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">Festejos y Aniversarios</p>
        </div>
      </div>

      {/* Action Shortcuts Grid */}
      {canPublish && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
            <span>⚡ Acciones Rápidas de Administración</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={onNewAnnouncement}
              className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200/80 text-left transition-colors flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-800 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-slate-900 text-xs block">Publicar Comunicado</span>
                <span className="text-[11px] text-slate-500">Nuevo aviso en cartelera</span>
              </div>
            </button>

            <button
              onClick={onNewDocument}
              className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200/80 text-left transition-colors flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-slate-900 text-xs block">Subir Documento</span>
                <span className="text-[11px] text-slate-500">Archivos PDF o manuales</span>
              </div>
            </button>

            {onNewCelebration && (
              <button
                onClick={onNewCelebration}
                className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200/80 text-left transition-colors flex items-center gap-3 cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-pink-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 text-xs block">Agregar a Festejos</span>
                  <span className="text-[11px] text-slate-500">Cumpleaños o aniversarios</span>
                </div>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Announcements & Comments RRHH Management Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#232f32] text-white flex items-center justify-center font-bold">
              <Newspaper className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                📰 Gestión de Comunicados y Novedades
              </h3>
              <p className="text-xs text-slate-500">
                Publica avisos oficiales y modera comentarios en tiempo real.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onNewAnnouncement}
              className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Publicar Comunicado</span>
            </button>
          </div>
        </div>

        {announcements.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100">
            <Newspaper className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">No hay comunicados publicados aún.</p>
            <button
              onClick={onNewAnnouncement}
              className="mt-3 px-3 py-1.5 bg-teal-800 text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Crear primer comunicado
            </button>
          </div>
        ) : (
          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {announcements.map((ann) => {
              const isCommentsOpen = openCommentsAnnId === ann.id;
              const commentsList = ann.comments || [];

              return (
                <div
                  key={ann.id}
                  className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3 hover:border-slate-300 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-50 text-teal-800 border border-teal-200">
                          {ann.category}
                        </span>
                        {ann.pinned && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                            <Pin className="w-2.5 h-2.5 fill-amber-700 text-amber-700" />
                            <span>FIJADO</span>
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400 font-medium">{ann.date}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">{ann.title}</h4>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{ann.content}</p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {onEditAnnouncement && (
                        <button
                          onClick={() => onEditAnnouncement(ann)}
                          title="Editar comunicado"
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}
                      {onDeleteAnnouncement && (
                        <button
                          onClick={() => onDeleteAnnouncement(ann.id)}
                          title="Eliminar comunicado"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Comments Toggle & List */}
                  <div className="pt-2 border-t border-slate-200/60 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setOpenCommentsAnnId(isCommentsOpen ? null : ann.id)}
                        className="text-xs font-semibold text-teal-800 hover:underline flex items-center gap-1.5 cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>
                          {commentsList.length === 0
                            ? '0 Comentarios — Responder como RRHH'
                            : `${commentsList.length} Comentario${commentsList.length > 1 ? 's' : ''}`}
                        </span>
                      </button>
                    </div>

                    {isCommentsOpen && (
                      <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2.5">
                        {commentsList.length > 0 && (
                          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                            {commentsList.map((c) => (
                              <div key={c.id} className="p-2.5 bg-slate-50 rounded-lg text-xs border border-slate-100">
                                <div className="flex items-center justify-between font-bold text-slate-800 mb-0.5">
                                  <span>{c.authorName}</span>
                                  <span className="text-[10px] text-slate-400 font-normal">{c.date}</span>
                                </div>
                                <p className="text-slate-600">{c.text}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Admin Add Comment Form */}
                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="text"
                            placeholder="Escribe una respuesta oficial como RRHH..."
                            value={adminCommentInputs[ann.id] || ''}
                            onChange={(e) =>
                              setAdminCommentInputs({ ...adminCommentInputs, [ann.id]: e.target.value })
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAdminCommentSubmit(ann.id);
                            }}
                            className="flex-1 px-3 py-1.5 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-700 text-slate-900"
                          />
                          <button
                            onClick={() => handleAdminCommentSubmit(ann.id)}
                            className="px-3 py-1.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Enviar</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Company Brand Settings Form */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              🏢 Configuración Institucional de la Empresa
            </h3>
            <p className="text-xs text-slate-500">
              Personaliza el nombre de tu empresa, eslogan y datos de contacto de RRHH.
            </p>
          </div>

          {canPublish && (
            <button
              onClick={() => setEditingCompany(!editingCompany)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              {editingCompany ? 'Cancelar' : 'Editar Datos'}
            </button>
          )}
        </div>

        {savedSuccess && (
          <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Datos corporativos actualizados correctamente.</span>
          </div>
        )}

        {editingCompany ? (
          <form onSubmit={handleSaveCompany} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre de la Empresa</label>
                <input
                  type="text"
                  required
                  value={formCompany.name}
                  onChange={(e) => setFormCompany({ ...formCompany, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Eslogan Institucional</label>
                <input
                  type="text"
                  required
                  value={formCompany.slogan}
                  onChange={(e) => setFormCompany({ ...formCompany, slogan: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email de Contacto RRHH</label>
                <input
                  type="email"
                  required
                  value={formCompany.contactHrEmail}
                  onChange={(e) => setFormCompany({ ...formCompany, contactHrEmail: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Teléfono / Conmutador RRHH</label>
                <input
                  type="text"
                  required
                  value={formCompany.contactHrPhone}
                  onChange={(e) => setFormCompany({ ...formCompany, contactHrPhone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white font-semibold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Guardar Cambios
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700 pt-1">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 font-medium block">Nombre Oficial</span>
              <span className="font-bold text-slate-900">{companyInfo.name}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 font-medium block">Eslogan</span>
              <span className="font-bold text-slate-900">{companyInfo.slogan}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 font-medium block">Email RRHH</span>
              <span className="font-bold text-teal-800">{companyInfo.contactHrEmail}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 font-medium block">Teléfono Conmutador</span>
              <span className="font-bold text-slate-900">{companyInfo.contactHrPhone}</span>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
