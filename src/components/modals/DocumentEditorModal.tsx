import React, { useState, useEffect, useRef } from 'react';
import { DocumentItem, DocumentCategory, BranchName, ALL_BRANCHES } from '../../types';
import { X, FileText, Upload, CheckCircle2, FileSpreadsheet, FileCode, Paperclip, AlertCircle, Trash2, FolderOpen, Building2, Lock, Globe } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<DocumentItem> & { id?: string }) => void;
  editingDocument?: DocumentItem | null;
}

const CATEGORIES: DocumentCategory[] = ['Reglamentos', 'Políticas', 'Formularios', 'Guías', 'General', 'Beneficios', 'Recibos'];

export const DocumentEditorModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  editingDocument,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('Políticas');
  const [targetBranch, setTargetBranch] = useState<'Todas' | BranchName>('Todas');
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
      setTargetBranch(editingDocument.targetBranch || 'Todas');
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
      setTargetBranch('Todas');
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
      targetBranch,
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
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
        className="bg-white w-full max-w-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 p-4 sm:p-6 relative max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto"
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
          className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4 sm:mb-5 pb-3 border-b border-slate-100 pr-8">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base sm:text-lg">
              {editingDocument ? 'Editar Documento' : 'Subir Documento (PDF o Word)'}
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500">
              Carga un archivo oficial PDF, Word (.docx) o Excel y define la sucursal.
            </p>
          </div>
        </div>

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
                  <span>Exclusivo Sucursal</span>
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

            <p className="text-[11px] text-slate-500 leading-relaxed">
              {targetBranch === 'Todas' ? (
                <span>Cualquier empleado de cualquier sucursal podrá consultar y descargar este documento.</span>
              ) : (
                <span className="text-amber-800 font-medium">
                  🔒 Privacidad activa: Únicamente los empleados de <strong>{targetBranch}</strong> podrán acceder a este archivo.
                </span>
              )}
            </p>
          </div>

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
              className={`p-3.5 sm:p-4 border-2 border-dashed rounded-2xl transition-all flex flex-col items-center justify-center text-center ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-50 scale-[0.99]'
                  : uploadedFileName
                  ? 'border-emerald-300 bg-emerald-50/40'
                  : 'border-slate-300 bg-slate-50 hover:bg-slate-100/70 hover:border-slate-400'
              }`}
            >
              {uploadedFileName ? (
                <div className="w-full space-y-3">
                  <div className="flex items-center gap-3 w-full px-2.5 py-2 bg-white rounded-xl border border-emerald-200 shadow-xs">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      {isReadingFile ? (
                        <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-6 h-6" />
                      )}
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                        {uploadedFileName}
                      </p>
                      <p className="text-[11px] text-emerald-700 font-medium">
                        Formato {fileType} • {fileSize}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 transition-colors cursor-pointer"
                      >
                        Cambiar
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Quitar archivo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 py-1.5 w-full flex flex-col items-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white shadow-xs border border-slate-200 text-[#38484c] flex items-center justify-center">
                    <FolderOpen className="w-5 h-5 sm:w-6 sm:h-6 text-[#38484c]" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-xs sm:text-sm">
                      Toca para buscar o arrastrá tu PDF/Word aquí
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Formatos admitidos: <span className="font-medium text-slate-700">PDF, DOCX, XLSX</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 sm:py-2 bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 shadow-xs transition-colors cursor-pointer"
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
              placeholder="Ej: Procedimiento Operativo Sucursal 2026"
              className="w-full px-3 py-2.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-[#38484c]"
            />
          </div>

          {/* Category & Format */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
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
              <label className="block font-bold text-slate-700 mb-1">Formato</label>
              <select
                value={fileType}
                onChange={(e) => setFileType(e.target.value as any)}
                className="w-full px-3 py-2.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm sm:text-xs focus:outline-none focus:border-[#38484c]"
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
              className="w-full px-3 py-2.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm sm:text-xs focus:outline-none focus:border-[#38484c] resize-y"
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
              className="w-full px-3 py-2.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm sm:text-xs focus:outline-none focus:border-[#38484c] resize-y"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-200 transition-colors cursor-pointer text-center"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isReadingFile}
              className="w-full sm:w-auto px-5 py-2.5 sm:py-2 bg-[#38484c] text-white font-semibold text-xs rounded-xl hover:bg-[#2c393c] shadow-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
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
