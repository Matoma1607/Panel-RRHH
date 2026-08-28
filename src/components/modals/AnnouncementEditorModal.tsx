import React, { useState, useEffect, useRef } from 'react';
import { Announcement, CategoryType, BranchName, ALL_BRANCHES } from '../../types';
import { X, Newspaper, Image as ImageIcon, Pin, Upload, Trash2, Link, FileImage, Building2, Globe, Lock } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Announcement> & { id?: string }) => void;
  editingAnnouncement?: Announcement | null;
}

const CATEGORIES: CategoryType[] = ['General', 'Eventos', 'Políticas', 'Urgente'];

export const AnnouncementEditorModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  editingAnnouncement,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<CategoryType>('General');
  const [targetBranch, setTargetBranch] = useState<'Todas' | BranchName>('Todas');
  const [pinned, setPinned] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload');
  const [author, setAuthor] = useState('Gabinete de RRHH');
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingAnnouncement) {
      setTitle(editingAnnouncement.title);
      setContent(editingAnnouncement.content);
      setCategory(editingAnnouncement.category);
      setTargetBranch(editingAnnouncement.targetBranch || 'Todas');
      setPinned(editingAnnouncement.pinned);
      setImageUrl(editingAnnouncement.imageUrl || '');
      setImageMode(editingAnnouncement.imageUrl && !editingAnnouncement.imageUrl.startsWith('data:') ? 'url' : 'upload');
      setAuthor(editingAnnouncement.author);
    } else {
      setTitle('');
      setContent('');
      setCategory('General');
      setTargetBranch('Todas');
      setPinned(false);
      setImageUrl('');
      setImageMode('upload');
      setAuthor('Gabinete de RRHH');
    }
  }, [editingAnnouncement, isOpen]);

  if (!isOpen) return null;

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un formato de imagen válido (PNG, JPG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawDataUrl = event.target?.result as string;
      const img = new window.Image();
      img.onload = () => {
        const maxDim = 960;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.78);
          setImageUrl(compressed);
        } else {
          setImageUrl(rawDataUrl);
        }
      };
      img.onerror = () => {
        setImageUrl(rawDataUrl);
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: editingAnnouncement?.id,
      title: title.trim(),
      content: content.trim(),
      category,
      targetBranch,
      pinned,
      imageUrl: imageUrl.trim() || undefined,
      author: author.trim() || 'Gabinete de RRHH',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 p-4 sm:p-6 relative max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="font-bold text-slate-900 text-base sm:text-lg mb-3 sm:mb-4 flex items-center gap-2 pr-8">
          <Newspaper className="w-5 h-5 text-[#38484c] shrink-0" />
          <span>{editingAnnouncement ? 'Editar Comunicado' : 'Nuevo Comunicado de RRHH'}</span>
        </h3>

        <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4 text-xs">
          {/* Branch Target Selector (Sucursal) */}
          <div className="bg-slate-50 p-3 sm:p-3.5 rounded-2xl border border-slate-200/90 space-y-2">
            <label className="block font-bold text-slate-800 flex flex-wrap items-center justify-between gap-1.5">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-teal-700 shrink-0" />
                <span>Sucursal de Destino (Visibilidad)</span>
              </span>
              {targetBranch === 'Todas' ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  <span>Público General</span>
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-amber-700" />
                  <span>Exclusivo {targetBranch}</span>
                </span>
              )}
            </label>

            <select
              value={targetBranch}
              onChange={(e) => setTargetBranch(e.target.value as any)}
              className="w-full px-3 py-2.5 sm:py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm sm:text-xs font-semibold focus:outline-none focus:border-teal-700"
            >
              <option value="Todas">🌐 Todas las sucursales (Visible para todo el personal)</option>
              {ALL_BRANCHES.map((b) => (
                <option key={b} value={b}>
                  📍 {b} (Solo visible para colaboradores de {b})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Título del Anuncio</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: ¡Novedad en sucursal y beneficios para el equipo!"
              className="w-full px-3 py-2.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-[#38484c]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryType)}
                className="w-full px-3 py-2.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm sm:text-xs focus:outline-none focus:border-[#38484c]"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Emisor / Firma</label>
              <input
                type="text"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Ej: Gabinete de RRHH"
                className="w-full px-3 py-2.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm sm:text-xs focus:outline-none focus:border-[#38484c]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Contenido del Comunicado</label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escribe el texto completo de la noticia..."
              className="w-full px-3 py-2.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm sm:text-xs focus:outline-none focus:border-[#38484c] leading-relaxed resize-y"
            />
          </div>

          {/* Image Upload / URL Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
              <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                <span>Imagen Ilustrativa (opcional)</span>
              </label>

              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[11px]">
                <button
                  type="button"
                  onClick={() => setImageMode('upload')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                    imageMode === 'upload' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Desde tu PC
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('url')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                    imageMode === 'url' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Enlace URL
                </button>
              </div>
            </div>

            {imageMode === 'upload' ? (
              <div>
                {/* Hidden real file input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                {imageUrl ? (
                  /* Preview with remove/replace actions */
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 group">
                    <img
                      src={imageUrl}
                      alt="Vista previa"
                      className="w-full h-40 sm:h-44 object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-2 bg-white text-slate-800 rounded-xl font-semibold text-xs hover:bg-slate-100 shadow-md flex items-center gap-1.5 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Cambiar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="px-3 py-2 bg-red-600 text-white rounded-xl font-semibold text-xs hover:bg-red-700 shadow-md flex items-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Quitar</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Drag and drop upload box */
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-4 sm:p-5 text-center cursor-pointer transition-all ${
                      isDragging
                        ? 'border-[#38484c] bg-teal-50/50'
                        : 'border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-10 h-10 mx-auto mb-2 rounded-2xl bg-teal-50 text-[#38484c] flex items-center justify-center">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="font-semibold text-slate-800 text-xs">
                      Toca para buscar una foto o arrastrala aquí
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      PNG, JPG, JPEG, WEBP o GIF
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm sm:text-xs focus:outline-none focus:border-[#38484c]"
                />
                {imageUrl && (
                  <div className="mt-2 relative rounded-xl overflow-hidden border border-slate-200 h-28 sm:h-32 bg-slate-100">
                    <img
                      src={imageUrl}
                      alt="Vista previa URL"
                      className="w-full h-full object-cover"
                      onError={() => {}}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="pinned"
              checked={pinned}
              onChange={(e) => setPinned(e.target.checked)}
              className="rounded text-[#38484c] focus:ring-[#38484c] w-4 h-4 cursor-pointer"
            />
            <label htmlFor="pinned" className="font-semibold text-slate-800 text-xs flex items-center gap-1 cursor-pointer">
              <Pin className="w-3.5 h-3.5 text-[#38484c]" />
              <span>Fijar arriba en la cartelera digital</span>
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-slate-100 text-slate-700 font-semibold text-xs sm:text-xs rounded-xl hover:bg-slate-200 transition-colors cursor-pointer text-center"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 sm:py-2 bg-[#38484c] text-white font-semibold text-xs sm:text-xs rounded-xl hover:bg-[#2c393c] shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Newspaper className="w-3.5 h-3.5" />
              <span>{editingAnnouncement ? 'Guardar Cambios' : 'Publicar Ahora'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
