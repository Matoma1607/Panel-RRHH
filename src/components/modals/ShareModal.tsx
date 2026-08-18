import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  MessageCircle,
  Mail,
  ExternalLink,
  Sparkles,
  FileText,
  Megaphone,
  Cake
} from 'lucide-react';
import { Announcement, DocumentItem, CelebrationItem } from '../../types';

export type ShareItemType = 'announcement' | 'document' | 'celebration';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Announcement | DocumentItem | CelebrationItem | null;
  type: ShareItemType;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  item,
  type
}) => {
  const [copiedText, setCopiedText] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen || !item) return null;

  const origin = window.location.origin;
  const pathname = window.location.pathname;

  let title = '';
  let shareUrl = '';
  let fullFormattedText = '';
  let headerBadge = '';
  let IconComponent = Megaphone;

  if (type === 'announcement') {
    const ann = item as Announcement;
    title = ann.title;
    shareUrl = `${origin}${pathname}?announcement=${ann.id}`;
    headerBadge = 'Comunicado Oficial';
    IconComponent = Megaphone;

    fullFormattedText = `📢 *COMUNICADO OFICIAL | ÓPTICA SOLMAR*

📌 *${ann.title}*
🏢 Categoría: ${ann.category}
📅 Fecha: ${ann.date}
✍️ Publicado por: ${ann.author || 'Recursos Humanos'}

━━━━━━━━━━━━━━━━━━━━
📝 *Detalle:*
${ann.content}
━━━━━━━━━━━━━━━━━━━━

🔗 *Acceso directo al portal interno:*
${shareUrl}`;
  } else if (type === 'document') {
    const doc = item as DocumentItem;
    title = doc.title;
    shareUrl = `${origin}${pathname}?document=${doc.id}`;
    headerBadge = 'Documento Corporativo';
    IconComponent = FileText;

    fullFormattedText = `📄 *DOCUMENTO OFICIAL | ÓPTICA SOLMAR*

📌 *${doc.title}*
📂 Categoría: ${doc.category}
📊 Formato: ${doc.fileType} (${doc.fileSize})
📅 Actualizado: ${doc.updatedDate}

📝 *Descripción:*
${doc.description || 'Documento disponible para consulta del personal.'}

🔗 *Ver y descargar en el portal:*
${shareUrl}`;
  } else if (type === 'celebration') {
    const cel = item as CelebrationItem;
    title = `Festejo de ${cel.employeeName}`;
    shareUrl = `${origin}${pathname}#festejos`;
    headerBadge = cel.type === 'birthday' ? 'Cumpleaños' : 'Aniversario Laboral';
    IconComponent = Cake;

    fullFormattedText = `🎉 *RECONOCIMIENTO & FESTEJO | ÓPTICA SOLMAR*

🎂 *${cel.employeeName}*
🏢 Sector: ${cel.department}
📅 Fecha: ${cel.date}
✨ Motivo: ${cel.type === 'birthday' ? '¡Cumpleaños!' : `¡${cel.yearsAtCompany || ''} Años en la Empresa!`}

¡Sumate a dejarle tus saludos en el portal interno de SOLMAR!
🔗 ${shareUrl}`;
  }

  const handleCopyFullText = async () => {
    try {
      await navigator.clipboard.writeText(fullFormattedText);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 3000);
    } catch {
      // fallback
    }
  };

  const handleCopyLinkOnly = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    } catch {
      // fallback
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `SOLMAR: ${title}`,
          text: fullFormattedText,
          url: shareUrl,
        });
      } catch {
        // user cancelled or share failed
      }
    } else {
      handleCopyFullText();
    }
  };

  const handleWhatsAppShare = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(fullFormattedText)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleEmailShare = () => {
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(`[SOLMAR] ${title}`)}&body=${encodeURIComponent(fullFormattedText)}`;
    window.open(mailtoUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#232f32] text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base tracking-tight text-white">
                  Compartir Nota Profesional
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30">
                  {headerBadge}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Comparte la nota completa con formato oficial
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Formatted Text Preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Vista previa del mensaje a compartir:</span>
              <span className="text-[11px] text-slate-400 font-normal">Incluye título, nota y enlace</span>
            </div>
            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 text-xs text-slate-700 font-mono whitespace-pre-wrap leading-relaxed max-h-52 overflow-y-auto select-all shadow-inner">
              {fullFormattedText}
            </div>
          </div>

          {/* Quick Share Buttons */}
          <div className="space-y-2 pt-1">
            <label className="text-xs font-bold text-slate-700 block">
              Canales de envío rápido:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* WhatsApp Button */}
              <button
                onClick={handleWhatsAppShare}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs hover:shadow-sm transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Enviar por WhatsApp</span>
              </button>

              {/* Email Button */}
              <button
                onClick={handleEmailShare}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs hover:shadow-sm transition-all cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                <span>Enviar por Correo</span>
              </button>
            </div>
          </div>

          {/* Direct Copy Actions */}
          <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Copy Full Note Button */}
            <button
              onClick={handleCopyFullText}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all border cursor-pointer ${
                copiedText
                  ? 'bg-teal-700 text-white border-teal-700'
                  : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-900 shadow-xs'
              }`}
            >
              {copiedText ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>¡Nota Copiada!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar Nota Completa</span>
                </>
              )}
            </button>

            {/* Copy Link Only Button */}
            <button
              onClick={handleCopyLinkOnly}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all border cursor-pointer ${
                copiedLink
                  ? 'bg-slate-200 text-slate-900 border-slate-300'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
              }`}
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>¡Enlace Copiado!</span>
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4 text-slate-500" />
                  <span>Copiar solo Enlace</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200/80 px-5 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Formato oficial Óptica SOLMAR</span>
          </span>
          <button
            onClick={onClose}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
