import React, { useState, useEffect, useRef } from 'react';
import { Announcement, CategoryType } from '../../types';
import { X, Newspaper, Image as ImageIcon, Pin, Upload, Trash2, Link, FileImage } from 'lucide-react';

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
      setPinned(editingAnnouncement.pinned);
      setImageUrl(editingAnnouncement.imageUrl || '');
      setImageMode(editingAnnouncement.imageUrl && !editingAnnouncement.imageUrl.startsWith('data:') ? 'url' : 'upload');
      setAuthor(editingAnnouncement.author);
    } else {
      setTitle('');
      setContent('');
      setCategory('General');
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
        const maxDim = 1200;
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
          const compressed = canvas.toDataURL('image/jpeg', 0.85);
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
      pinned,
      imageUrl: imageUrl.trim() || undefined,
      author: author.trim() || 'Gabinete de RRHH',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-100 p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-[#38484c]" />
          <span>{editingAnnouncement ? 'Editar Comunicado' : 'Nuevo Comunicado de RRHH'}</span>
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Título del Anuncio</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: ¡Lanzamiento del programa de trabajo híbrido!"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-[#38484c]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryType)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-[#38484c]"
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
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-[#38484c]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Contenido del Comunicado</label>
            <textarea
              required
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escribe el texto completo de la noticia..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-[#38484c] leading-relaxed"
            />
          </div>

          {/* Image Upload / URL Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                <span>Imagen Ilustrativa (opcional)</span>
              </label>

              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[11px]">
                <button
                  type="button"
                  onClick={() => setImageMode('upload')}
                  className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                    imageMode === 'upload' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Desde tu PC
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('url')}
                  className={`px-2 py-0.5 rounded-md font-medium transition-all ${
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
                      className="w-full h-44 object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-white text-slate-800 rounded-xl font-semibold text-xs hover:bg-slate-100 shadow-md flex items-center gap-1.5 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Cambiar Imagen</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="px-3 py-1.5 bg-red-600 text-white rounded-xl font-semibold text-xs hover:bg-red-700 shadow-md flex items-center gap-1.5 cursor-pointer"
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
                    className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                      isDragging
                        ? 'border-[#38484c] bg-teal-50/50'
                        : 'border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-10 h-10 mx-auto mb-2 rounded-2xl bg-teal-50 text-[#38484c] flex items-center justify-center">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="font-semibold text-slate-800 text-xs">
                      Haz clic para buscar en tu PC o arrastrá una imagen aquí
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Formatos compatibles: PNG, JPG, JPEG, WEBP o GIF
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
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-[#38484c]"
                />
                {imageUrl && (
                  <div className="mt-2 relative rounded-xl overflow-hidden border border-slate-200 h-32 bg-slate-100">
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

          <div className="flex items-center gap-2 pt-2">
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

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#38484c] text-white font-semibold rounded-xl hover:bg-[#2c393c] shadow-xs cursor-pointer"
            >
              {editingAnnouncement ? 'Guardar Cambios' : 'Publicar Ahora'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
