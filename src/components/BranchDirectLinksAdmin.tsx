import React, { useState } from 'react';
import { ALL_BRANCHES, BranchName, getBranchSlug, DocumentItem, Announcement } from '../types';
import {
  Building2,
  Copy,
  Check,
  MessageCircle,
  ExternalLink,
  Plus,
  FileText,
  Search,
  Share2,
  Sparkles,
  Lock,
  Globe,
  MapPin
} from 'lucide-react';

interface BranchDirectLinksAdminProps {
  documents: DocumentItem[];
  announcements: Announcement[];
  onNewDocumentForBranch: (branch: BranchName) => void;
  onNavigateTab: (tab: string) => void;
}

export const BranchDirectLinksAdmin: React.FC<BranchDirectLinksAdminProps> = ({
  documents,
  announcements,
  onNewDocumentForBranch,
  onNavigateTab,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const origin = window.location.origin;
  const pathname = window.location.pathname;

  const filteredBranches = ALL_BRANCHES.filter((b) =>
    b.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopyLink = async (branch: BranchName) => {
    const slug = getBranchSlug(branch);
    const url = `${origin}${pathname}?sucursal=${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 2500);
    } catch {
      // fallback
    }
  };

  const handleSendWhatsApp = (branch: BranchName) => {
    const slug = getBranchSlug(branch);
    const branchUrl = `${origin}${pathname}?sucursal=${slug}`;
    const message = `👋 ¡Hola equipo de *${branch}*!

Les compartimos el enlace de acceso directo oficial al *Portal Interno de RRHH de Óptica SOLMAR*:
🔗 ${branchUrl}

📌 *Recomendación:* Guarden este enlace en la barra de favoritos de la computadora de la sucursal para consultar reglamentos, novedades y documentos oficiales en cualquier momento.

Saludos cordiales,
*Recursos Humanos SOLMAR*`;

    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleTestLink = (branch: BranchName) => {
    const slug = getBranchSlug(branch);
    const branchUrl = `${origin}${pathname}?sucursal=${slug}`;
    window.open(branchUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-800 text-white flex items-center justify-center font-bold shadow-xs">
            <Building2 className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-base">
                📍 Enlaces Directos y Difusión por Sucursal
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                11 Sucursales
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Envía el enlace oficial a cada local por WhatsApp o configúralo en las computadoras de cada sucursal.
            </p>
          </div>
        </div>

        {/* Search within branches */}
        <div className="relative sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar sucursal..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-teal-700"
          />
        </div>
      </div>

      {/* Info Tip */}
      <div className="p-3.5 bg-teal-50/60 border border-teal-200/80 rounded-2xl flex items-start gap-2.5 text-xs text-teal-950">
        <Sparkles className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>¿Cómo funciona el enlace directo?</strong> Al ingresar desde el enlace de su local, el portal queda bloqueado en esa sucursal, mostrando sus documentos exclusivos y notificando a los colaboradores las novedades correspondientes.
        </p>
      </div>

      {/* Grid of 11 Branches */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBranches.map((branch) => {
          const slug = getBranchSlug(branch);
          const branchUrl = `${origin}${pathname}?sucursal=${slug}`;
          const isCopied = copiedSlug === slug;
          
          const exclusiveDocs = documents.filter((d) => d.targetBranch === branch);
          const exclusiveAnns = announcements.filter((a) => a.targetBranch === branch);

          return (
            <div
              key={branch}
              className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-4 flex flex-col justify-between space-y-3 hover:border-slate-300 hover:shadow-xs transition-all"
            >
              <div>
                {/* Branch Header */}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-teal-900/10 text-teal-800 flex items-center justify-center font-bold">
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                      {branch}
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-200/70 text-slate-700">
                    ?sucursal={slug}
                  </span>
                </div>

                {/* Exclusive Docs Stats */}
                <div className="text-[11px] text-slate-500 flex items-center gap-3 py-1">
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <FileText className="w-3 h-3 text-teal-700" />
                    {exclusiveDocs.length} {exclusiveDocs.length === 1 ? 'doc. exclusivo' : 'docs. exclusivos'}
                  </span>
                  <span>•</span>
                  <span>{exclusiveAnns.length} comunicados</span>
                </div>

                {/* Direct Link Preview Box */}
                <div className="mt-2 p-2 bg-white rounded-xl border border-slate-200/90 text-[11px] font-mono text-slate-600 truncate select-all flex items-center justify-between gap-1">
                  <span className="truncate">{branchUrl}</span>
                  <button
                    onClick={() => handleTestLink(branch)}
                    title="Probar enlace directo"
                    className="p-1 text-slate-400 hover:text-teal-800 rounded transition-colors cursor-pointer shrink-0"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-2 border-t border-slate-200/60 flex items-center gap-2">
                {/* Copy Link Button */}
                <button
                  onClick={() => handleCopyLink(branch)}
                  className={`flex-1 py-1.5 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all border cursor-pointer ${
                    isCopied
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-2xs'
                  }`}
                  title="Copiar enlace directo"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3 h-3 text-white" />
                      <span>¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-slate-500" />
                      <span>Copiar Enlace</span>
                    </>
                  )}
                </button>

                {/* WhatsApp Direct Share Button */}
                <button
                  onClick={() => handleSendWhatsApp(branch)}
                  className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                  title="Enviar acceso por WhatsApp a esta sucursal"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">WhatsApp</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
