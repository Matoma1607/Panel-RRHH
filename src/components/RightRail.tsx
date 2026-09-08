import React, { useState } from 'react';
import { CelebrationItem, DocumentItem, Announcement, BranchName } from '../types';
import {
  Cake,
  FileText,
  Download,
  ExternalLink,
  Mail,
  TrendingUp,
  Award,
  Sparkles,
  ChevronRight,
  Heart,
  Send,
  Building2,
  CheckCircle2
} from 'lucide-react';

interface RightRailProps {
  celebrations: CelebrationItem[];
  documents: DocumentItem[];
  announcements: Announcement[];
  userBranch: BranchName;
  onNavigateTab: (tab: string) => void;
  onDownloadDocument?: (id: string) => void;
  onSendGreeting?: (celebrationId: string, greetingData?: { authorName: string; branch?: string; message?: string }) => void;
  userName?: string;
}

export const RightRail: React.FC<RightRailProps> = ({
  celebrations,
  documents,
  announcements,
  userBranch,
  onNavigateTab,
  onDownloadDocument,
  onSendGreeting,
  userName
}) => {
  const [greetingSuccessId, setGreetingSuccessId] = useState<string | null>(null);
  const [quickGreetingText, setQuickGreetingText] = useState<{ [id: string]: string }>({});

  // Sort upcoming celebrations by date
  const upcomingCelebrations = [...celebrations].slice(0, 3);

  // Recent documents (newest 3)
  const recentDocs = [...documents].slice(0, 3);

  // Stats calculation
  const totalAnnouncementsThisMonth = announcements.length;
  const readEngagement = '98%';

  const handleQuickGreeting = (celId: string) => {
    if (onSendGreeting) {
      const msg = quickGreetingText[celId]?.trim() || '¡Muchas felicidades en tu día!';
      onSendGreeting(celId, {
        authorName: userName || 'Colaborador',
        branch: userBranch,
        message: msg
      });
      setGreetingSuccessId(celId);
      setTimeout(() => {
        setGreetingSuccessId(null);
      }, 2500);
    }
  };

  return (
    <aside className="w-[280px] shrink-0 hidden xl:flex flex-col gap-3.5">
      
      {/* 1. Cumpleaños Próximos */}
      <div className="bg-white rounded-lg border border-[#dbe2dc] p-3.5 shadow-2xs">
        <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-[#dbe2dc]/70">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#a98a3f]/10 text-[#a98a3f] flex items-center justify-center">
              <Cake className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-bold text-[#0f2620] uppercase tracking-wide">
              Cumpleaños Próximos
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('celebrations')}
            className="text-[11px] font-semibold text-[#1c3d34] hover:text-[#0f2620] flex items-center gap-0.5 hover:underline cursor-pointer"
          >
            <span>Ver todos</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-2.5">
          {upcomingCelebrations.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-2">
              No hay cumpleaños registrados este mes.
            </p>
          ) : (
            upcomingCelebrations.map((item) => {
              const initial = item.employeeName?.charAt(0) || 'C';
              const isGreetingSent = greetingSuccessId === item.id;

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-2 p-2 rounded-md bg-[#eef1ee]/50 border border-[#dbe2dc]/60 hover:bg-[#eef1ee] transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#1c3d34] text-white flex items-center justify-center text-xs font-bold shrink-0">
                      {initial}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#0f2620] truncate">
                        {item.employeeName}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">
                        {item.department || item.date} • {item.date}
                      </p>
                    </div>
                  </div>

                  {isGreetingSent ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md shrink-0 flex items-center gap-1 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      Enviado
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleQuickGreeting(item.id)}
                      className="px-2 py-1 rounded-md text-[10px] font-bold bg-white hover:bg-[#a98a3f] text-[#a98a3f] hover:text-white border border-[#a98a3f]/30 hover:border-[#a98a3f] transition-all shrink-0 cursor-pointer shadow-2xs"
                      title="Enviar saludo rápido"
                    >
                      🎉 Saludar
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 2. Documentos Recientes */}
      <div className="bg-white rounded-lg border border-[#dbe2dc] p-3.5 shadow-2xs">
        <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-[#dbe2dc]/70">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#1c3d34]/10 text-[#1c3d34] flex items-center justify-center">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-bold text-[#0f2620] uppercase tracking-wide">
              Documentos Recientes
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('documents')}
            className="text-[11px] font-semibold text-[#1c3d34] hover:text-[#0f2620] flex items-center gap-0.5 hover:underline cursor-pointer"
          >
            <span>Ver todos</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-2">
          {recentDocs.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-2">
              No hay documentos disponibles.
            </p>
          ) : (
            recentDocs.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between gap-2 p-2 rounded-md border border-[#dbe2dc]/60 hover:bg-[#eef1ee]/50 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="px-1.5 py-0.5 text-[9px] font-black rounded bg-slate-100 text-slate-700 border border-slate-200 uppercase shrink-0">
                    {doc.fileType || 'PDF'}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#0f2620] truncate" title={doc.title}>
                      {doc.title}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {doc.fileSize || '1.2 MB'} • {doc.category}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onDownloadDocument ? onDownloadDocument(doc.id) : onNavigateTab('documents')}
                  className="p-1.5 rounded-md hover:bg-slate-100 text-[#1c3d34] transition-colors shrink-0 cursor-pointer"
                  title="Abrir o descargar documento"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 3. Grilla de Estadísticas del Mes */}
      <div className="bg-white rounded-lg border border-[#dbe2dc] p-3.5 shadow-2xs">
        <h4 className="text-[11px] font-bold text-[#0f2620]/70 uppercase tracking-wider mb-2.5">
          Actividad del Mes
        </h4>
        <div className="grid grid-cols-2 gap-2">
          
          <div className="p-2.5 rounded-md bg-[#eef1ee] border border-[#dbe2dc]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#1c3d34]">
              Comunicados
            </span>
            <div className="text-2xl font-black text-[#0f2620] leading-tight mt-0.5">
              {totalAnnouncementsThisMonth}
            </div>
            <span className="text-[10px] text-slate-500">
              Publicados
            </span>
          </div>

          <div className="p-2.5 rounded-md bg-[#eef1ee] border border-[#dbe2dc]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#1c3d34]">
              Lectura
            </span>
            <div className="text-2xl font-black text-[#0f2620] leading-tight mt-0.5">
              {readEngagement}
            </div>
            <span className="text-[10px] text-slate-500">
              Sedes activas
            </span>
          </div>

        </div>
      </div>

      {/* 4. Bloque de Contacto / Ayuda (Fondo Oscuro Contrastante) */}
      <div className="rounded-lg bg-[#0f2620] text-white p-3.5 border border-[#1c3d34] shadow-xs">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-6 h-6 rounded-md bg-[#1c3d34] text-[#a98a3f] flex items-center justify-center">
            <Mail className="w-3.5 h-3.5" />
          </div>
          <h4 className="text-xs font-bold tracking-wide uppercase text-white">
            Mesa de Ayuda RRHH
          </h4>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
          ¿Dudas sobre tus recibos, licencias o reglamentos internos de Solmar?
        </p>
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
          <div className="min-w-0">
            <p className="text-[10px] text-slate-400">Contacto directo</p>
            <p className="text-[11px] font-bold text-white truncate">
              cbitar@solmar.com.ar
            </p>
          </div>
          <a
            href="mailto:cbitar@solmar.com.ar?subject=Consulta%20Portal%20SOLMAR"
            className="px-2.5 py-1.5 rounded-md bg-[#1c3d34] hover:bg-[#a98a3f] text-white text-[10px] font-bold transition-colors shrink-0 shadow-2xs"
          >
            Escribir
          </a>
        </div>
      </div>

    </aside>
  );
};
