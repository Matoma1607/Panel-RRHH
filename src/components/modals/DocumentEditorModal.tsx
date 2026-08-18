import React, { useState, useEffect, useRef } from 'react';
import { DocumentItem } from '../../types';
import { X, FileText, Upload, CheckCircle2, FileSpreadsheet, FileCode, Paperclip, AlertCircle, Trash2, FolderOpen } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<DocumentItem> & { id?: string }) => void;
  editingDocument?: DocumentItem | null;
}

const CATEGORIES = ['Reglamentos', 'Políticas', 'Formularios', 'Guías', 'Beneficios', 'Recibos'] as const;

export const DocumentEditorModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  editingDocument,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('Políticas');
  const [description, setDescription] = useState('');
  const [fileType, setFileType] = useState<'PDF' | 'DOCX' | 'XLSX'>('PDF');
  const [fileSize, setFileSize] = useState('1.5 MB');
  const [contentSnippet, setContentSnippet] = useState('');
  
  // Real file upload state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileDataUrl, setUploadedFileDataUrl] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [isReadingFile, setIsReadingFile] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Global drag-and-drop prevention to avoid browser opening PDF in full tab
  useEffect(() => {
    if (!isOpen) return;

    const preventDefaultWindowDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    window.addEventListener('dragover', preventDefaultWindowDrop, false);
    window.addEventListener('drop', preventDefaultWindowDrop, false);

    return () => {
      window.removeEventListener('dragover', preventDefaultWindowDrop, false);
      window.removeEventListener('drop', preventDefaultWindowDrop, false);
    };
  }, [isOpen]);

  useEffect(() => {
    if (editingDocument) {
      setTitle(editingDocument.title);
      setCategory(editingDocument.category);
      setDescription(editingDocument.description);
      setFileType(editingDocument.fileType);
      setFileSize(editingDocument.fileSize);
      setContentSnippet(editingDocument.contentSnippet || '');
      setUploadedFileName(editingDocument.fileName || editingDocument.title);
      setUploadedFileDataUrl(editingDocument.fileData || editingDocument.fileUrl || '');
      setUploadedFile(null);
    } else {
      setTitle('');
      setCategory('Políticas');
      setDescription('');
      setFileType('PDF');
      setFileSize('1.8 MB');
      setContentSnippet('');
      setUploadedFile(null);
      setUploadedFileDataUrl('');
      setUploadedFileName('');
    }
  }, [editingDocument, isOpen]);

  if (!isOpen) return null;

  const processSelectedFile = (file: File) => {
    try {
      setIsReadingFile(true);
      const name = file.name;
      const lowerName = name.toLowerCase();
      
      let detectedType: 'PDF' | 'DOCX' | 'XLSX' = 'PDF';
      if (lowerName.endsWith('.docx') || lowerName.endsWith('.doc')) {
        detectedType = 'DOCX';
      } else if (lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls') || lowerName.endsWith('.csv')) {
        detectedType = 'XLSX';
      } else {
        detectedType = 'PDF';
      }

      // Size formatting
      const sizeMb = file.size / (1024 * 1024);
      const formattedSize = sizeMb >= 1 ? `${sizeMb.toFixed(1)} MB` : `${(file.size / 1024).toFixed(0)} KB`;

      setUploadedFile(file);
      setUploadedFileName(name);
      setFileType(detectedType);
      setFileSize(formattedSize);

      // Auto-fill title if empty
      if (!title || title.trim() === '') {
        const cleanTitle = name.replace(/\.[^/.]+$/, '');
        setTitle(cleanTitle);
      }

      // Read as Base64 Data URL so it can be previewed or downloaded directly
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setUploadedFileDataUrl(reader.result);
        }
        setIsReadingFile(false);
      };
      reader.onerror = () => {
        setIsReadingFile(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error reading file:', err);
      setIsReadingFile(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
    // Reset file input value so selecting the same file again triggers change
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setUploadedFile(null);
    setUploadedFileName('');
    setUploadedFileDataUrl('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Ensure clean final filename title
    let finalTitle = title.trim();
    const ext = fileType.toLowerCase();
    if (!finalTitle.toLowerCase().endsWith(`.${ext}`)) {
      finalTitle = `${finalTitle}.${ext}`;
    }

    onSave({
      id: editingDocument?.id,
      title: finalTitle,
      category,
      description: description.trim(),
      fileType,
      fileSize,
      contentSnippet: contentSnippet.trim() || description.trim(),
      fileName: uploadedFileName || finalTitle,
      fileData: uploadedFileDataUrl || editingDocument?.fileData || undefined,
      fileUrl: uploadedFileDataUrl || editingDocument?.fileUrl || undefined,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <div
        className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-100 p-6 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">
              {editingDocument ? 'Editar Documento' : 'Subir Documento (PDF o Word)'}
            </h3>
            <p className="text-xs text-slate-500">
              Carga un archivo oficial PDF, Word (.docx) o Excel para que los colaboradores puedan consultarlo y descargarlo.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* File Selector & Drag Area */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Archivo Adjunto (PDF, Word o Excel)
            </label>
            
            <input
              id="document-file-input"
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.xlsx,.xls"
              onChange={handleFileInputChange}
              className="hidden"
            />

            <div
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`p-4 border-2 border-dashed rounded-2xl transition-all flex flex-col items-center justify-center text-center ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-50 scale-[0.99]'
                  : uploadedFileName
                  ? 'border-emerald-300 bg-emerald-50/40'
                  : 'border-slate-300 bg-slate-50 hover:bg-slate-100/70 hover:border-slate-400'
              }`}
            >
              {uploadedFileName ? (
                <div className="w-full space-y-3">
                  <div className="flex items-center gap-3 w-full px-2 py-1 bg-white rounded-xl border border-emerald-200 p-2 shadow-xs">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      {isReadingFile ? (
                        <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-6 h-6" />
                      )}
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="font-bold text-slate-900 text-xs truncate">
                        {uploadedFileName}
                      </p>
                      <p className="text-[11px] text-emerald-700 font-medium">
                        Formato {fileType} • {fileSize} • Archivo listo para descarga
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 transition-colors"
                      >
                        Cambiar
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Quitar archivo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5 py-2 w-full flex flex-col items-center">
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-slate-200 text-[#38484c] flex items-center justify-center">
                    <FolderOpen className="w-6 h-6 text-[#38484c]" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-xs">
                      Arrastrá tu archivo PDF o Word aquí
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Formatos admitidos: <span className="font-medium text-slate-700">PDF, DOCX, XLSX</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 shadow-xs transition-colors cursor-pointer"
                  >
                    <Paperclip className="w-3.5 h-3.5 text-[#38484c]" />
                    <span>Seleccionar archivo desde el equipo</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Title input */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Título del Documento</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Reglamento Interno de Trabajo 2026"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-[#38484c]"
            />
          </div>

          {/* Category & Format */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
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
              <label className="block font-bold text-slate-700 mb-1">Formato</label>
              <select
                value={fileType}
                onChange={(e) => setFileType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-[#38484c]"
              >
                <option value="PDF">PDF (.pdf)</option>
                <option value="DOCX">Word (.docx)</option>
                <option value="XLSX">Excel (.xlsx)</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Descripción para Colaboradores</label>
            <textarea
              required
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Indica qué información contiene y a quién está dirigido..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-[#38484c]"
            />
          </div>

          {/* Content / Snippet for reading preview */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>Texto / Resumen para Lectura Rápida (Opcional)</span>
              <span className="text-[10px] text-slate-400">Puntos clave</span>
            </label>
            <textarea
              rows={3}
              value={contentSnippet}
              onChange={(e) => setContentSnippet(e.target.value)}
              placeholder="Puntos clave, artículos o resumen del documento para lectura directa en pantalla..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-[#38484c]"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isReadingFile}
              className="px-4 py-2 bg-[#38484c] text-white font-semibold rounded-xl hover:bg-[#2c393c] shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{editingDocument ? 'Guardar Cambios' : 'Subir y Publicar Documento'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
